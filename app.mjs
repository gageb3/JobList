import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';


//constants
const app = express()
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

let db;
async function connectDB() {
  try {
    await client.connect();
    db = client.db("jobs"); // Database name
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}
connectDB();

//APIs
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'home-page.html'))
})


// Add jobs
app.post('/api/jobs', async (req, res) => {
  try {
    const { company, position, date } = req.body;
    
    // Simple validation
    if (!company || !position || !date) {
      return res.status(400).json({ error: 'Company, position, and date are required' });
    }

    const job = { company, position, date: new Date(date) };
    const result = await db.collection('jobs').insertOne(job);

    res.status(201).json({ 
      message: 'Job created successfully',
      jobId: result.insertedId,
      job: { ...job, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job: ' + error.message });
  }
});

// Load jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await db.collection('jobs').find({}).toArray();
    res.json(jobs); // Return just the array for frontend simplicity
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs: ' + error.message });
  }
});

// UPDATE - Update a job by ID
app.put('/api/jobs/:id', async (req, res) => {
  try {
  const { id } = req.params;
  const { company, position, date, stage } = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const updateData = {};
    if (company) updateData.company = company;
    if (position) updateData.position = position;
  if (date) updateData.date = new Date(date);
  // allow updating stage (can be empty string)
  if (stage !== undefined) updateData.stage = stage;

    const result = await db.collection('jobs').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ 
      message: 'Job updated successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job: ' + error.message });
  }
});

// DELETE - Delete a job by ID
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const result = await db.collection('jobs').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ 
      message: 'Job deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job: ' + error.message });
  }
});

// CLEANUP - Remove all jobs
app.delete('/api/cleanup', async (req, res) => {
  try {
    const result = await db.collection('jobs').deleteMany({});

    res.json({
      message: `Database cleaned successfully! Removed ${result.deletedCount} jobs.`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cleanup database: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Example app Listening on port ${PORT}`)
})