/**
 * Backup Controller
 * Handles database backup and restore operations
 */

const { ObjectId } = require('mongodb');
const { AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, COLLECTIONS } = require('../constants');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Backup directory
const BACKUP_DIR = path.join(__dirname, '../../backups');

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Get backup statistics
 */
const getBackupStats = async (req, res) => {
  const db = req.db;

  // Count total backups
  const totalBackups = await db.collection('backups').countDocuments();

  // Get total size
  const backups = await db.collection('backups').find({}).toArray();
  const totalSize = backups.reduce((sum, backup) => sum + (backup.size || 0), 0);

  // Get most recent backup
  const recentBackup = await db.collection('backups')
    .find({})
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  // Get schedule config
  const scheduleConfig = await db.collection('backup_schedule')
    .findOne({ type: 'auto' }) || {
    enabled: false,
    frequency: 'daily',
    time: '02:00',
    retention: 30
  };

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      totalBackups,
      totalSize,
      lastBackup: recentBackup[0] || null,
      schedule: scheduleConfig
    }
  });
};

/**
 * Get all backups with pagination
 */
const getAllBackups = async (req, res) => {
  const db = req.db;
  const { page = 1, limit = 10, type = '', status = '', search = '' } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Get backups
  const backups = await db.collection('backups')
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .toArray();

  const total = await db.collection('backups').countDocuments(filter);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      backups,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
};

/**
 * Get backup by ID
 */
const getBackupById = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const backup = await db.collection('backups').findOne({ _id: new ObjectId(id) });

  if (!backup) {
    throw new AppError('Không tìm thấy backup', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: backup
  });
};

/**
 * Create manual backup
 */
