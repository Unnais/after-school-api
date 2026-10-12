require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// Logger middleware: prints every request to the console
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  let db;

MongoClient.connect(process.env.MONGO_URI)
  .then(client => {
    db = client.db('afterschool');
    app.listen(process.env.PORT || 3000, () => console.log('Server running'));
  })
  .catch(err => console.error('DB connection failed:', err.message));
  app.get('/lessons', async (req, res) => {
    const lessons = await db.collection('lessons').find({}).toArray();
    res.json(lessons);
  });