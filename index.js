const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connection setup with database with secure password on environment variable
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrjfrp8.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Create dynamic data and send to the database
async function run() {
    try {
        await client.connect();
        const courseCollection = client.db('courseEvaluator').collection('course');
        // console.log("courseEvaluatorServer successfully connected to MongoDB!");

        // 01. POST a course from server-side to database
        app.post('/course', async(req, res) => {
            const newCourse = req.body;
            console.log('Adding a new course', newCourse);
            const result = await courseCollection.insertOne(newCourse);
            res.send(result);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Course-Evaluator Server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
});