const createBackup = async (req, res) => {
  const db = req.db;
  const { name, description, type = 'manual' } = req.body;

  await ensureBackupDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = name || `backup_${timestamp}`;
  const fileName = `${backupName}.archive`;
  const filePath = path.join(BACKUP_DIR, fileName);

  const newBackup = {
    name: backupName,
    description: description || '',
    type, // manual, auto, scheduled
    status: 'pending',
    filePath: fileName,
    size: 0,
    collections: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insert backup record
  const result = await db.collection('backups').insertOne(newBackup);
  const backupId = result.insertedId;

  // Start backup process in background
  performBackup(db, backupId, filePath).catch(err => {
    console.error('Backup failed:', err);
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Đang tạo backup, vui lòng đợi...',
    data: {
      _id: backupId,
      ...newBackup
    }
  });
};

/**
 * Perform actual backup (background task)
 */
async function performBackup(db, backupId, filePath) {
  try {
    // Update status to in-progress
    await db.collection('backups').updateOne(
      { _id: backupId },
      { 
        $set: { 
          status: 'in-progress',
          updatedAt: new Date()
        }
      }
    );

    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).filter(name => !name.startsWith('system.'));

    // MongoDB connection string (adjust as needed)
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbName = db.databaseName;

    // Use mongodump command
    const command = `mongodump --uri="${mongoUri}" --db="${dbName}" --archive="${filePath}" --gzip`;
    
    await execPromise(command);

    // Get file size
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    // Update backup record
    await db.collection('backups').updateOne(
      { _id: backupId },
      {
        $set: {
          status: 'completed',
          size: fileSize,
          collections: collectionNames,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    console.log(`Backup ${backupId} completed successfully`);
  } catch (error) {
    console.error('Backup error:', error);
    
    // Update status to failed
    await db.collection('backups').updateOne(
      { _id: backupId },
      {
        $set: {
          status: 'failed',
          error: error.message,
          updatedAt: new Date()
        }
      }
    );
  }
}

/**
 * Restore from backup
 */
const restoreBackup = async (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { confirmPassword } = req.body;

  // Security check - require password confirmation
  if (!confirmPassword) {
    throw new AppError('Cần xác nhận mật khẩu để khôi phục dữ liệu', HTTP_STATUS.BAD_REQUEST);
  }

  const backup = await db.collection('backups').findOne({ _id: new ObjectId(id) });

  if (!backup) {
    throw new AppError('Không tìm thấy backup', HTTP_STATUS.NOT_FOUND);
  }

  if (backup.status !== 'completed') {
    throw new AppError('Backup chưa hoàn thành hoặc bị lỗi', HTTP_STATUS.BAD_REQUEST);
  }

  const filePath = path.join(BACKUP_DIR, backup.filePath);

  // Check if file exists
  try {
    await fs.access(filePath);
  } catch {
    throw new AppError('Không tìm thấy file backup', HTTP_STATUS.NOT_FOUND);
  }

  // Create restore log
  const restoreLog = {
    backupId: new ObjectId(id),
    backupName: backup.name,
    status: 'pending',
    startedAt: new Date(),
    startedBy: req.user.userId
  };

  const logResult = await db.collection('restore_logs').insertOne(restoreLog);
  const restoreId = logResult.insertedId;

  // Start restore process in background
  performRestore(db, restoreId, filePath).catch(err => {
    console.error('Restore failed:', err);
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Đang khôi phục dữ liệu, hệ thống có thể tạm dừng...',
    data: {
      restoreId,
      backupName: backup.name
    }
  });
};

/**
 * Perform actual restore (background task)
 */
async function performRestore(db, restoreId, filePath) {
  try {
    // Update status
    await db.collection('restore_logs').updateOne(
      { _id: restoreId },
      { $set: { status: 'in-progress', updatedAt: new Date() } }
    );

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbName = db.databaseName;

    // Use mongorestore command
    const command = `mongorestore --uri="${mongoUri}" --archive="${filePath}" --gzip --drop`;
    
    await execPromise(command);

    // Update status
    await db.collection('restore_logs').updateOne(
      { _id: restoreId },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    console.log(`Restore ${restoreId} completed successfully`);
  } catch (error) {
    console.error('Restore error:', error);
    
    await db.collection('restore_logs').updateOne(
      { _id: restoreId },
      {
        $set: {
          status: 'failed',
          error: error.message,
          updatedAt: new Date()
        }
      }
    );
  }
}

/**
 * Delete backup
 */
const deleteBackup = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const backup = await db.collection('backups').findOne({ _id: new ObjectId(id) });

  if (!backup) {
    throw new AppError('Không tìm thấy backup', HTTP_STATUS.NOT_FOUND);
  }

  // Delete file
  const filePath = path.join(BACKUP_DIR, backup.filePath);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn('Failed to delete backup file:', error.message);
  }

  // Delete record
  await db.collection('backups').deleteOne({ _id: new ObjectId(id) });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Xóa backup thành công'
  });
};

/**
 * Get backup schedule configuration
 */
const getScheduleConfig = async (req, res) => {
  const db = req.db;

  const config = await db.collection('backup_schedule')
    .findOne({ type: 'auto' }) || {
    type: 'auto',
    enabled: false,
    frequency: 'daily', // daily, weekly, monthly
    time: '02:00',
    retention: 30, // days
    lastRun: null,
    nextRun: null
  };

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: config
  });
};

/**
 * Update backup schedule configuration
 */
const updateScheduleConfig = async (req, res) => {
  const db = req.db;
  const { enabled, frequency, time, retention } = req.body;

  const updateData = {
    type: 'auto',
    updatedAt: new Date()
  };

  if (enabled !== undefined) updateData.enabled = enabled;
  if (frequency !== undefined) updateData.frequency = frequency;
  if (time !== undefined) updateData.time = time;
  if (retention !== undefined) updateData.retention = parseInt(retention);

  // Calculate next run time
  if (enabled && frequency && time) {
    // Simple calculation - can be improved with cron
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      // If time has passed today, schedule for tomorrow
      nextRun.setDate(nextRun.getDate() + 1);
    }

    updateData.nextRun = nextRun;
  }

  await db.collection('backup_schedule').updateOne(
    { type: 'auto' },
    { $set: updateData },
    { upsert: true }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cập nhật cấu hình backup tự động thành công',
    data: updateData
  });
};

module.exports = {
  getBackupStats,
  getAllBackups,
  getBackupById,
  createBackup,
  restoreBackup,
  deleteBackup,
  getScheduleConfig,
  updateScheduleConfig
};
