/**
 * Migration: Add Multi-language Meanings to Vocabulary
 * Adds meaningEn and meaningTw fields to vocabulary items
 */

const { MongoClient, ObjectId } = require('mongodb');
const { config } = require('../../config');

async function addMultiLanguageMeanings() {
  const client = new MongoClient(config.database.uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(config.database.name);
    const vocabulary = db.collection('vocabulary');
    
    // Get all vocabulary items
    const vocabItems = await vocabulary.find({}).toArray();
    console.log(`Found ${vocabItems.length} vocabulary items`);
    
    // Update each item to add meaningEn and meaningTw if not present
    const bulkOps = vocabItems.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: {
          $set: {
            // Keep original meaning as Vietnamese (meaning)
            // Add placeholder for English and Traditional Chinese if not present
            meaningEn: item.meaningEn || item.meaning, // Default to Vietnamese for now
            meaningTw: item.meaningTw || item.meaning  // Default to Vietnamese for now
          }
        }
      }
    }));
    
    if (bulkOps.length > 0) {
      const result = await vocabulary.bulkWrite(bulkOps);
      console.log(`✅ Updated ${result.modifiedCount} vocabulary items with multi-language meanings`);
    }
    
    // Update vocabulary collection validation to include new fields
    try {
      await db.command({
        collMod: 'vocabulary',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['categoryId', 'traditional', 'pinyin', 'meaning'],
            properties: {
              categoryId: {
                bsonType: 'objectId',
              },
              traditional: {
                bsonType: 'string',
              },
              simplified: {
                bsonType: 'string',
              },
              pinyin: {
                bsonType: 'string',
              },
              meaning: {
                bsonType: 'string',
                description: 'Vietnamese meaning'
              },
              meaningEn: {
                bsonType: 'string',
                description: 'English meaning'
              },
              meaningTw: {
                bsonType: 'string',
                description: 'Traditional Chinese meaning'
              },
              difficulty: {
                enum: ['beginner', 'intermediate', 'advanced'],
              },
            },
          },
        },
        validationLevel: 'moderate',
      });
      console.log('✅ Updated vocabulary collection validation schema');
    } catch (error) {
      console.error('⚠️  Could not update validation schema:', error.message);
    }
    
    console.log('\n📝 Note: You need to manually update the meaningEn and meaningTw fields');
    console.log('   with proper translations. Currently they are set to the Vietnamese meaning.');
    console.log('   You can update them via the vocabulary management interface or database.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run migration if executed directly
if (require.main === module) {
  addMultiLanguageMeanings()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addMultiLanguageMeanings };
