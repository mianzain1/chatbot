// qnaRoutes.js

const express = require('express');
const QnaModel = require('../models/QnaModel');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set the destination folder for uploads
    },
    filename: function (req, file, cb) {
        const uniqueId = Date.now(); // Generate a unique ID
        cb(null, `${uniqueId}${path.extname(file.originalname)}`); // Set a unique filename
    }
});

const upload = multer({ storage: storage });


// Endpoint to add Q&A pairs
// Endpoint to add Q&A pairs
// Endpoint to add Q&A pairs
router.post('/addQna', upload.any(), async (req, res) => {
    try {
        console.log('req.files:', req.files);

        if (!req.files || req.files.length === 0) {
            console.error('No files received.');
            return res.status(400).json({ success: false, error: 'No files received.' });
        }

        const { question, answer } = req.body;

        // Check if the files are in the 'images' field or a single file in 'image' field
        const images = req.files.map(file => file.filename);

        console.log('question:', question);
        console.log('answer:', answer);
        console.log('images:', images);

        // Insert Q&A pair into MongoDB
        const qna = new QnaModel({ question, answer, images });
        const result = await qna.save();

        res.json({ success: true, insertedId: result._id });
    } catch (error) {
        console.error('Error adding Q&A pair:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});







// Endpoint to get all Q&A pairs
router.get('/getAllQna', async (req, res) => {
    try {
        // Retrieve all Q&A pairs from MongoDB
        const qnaPairs = await QnaModel.find();
        res.json(qnaPairs);
    } catch (error) {
        console.error('Error fetching Q&A pairs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to update a Q&A pair
router.put('/updateQna', async (req, res) => {
    try {
        const { id, question, answer, image } = req.body;

        // Update Q&A pair in MongoDB
        const updatedQna = await QnaModel.findByIdAndUpdate(id, { question, answer, image }, { new: true });

        if (updatedQna) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Q&A pair not found' });
        }
    } catch (error) {
        console.error('Error updating Q&A pair:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to delete a Q&A pair
router.delete('/deleteQna/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete Q&A pair from MongoDB
        const deletedQna = await QnaModel.findByIdAndDelete(id);

        if (deletedQna) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Q&A pair not found' });
        }
    } catch (error) {
        console.error('Error deleting Q&A pair:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ... (other API endpoints)

module.exports = router;
