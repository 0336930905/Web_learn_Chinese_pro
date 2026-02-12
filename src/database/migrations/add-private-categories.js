/**
 * Migration: Add Private Categories Support
 * 
 * This migration adds isPrivate and userId fields to existing categories
 * and creates necessary database indexes for efficient querying.
 * 
 * Run: node src/database/migrations/add-private-categories.js
 */

// Load environment variables
require('dotenv').config();

const { MongoClient, ObjectId } = require('mongodb');
const { logger } = require('../../utils/logger');

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  logger.info('Starting private categories migration...');

  const client = await MongoClient.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const db = client.db();
    const categoriesCollection = db.collection('categories');

    // Step 1: Update existing categories to be public (if they don't have isPrivate field)
    logger.info('Setting existing categories as public...');
    const updateResult = await categoriesCollection.updateMany(
      { 
        isPrivate: { $exists: false } 
      },
      { 
        $set: { 
          isPrivate: false
        } 
      }
    );
    logger.info(`Updated ${updateResult.modifiedCount} categories to public`);

    // Step 1.5: Fix categories with invalid order (0 or negative)
    logger.info('Fixing categories with invalid order values...');
    const categoriesWithBadOrder = await categoriesCollection.find({ 
      $or: [
        { order: { $lte: 0 } },
        { order: { $exists: false } }
      ]
    }).toArray();
    
    if (categoriesWithBadOrder.length > 0) {
      logger.info(`Found ${categoriesWithBadOrder.length} categories with invalid order`);
      
      // Group by scope (public vs private per user)
      const scopes = {};
      for (const cat of categoriesWithBadOrder) {
        const scopeKey = cat.userId ? cat.userId.toString() : 'public';
        if (!scopes[scopeKey]) scopes[scopeKey] = [];
        scopes[scopeKey].push(cat);
      }
      
      // Fix order for each scope
      for (const [scopeKey, cats] of Object.entries(scopes)) {
        const filter = scopeKey === 'public' 
          ? { isPrivate: false } 
          : { userId: cats[0].userId };
        
        // Get max order in this scope
        const maxCat = await categoriesCollection
          .find({ ...filter, order: { $gt: 0 } })
          .sort({ order: -1 })
          .limit(1)
          .toArray();
        
        let nextOrder = maxCat.length > 0 ? maxCat[0].order + 1 : 1;
        
        // Update each category
        for (const cat of cats) {
          await categoriesCollection.updateOne(
            { _id: cat._id },
            { $set: { order: nextOrder++ } }
          );
        }
        logger.info(`Fixed order for ${cats.length} categories in scope ${scopeKey}`);
      }
    }

    // Step 2: Create indexes for efficient querying
    logger.info('Creating database indexes...');

    // Drop old unique index on name if it exists
    try {
      await categoriesCollection.dropIndex('name_1');
      logger.info('Dropped old unique index on name field');
    } catch (error) {
      // Index might not exist, that's ok
      logger.info('Old name index does not exist or already dropped');
    }

    // Create new compound unique index (name, userId, isPrivate)
    await categoriesCollection.createIndex(
      { name: 1, userId: 1, isPrivate: 1 }, 
      { unique: true, name: 'name_userId_isPrivate_unique' }
    );
    logger.info('Created compound unique index on (name, userId, isPrivate)');

    // Index for filtering by privacy
    await categoriesCollection.createIndex({ isPrivate: 1 });
    logger.info('Created index on isPrivate field');

    // Index for filtering by user
    await categoriesCollection.createIndex({ userId: 1 });
    logger.info('Created index on userId field');

    // Compound index for the main query pattern
    await categoriesCollection.createIndex({ isPrivate: 1, userId: 1 });
    logger.info('Created compound index on (isPrivate, userId)');

    // Index for ordering
    await categoriesCollection.createIndex({ order: 1 });
    logger.info('Created index on order field');

    // Step 3: Verify migration
    logger.info('Verifying migration...');
    const totalCategories = await categoriesCollection.countDocuments();
    const publicCategories = await categoriesCollection.countDocuments({ isPrivate: false });
    const privateCategories = await categoriesCollection.countDocuments({ isPrivate: true });

    logger.info(`Migration verification:`);
    logger.info(`  Total categories: ${totalCategories}`);
    logger.info(`  Public categories: ${publicCategories}`);
    logger.info(`  Private categories: ${privateCategories}`);

    // Step 4: List all indexes
    const indexes = await categoriesCollection.indexes();
    logger.info('Current indexes:');
    indexes.forEach(index => {
      logger.info(`  - ${JSON.stringify(index.key)}`);
    });

    logger.info('✅ Migration completed successfully!');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    logger.info('Database connection closed');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .catch(error => {
      logger.error('Fatal error during migration:', error);
      process.exit(1);
    });
}

module.exports = migrate;
