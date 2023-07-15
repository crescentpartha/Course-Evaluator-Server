const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // await client.connect();
        client.connect();
        const courseCollection = client.db('courseEvaluator').collection('course');
        const noticeCollection = client.db('courseEvaluator').collection('notice');
        const news_eventCollection = client.db('courseEvaluator').collection('news_event');
        const userCollection = client.db('courseEvaluator').collection('users');
        const responseCollection = client.db('courseEvaluator').collection('responses');
        // console.log("courseEvaluatorServer successfully connected to MongoDB!");

        /* for courseCollection */

        // 01. POST a course from server-side to database
        app.post('/course', async(req, res) => {
            const newCourse = req.body;
            // console.log('Adding a new course', newCourse);
            const result = await courseCollection.insertOne(newCourse);
            res.send(result);
        });

        // 02. get all course data (json format) from database
        app.get('/course', async (req, res) => {
            const query = {};
            const cursor = courseCollection.find(query);
            const courses = await cursor.toArray();
            res.send(courses);
        });

        // 03. get courses for evaluation using search query or query parameter
        app.get('/courseForEvaluation', async (req, res) => {
            const {degree, semester} = req.query;
            const query = {};
            if (degree) query.degree = degree;
            if (semester) query.semester = semester;
            // console.log(query);
            const cursor = courseCollection.find(query);
            const courses = await cursor.toArray();
            res.send(courses);
        });

        // 04. Load a particular course data from database to server-side | (id-wise data load)
        app.get('/course/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await courseCollection.findOne(query);
            res.send(result);
        });

        // 05. DELETE a particular course data from database
        app.delete('/course/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await courseCollection.deleteOne(query);
            // console.log('One course item is deleted');
            res.send(result);
        });

        /* for noticeCollection */

        // 01. POST a notice from server-side to database
        app.post('/notice', async(req, res) => {
            const newNotice = req.body;
            // console.log('Adding a new notice', newNotice);
            const result = await noticeCollection.insertOne(newNotice);
            res.send(result);
        });

        // 02. get all notices data (json format) from database
        app.get('/notice', async (req, res) => {
            const {type} = req.query;
            const query = {};
            if (type) query.type = type;
            // console.log(query);
            const cursor = noticeCollection.find(query);
            const notices = await cursor.toArray();
            res.send(notices);
        });

        // 03. DELETE a particular notice data from database
        app.delete('/notice/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await noticeCollection.deleteOne(query);
            // console.log('One notice item is deleted');
            res.send(result);
        });

        /* for news_eventCollection */

        // 01. POST a news_event data from server-side to database
        app.post('/news_event', async(req, res) => {
            const newNewsEvent = req.body;
            // console.log('Adding a new news and event', newNewsEvent);
            const result = await news_eventCollection.insertOne(newNewsEvent);
            res.send(result);
        });

        // 02. get all news_event data (json format) from database
        app.get('/news_event', async (req, res) => {
            const query = {};
            const cursor = news_eventCollection.find(query);
            const news_events = await cursor.toArray();
            res.send(news_events);
        });

        // 03. DELETE a particular news_event data from database
        app.delete('/news_event/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await news_eventCollection.deleteOne(query);
            // console.log('One news_event item is deleted');
            res.send(result);
        });

        /* for responseCollection */

        // 01. POST a survey response from server-side to database
        app.post('/response', async(req, res) => {
            const newResponse = req.body;
            // console.log('Adding a survey response', newResponse);
            const result = await responseCollection.insertOne(newResponse);
            res.send(result);
        });

        // 02. get all survey response data from database
        app.get('/response', async (req, res) => {
            const query = {};
            const cursor = responseCollection.find(query);
            const responses = await cursor.toArray();
            res.send(responses);
        });

        // 03. Load a particular survey response data from database to server-side | (id-wise data load)
        app.get('/response/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await responseCollection.findOne(query);
            res.send(result);
        });

        // 05. DELETE a particular survey response data from database
        app.delete('/response/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await responseCollection.deleteOne(query);
            // console.log('One response item is deleted');
            res.send(result);
        });

        /* for userCollection */

        // 01. User Creation Process | put user to userCollection
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // 02. get all user's data (json format) from database
        app.get('/user', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        });

        // 03. get particular user to check user role (admin or not)
        app.get('/user/admin', async (req, res) => {
            // console.log(req.query);
            const adminUser = await userCollection.findOne({ email: req.query.email });
            res.send(adminUser);
        });

        // 04. get users for Student, teacher or admin based on role using search query or query parameter
        app.get('/user/role', async (req, res) => {
            const {role} = req.query;
            const query = {};
            if (role) query.role = role; // select student/teacher/admin/All type users;
            // console.log(query);
            const cursor = userCollection.find(query);
            const roleBasedUser = await cursor.toArray();
            res.send(roleBasedUser);
        });

        // 05. Load a particular user data from database to server-side | (id-wise data load)
        app.get('/user/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await userCollection.findOne(query);
            res.send(result);
        });

        // 06. Update a particular user data in server-side and send to the database
        app.put('/particular_user/:id', async(req, res) => {
            const id = req.params.id;
            const userData = req.body;
            // console.log(userData);
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    completedCourse: userData
                }
            };
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            // console.log('User is updated');
            res.send(result);
        });

        // 07. Update a particular user's role data in server-side and send to the database
        app.put('/role_user/:id', async(req, res) => {
            const id = req.params.id;
            const userData = req.body;
            // console.log(userData);
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: userData?.role
                }
            };
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            // console.log('User is updated');
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