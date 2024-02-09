const mongoose = require('mongoose');

const qnaSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    images: {
        type: [String], // Allow an array of image filenames
    },
});

const QnaModel = mongoose.model('Qna', qnaSchema);

module.exports = QnaModel;
