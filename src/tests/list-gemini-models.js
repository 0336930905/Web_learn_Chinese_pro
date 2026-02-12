/**
 * List available Gemini models
 */

require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log('📋 Listing available Gemini models...');
    console.log('='.repeat(60));
    
    if (!API_KEY) {
        console.error('❌ API_KEY not found');
        process.exit(1);
    }
    
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
            { timeout: 10000 }
        );
        
        console.log('✅ Found', response.data.models?.length || 0, 'models\n');
        
        if (response.data.models) {
            response.data.models.forEach(model => {
                console.log('📦 Model:', model.name);
                console.log('   Display:', model.displayName);
                console.log('   Description:', model.description);
                console.log('   Methods:', model.supportedGenerationMethods?.join(', '));
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.status || error.message);
        
        if (error.response?.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        }
    }
}

listModels();
