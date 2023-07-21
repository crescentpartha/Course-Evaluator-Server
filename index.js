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
        app.post('/course', async (req, res) => {
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
            const { degree, semester } = req.query;
            const query = {};
            if (degree) query.degree = degree;
            if (semester) query.semester = semester;
            // console.log(query);
            const cursor = courseCollection.find(query);
            const courses = await cursor.toArray();
            res.send(courses);
        });

        // 04. Load a particular course data from database to server-side | (id-wise data load)
        app.get('/course/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
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
        app.post('/notice', async (req, res) => {
            const newNotice = req.body;
            // console.log('Adding a new notice', newNotice);
            const result = await noticeCollection.insertOne(newNotice);
            res.send(result);
        });

        // 02. get all notices data (json format) from database
        app.get('/notice', async (req, res) => {
            const { type } = req.query;
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
        app.post('/news_event', async (req, res) => {
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
        app.post('/response', async (req, res) => {
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
        app.get('/response/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
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

        /* 06. 
            - get all survey responses data 
            - filter all survey responses data based on course_title 
            - Number of voted options count for Statistics route 
        */
        app.get('/response_statistics', async (req, res) => {
            /* Number of voted Options count Object, initialized by 0 */
            let data = {
                "question01": {
                    "_id": 1,
                    "question": "01. How would you rate the overall quality of this course?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question02": {
                    "_id": 2,
                    "question": "02. Rate your overall experience of the course?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question03": {
                    "_id": 3,
                    "question": "03. How did this course develop you professionally?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question04": {
                    "_id": 4,
                    "question": "04. Did the courses meet your expectations in terms of providing relevant technical knowledge and skills?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question05": {
                    "_id": 5,
                    "question": "05. How likely are you to recommend this course to a friend/colleague?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question06": {
                    "_id": 6,
                    "question": "06. Were the course materials and resources adequately organized and accessible?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question07": {
                    "_id": 7,
                    "question": "07. Did the courses provide opportunities for practical application of the concepts learned?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question08": {
                    "_id": 8,
                    "question": "08. How well did the courses prepare you for real-world technical challenges and industry demands?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question09": {
                    "_id": 9,
                    "question": "09. Were the assessments and examinations fair and aligned with the course objectives?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question10": {
                    "_id": 10,
                    "question": "10. Did the course evaluations and feedback provided by instructors help you gauge your progress and identify areas for improvement?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question11": {
                    "_id": 11,
                    "question": "11. How would you rate the overall classroom environment and the availability of necessary equipment and facilities?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question12": {
                    "_id": 12,
                    "question": "12. Were the course schedules and timings convenient and conducive to learning?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question13": {
                    "_id": 13,
                    "question": "13. Did the institute provide adequate support services, such as career counseling or job placement assistance?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question14": {
                    "_id": 14,
                    "question": "14. How would you rate the institute's commitment to maintaining up-to-date curriculum and incorporating emerging technologies?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question15": {
                    "_id": 15,
                    "question": "15. How would you rate the effectiveness of the instructors in delivering the course content and facilitating learning?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question16": {
                    "_id": 16,
                    "question": "16. Were the instructors knowledgeable and experienced in their respective fields?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question17": {
                    "_id": 17,
                    "question": "17. Did the instructors effectively communicate complex technical concepts?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                },
                "question18": {
                    "_id": 18,
                    "question": "18. Were the instructors approachable and available for assistance outside of class?",
                    "options": {
                        "option1": 0,
                        "option2": 0,
                        "option3": 0,
                        "option4": 0,
                        "option5": 0
                    }
                }
            }
            // res.send(data);

            /* load all survey responses data */
            const { course_title, course_code } = req.query;
            // console.log(req.query);
            const query = {};
            const cursor = responseCollection.find(query);
            const responses = await cursor.toArray();

            /* filter all survey responses data based on course_title */
            const filteredData = responses.filter(item => item.courseData.course_title === course_title && item.courseData.course_code === course_code);
            // res.send(filteredData);

            /* Calculate the number of voted options for particular question and modify data object */
            const statisticsData = filteredData.map(item => {
                // console.log(item);
                const { answers } = item;
                // console.log(answers);

                /* For question01 */
                if (answers.answer01 === 'Strongly Agree') data.question01.options.option1 += 1;
                else if (answers.answer01 === 'Agree') data.question01.options.option2 += 1;
                else if (answers.answer01 === 'Neutral') data.question01.options.option3 += 1;
                else if (answers.answer01 === 'Disagree') data.question01.options.option4 += 1;
                else if (answers.answer01 === 'Strongly Disagree') data.question01.options.option5 += 1;

                /* For question02 */
                if (answers.answer02 === 'Strongly Agree') data.question02.options.option1 += 1;
                else if (answers.answer02 === 'Agree') data.question02.options.option2 += 1;
                else if (answers.answer02 === 'Neutral') data.question02.options.option3 += 1;
                else if (answers.answer02 === 'Disagree') data.question02.options.option4 += 1;
                else if (answers.answer02 === 'Strongly Disagree') data.question02.options.option5 += 1;

                /* For question03 */
                if (answers.answer03 === 'Strongly Agree') data.question03.options.option1 += 1;
                else if (answers.answer03 === 'Agree') data.question03.options.option2 += 1;
                else if (answers.answer03 === 'Neutral') data.question03.options.option3 += 1;
                else if (answers.answer03 === 'Disagree') data.question03.options.option4 += 1;
                else if (answers.answer03 === 'Strongly Disagree') data.question03.options.option5 += 1;

                /* For question04 */
                if (answers.answer04 === 'Strongly Agree') data.question04.options.option1 += 1;
                else if (answers.answer04 === 'Agree') data.question04.options.option2 += 1;
                else if (answers.answer04 === 'Neutral') data.question04.options.option3 += 1;
                else if (answers.answer04 === 'Disagree') data.question04.options.option4 += 1;
                else if (answers.answer04 === 'Strongly Disagree') data.question04.options.option5 += 1;

                /* For question05 */
                if (answers.answer05 === 'Strongly Agree') data.question05.options.option1 += 1;
                else if (answers.answer05 === 'Agree') data.question05.options.option2 += 1;
                else if (answers.answer05 === 'Neutral') data.question05.options.option3 += 1;
                else if (answers.answer05 === 'Disagree') data.question05.options.option4 += 1;
                else if (answers.answer05 === 'Strongly Disagree') data.question05.options.option5 += 1;

                /* For question06 */
                if (answers.answer06 === 'Strongly Agree') data.question06.options.option1 += 1;
                else if (answers.answer06 === 'Agree') data.question06.options.option2 += 1;
                else if (answers.answer06 === 'Neutral') data.question06.options.option3 += 1;
                else if (answers.answer06 === 'Disagree') data.question06.options.option4 += 1;
                else if (answers.answer06 === 'Strongly Disagree') data.question06.options.option5 += 1;

                /* For question07 */
                if (answers.answer07 === 'Strongly Agree') data.question07.options.option1 += 1;
                else if (answers.answer07 === 'Agree') data.question07.options.option2 += 1;
                else if (answers.answer07 === 'Neutral') data.question07.options.option3 += 1;
                else if (answers.answer07 === 'Disagree') data.question07.options.option4 += 1;
                else if (answers.answer07 === 'Strongly Disagree') data.question07.options.option5 += 1;

                /* For question08 */
                if (answers.answer08 === 'Strongly Agree') data.question08.options.option1 += 1;
                else if (answers.answer08 === 'Agree') data.question08.options.option2 += 1;
                else if (answers.answer08 === 'Neutral') data.question08.options.option3 += 1;
                else if (answers.answer08 === 'Disagree') data.question08.options.option4 += 1;
                else if (answers.answer08 === 'Strongly Disagree') data.question08.options.option5 += 1;

                /* For question09 */
                if (answers.answer09 === 'Strongly Agree') data.question09.options.option1 += 1;
                else if (answers.answer09 === 'Agree') data.question09.options.option2 += 1;
                else if (answers.answer09 === 'Neutral') data.question09.options.option3 += 1;
                else if (answers.answer09 === 'Disagree') data.question09.options.option4 += 1;
                else if (answers.answer09 === 'Strongly Disagree') data.question09.options.option5 += 1;

                /* For question10 */
                if (answers.answer10 === 'Strongly Agree') data.question10.options.option1 += 1;
                else if (answers.answer10 === 'Agree') data.question10.options.option2 += 1;
                else if (answers.answer10 === 'Neutral') data.question10.options.option3 += 1;
                else if (answers.answer10 === 'Disagree') data.question10.options.option4 += 1;
                else if (answers.answer10 === 'Strongly Disagree') data.question10.options.option5 += 1;

                /* For question11 */
                if (answers.answer11 === 'Strongly Agree') data.question11.options.option1 += 1;
                else if (answers.answer11 === 'Agree') data.question11.options.option2 += 1;
                else if (answers.answer11 === 'Neutral') data.question11.options.option3 += 1;
                else if (answers.answer11 === 'Disagree') data.question11.options.option4 += 1;
                else if (answers.answer11 === 'Strongly Disagree') data.question11.options.option5 += 1;

                /* For question12 */
                if (answers.answer12 === 'Strongly Agree') data.question12.options.option1 += 1;
                else if (answers.answer12 === 'Agree') data.question12.options.option2 += 1;
                else if (answers.answer12 === 'Neutral') data.question12.options.option3 += 1;
                else if (answers.answer12 === 'Disagree') data.question12.options.option4 += 1;
                else if (answers.answer12 === 'Strongly Disagree') data.question12.options.option5 += 1;

                /* For question13 */
                if (answers.answer13 === 'Strongly Agree') data.question13.options.option1 += 1;
                else if (answers.answer13 === 'Agree') data.question13.options.option2 += 1;
                else if (answers.answer13 === 'Neutral') data.question13.options.option3 += 1;
                else if (answers.answer13 === 'Disagree') data.question13.options.option4 += 1;
                else if (answers.answer13 === 'Strongly Disagree') data.question13.options.option5 += 1;

                /* For question14 */
                if (answers.answer14 === 'Strongly Agree') data.question14.options.option1 += 1;
                else if (answers.answer14 === 'Agree') data.question14.options.option2 += 1;
                else if (answers.answer14 === 'Neutral') data.question14.options.option3 += 1;
                else if (answers.answer14 === 'Disagree') data.question14.options.option4 += 1;
                else if (answers.answer14 === 'Strongly Disagree') data.question14.options.option5 += 1;

                /* For question15 */
                if (answers.answer15 === 'Strongly Agree') data.question15.options.option1 += 1;
                else if (answers.answer15 === 'Agree') data.question15.options.option2 += 1;
                else if (answers.answer15 === 'Neutral') data.question15.options.option3 += 1;
                else if (answers.answer15 === 'Disagree') data.question15.options.option4 += 1;
                else if (answers.answer15 === 'Strongly Disagree') data.question15.options.option5 += 1;

                /* For question16 */
                if (answers.answer16 === 'Strongly Agree') data.question16.options.option1 += 1;
                else if (answers.answer16 === 'Agree') data.question16.options.option2 += 1;
                else if (answers.answer16 === 'Neutral') data.question16.options.option3 += 1;
                else if (answers.answer16 === 'Disagree') data.question16.options.option4 += 1;
                else if (answers.answer16 === 'Strongly Disagree') data.question16.options.option5 += 1;

                /* For question17 */
                if (answers.answer17 === 'Strongly Agree') data.question17.options.option1 += 1;
                else if (answers.answer17 === 'Agree') data.question17.options.option2 += 1;
                else if (answers.answer17 === 'Neutral') data.question17.options.option3 += 1;
                else if (answers.answer17 === 'Disagree') data.question17.options.option4 += 1;
                else if (answers.answer17 === 'Strongly Disagree') data.question17.options.option5 += 1;

                /* For question18 */
                if (answers.answer18 === 'Strongly Agree') data.question18.options.option1 += 1;
                else if (answers.answer18 === 'Agree') data.question18.options.option2 += 1;
                else if (answers.answer18 === 'Neutral') data.question18.options.option3 += 1;
                else if (answers.answer18 === 'Disagree') data.question18.options.option4 += 1;
                else if (answers.answer18 === 'Strongly Disagree') data.question18.options.option5 += 1;
            });
            res.send(data);
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
            const { role } = req.query;
            const query = {};
            if (role) query.role = role; // select student/teacher/admin/All type users;
            // console.log(query);
            const cursor = userCollection.find(query);
            const roleBasedUser = await cursor.toArray();
            res.send(roleBasedUser);
        });

        // 05. Load a particular user data from database to server-side | (id-wise data load)
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.findOne(query);
            res.send(result);
        });

        // 06. Update a particular user data in server-side and send to the database
        app.put('/particular_user/:id', async (req, res) => {
            const id = req.params.id;
            const userData = req.body;
            // console.log(userData);
            const filter = { _id: new ObjectId(id) };
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
        app.put('/role_user/:id', async (req, res) => {
            const id = req.params.id;
            const userData = req.body;
            // console.log(userData);
            const filter = { _id: new ObjectId(id) };
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