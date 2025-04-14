require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { startSelfPing } = require('./utils/selfPing');

const app = express();
const PORT = process.env.PORT || 3001;

const cors_options = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://anime-character-guessr.onrender.com',
    'https://anime-character-guessr.vercel.app',
    'https://anime-character-guessr.netlify.app',
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,  // 支持局域网IP
    /^http:\/\/172\.\d+\.\d+\.\d+:\d+$/,  // 支持局域网IP
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/    // 支持局域网IP
  ],
  methods: ['GET', 'POST'],
  credentials: true
};

// Middleware
app.use(cors(cors_options));
app.use(express.json());

// Connect to MongoDB when the server starts
db.connect().catch(console.error);

// Basic health check route
app.get('/health', async (req, res) => {
  try {
    const client = db.getClient();
    await client.db("admin").command({ ping: 1 });
    res.json({ status: 'ok', mongodb: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'MongoDB connection failed' });
  }
});

// Character Tags API
app.post('/api/character-tags', async (req, res) => {
  try {
    const { characterId, tags } = req.body;
    
    // Validate request body
    if (!characterId || !tags || !Array.isArray(tags)) {
      return res.status(400).json({ 
        error: 'Invalid request body. Required format: { characterId: number, tags: string[] }' 
      });
    }

    const client = db.getClient();
    const database = client.db('tags');
    const collection = database.collection('character_tags');

    // Get existing document if it exists
    const existingDoc = await collection.findOne({ _id: characterId });
    
    // Initialize or get existing tagCounts
    let tagCounts = {};
    if (existingDoc && existingDoc.tagCounts) {
      tagCounts = existingDoc.tagCounts;
    }

    // Update tag counts
    for (const tag of tags) {
      if (tag in tagCounts) {
        tagCounts[tag]++;
      } else {
        tagCounts[tag] = 1;
      }
    }
    
    // Create or update document
    const document = {
      _id: characterId,
      tagCounts
    };

    // Use replaceOne with upsert to handle both insert and update cases
    const result = await collection.replaceOne(
      { _id: characterId },
      document,
      { upsert: true }
    );
    
    res.status(201).json({
      message: result.upsertedCount ? 'Character tags added successfully' : 'Character tags updated successfully',
      characterId,
      document
    });
  } catch (error) {
    console.error('Error inserting character tags:', error);
    res.status(500).json({ error: 'Failed to insert character tags' });
  }
});

// Propose new tags for a character
app.post('/api/propose-tags', async (req, res) => {
  try {
    const { characterId, tags } = req.body;
    
    // Validate request body
    if (!characterId || !tags || !Array.isArray(tags)) {
      return res.status(400).json({ 
        error: 'Invalid request body. Required format: { characterId: number, tags: string[] }' 
      });
    }

    const client = db.getClient();
    const database = client.db('tags'); 
    const collection = database.collection('new_tags');

    // Get existing document if it exists
    const existingDoc = await collection.findOne({ _id: characterId });
    
    // Initialize or get existing tagCounts
    let tagCounts = {};
    if (existingDoc && existingDoc.tagCounts) {
      tagCounts = existingDoc.tagCounts;
    }

    // Update tag counts
    for (const tag of tags) {
      if (tag in tagCounts) {
        tagCounts[tag]++;
      } else {
        tagCounts[tag] = 1;
      }
    }

    // Create or update document
    const document = {
      _id: characterId,
      tagCounts
    };

    // Use replaceOne with upsert to handle both insert and update cases
    const result = await collection.replaceOne(
      { _id: characterId },
      document,
      { upsert: true }
    );

    res.status(201).json({
      message: result.upsertedCount ? 'New tags added successfully' : 'New tags updated successfully',
      characterId,
      document
    });
  } catch (error) {
    console.error('Error proposing new tags:', error);
    res.status(500).json({ error: 'Failed to propose new tags' });
  }
});

startSelfPing();

const HOST = process.env.HOST || 'localhost';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
}); 