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
      console.log("AVAILABLE MODELS:");
      data.models.forEach(m => console.log(`- ${m.name} (v1)`));
    }
    
    const responseBeta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const dataBeta = await responseBeta.json();
    if (dataBeta.models) {
      console.log("\nAVAILABLE MODELS (v1beta):");
      dataBeta.models.forEach(m => console.log(`- ${m.name} (v1beta)`));
    }
    
  } catch (error) {
    console.error(error);
  }
}

listModels();
