require('dotenv').config({ path: __dirname + '/.env' });
const OpenAI = require("openai");
const client = new OpenAI();

async function listModels() {
  try {
    const models = await client.models.list();
    console.log("Available models:");
    models.data.forEach(m => console.log(m.id));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels(); 