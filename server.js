require('dotenv').config(); // Load variables from the .env file into process.env
const express = require('express'); // Import Express, the web server framework
const cors = require('cors'); // Import CORS, which lets other websites (our Vue app) call this server
const { MongoClient } = require('mongodb'); // Import the native MongoDB driver's connection tool
const path = require('path'); // Import Node's built-in path tool for building file paths

const app = express(); // Create the Express app (this is our server)
app.use(cors()); // Run CORS on every request so the browser doesn't block our front-end
app.use(express.json()); // Parse JSON request bodies into req.body (needed for POST and PUT later)

// Logger middleware: prints every request to the console
app.use((req, res, next) => { // This function runs on every request; next passes control onward
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`); // Print time, method (GET/POST/PUT) and URL
  next(); // Hand the request to the next middleware or route (forgetting this makes requests hang)
}); // End of the logger middleware

// Static file middleware: serves lesson images from the images folder
app.use('/images', express.static(path.join(__dirname, 'images'))); // If /images/<file> matches a real file, send it

// Runs only if no image matched above, so the file doesn't exist
app.use('/images', (req, res) => { // Catches any /images request that express.static could not find
  res.status(404).json({ error: 'Image not found' }); // Reply with a 404 status and a clear error message
}); // End of the image error handler

let db; // Empty variable that will hold our database once connected, so routes can use it

MongoClient.connect(process.env.MONGO_URI) // Connect to Atlas using the connection string from .env (returns a promise)
  .then(client => { // Runs when the connection succeeds
    db = client.db('afterschool'); // Select the "afterschool" database and store it in db
    app.listen(process.env.PORT || 3000, () => console.log('Server running')); // Start listening on Render's port, or 3000 locally
  }) // End of the success handler
  .catch(err => console.error('DB connection failed:', err.message)); // Runs if connecting fails, and prints why

// GET /lessons: returns every lesson as JSON
app.get('/lessons', async (req, res) => { // Handle GET requests to /lessons (async so we can use await)
  const lessons = await db.collection('lessons').find({}).toArray(); // Wait for all lesson documents, as an array
  res.json(lessons); // Send the array back to the client as JSON
}); // End of the GET /lessons route
// POST /orders: saves a new order to the orders collection
app.post('/orders', async (req, res) => { // Handle POST requests to /orders
    const order = req.body; // The order the front-end sent (parsed by express.json)
    const result = await db.collection('orders').insertOne(order); // Save it as a new document
    res.status(201).json({ message: 'Order saved', id: result.insertedId }); // 201 means "created"; send back the new id
  }); // End of the POST /orders route