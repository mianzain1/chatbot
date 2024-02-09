// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer'); // Add this line
const path = require('path'); // Add this line
const qnaRoutes = require('./routes/qnaRoutes');
const authRoutes = require('./routes/auth');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

// Require your chatbot.js module
const chatbot = require('./modules/chatbot');

const app = express();

// MongoDB Atlas connection URL
const mongoURL = 'mongodb+srv://zainzainn651:s40PJOcjIKGpCjcC@cluster0.uwwq13e.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'your-database-name';

// Connect to MongoDB Atlas
mongoose.connect(mongoURL, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB Atlas:', err);
    });

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Use session middleware
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set the destination folder for uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename
    }
});

// Initialize multer with storage options
const upload = multer({ storage: storage });

// Use qnaRoutes for Q&A related routes
app.use('/qna', express.json(), qnaRoutes);// Add upload middleware for image uploads
app.use('/auth', authRoutes);

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Call the initialize function in your chatbot.js module
// chatbot.initialize();
