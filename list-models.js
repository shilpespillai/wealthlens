import fs from 'fs';
import path from 'path';

async function listModels() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.+)/);
    if (!match) throw new Error("API Key not found in .env");
    
    const key = match[1].trim();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("AVAILABLE v1 MODELS:");
      data.models.forEach(m => {
        console.log(`- ${m.name}`);
        console.log(`  Supported Methods: ${m.supportedGenerationMethods.join(', ')}`);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

listModels();
