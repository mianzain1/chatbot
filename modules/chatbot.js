const wa = require('@open-wa/wa-automate');
const QnaModel = require('../models/QnaModel');
const { queryHuggingFaceModel } = require('../utils/huggingfaceUtils');

const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');
const turndownService = new TurndownService();

wa.create({
    sessionId: "chatbo",
    authTimeout: 60,
    // other options...
}).then(client => start(client));

console.log('Waiting for QR Code Scan...');

async function query(data, qnaPairs) {
    try {
        const response = await queryHuggingFaceModel(data);

        if (!Array.isArray(response) || response.length === 0) {
            throw new Error("Invalid or empty response from similarity model");
        }

        console.log('Hugging Face model response:', response);

        const similarityScores = response.filter(element => typeof element === 'number');

        if (similarityScores.length === 0) {
            throw new Error("No valid similarity scores found in the response");
        }

        const maxSimilarityIndex = similarityScores.indexOf(Math.max(...similarityScores));

        if (maxSimilarityIndex === -1 || similarityScores[maxSimilarityIndex] < 0.4) {
            return null;
        }

        const selectedQnaPair = qnaPairs[maxSimilarityIndex];

        const answer = selectedQnaPair?.answer;

        // Log images from the selected Q&A pair
        console.log('Images from selected Q&A pair:', selectedQnaPair?.images);

        return { answer, images: selectedQnaPair?.images || [] };
    } catch (error) {
        console.error('Error querying Hugging Face model or getting answer:', error.message);
        throw new Error("Error querying Hugging Face model or getting answer");
    }
}

async function getAnswer(userQuestion, qnaPairs, defaultResponse) {
    const similarityData = {
        inputs: {
            source_sentence: userQuestion,
            sentences: qnaPairs.map(pair => pair.question.toLowerCase())
        }
    };

    try {
        const result = await query(similarityData, qnaPairs);

        if (result === null) {
            return { answer: defaultResponse, images: [] };
        }

        let { answer } = result;

        // Convert HTML to plain text using turndown
        const plainTextAnswer = turndownService.turndown(answer);

        // Replace double asterisks with a single one for WhatsApp formatting
        answer = plainTextAnswer.replace(/\*\*/g, '*');

        return { answer, images: result.images || [] };
    } catch (error) {
        console.error('Error getting answer:', error.message);
        throw new Error("Error getting answer");
    }
}


async function start(client) {
    console.log('WhatsApp client is ready!');

    const processedQuestions = new Map(); // Using a Map to store processed questions and their associated data

    client.onMessage(async message => {
        try {
            if (message.from.includes('@c.us') && !processedQuestions.has(message.body)) {
                processedQuestions.set(message.body, { processed: true });

                console.log('Received question:', message.body);

                const qnaPairs = await QnaModel.find();

                const { answer, images } = await getAnswer(message.body.toLowerCase(), qnaPairs);

                console.log('Selected answer:', answer);

                // Log images to be sent
                console.log('Images to be sent:', images);

                // Send images if available
                if (images && images.length > 0) {
                    if (images.length === 1) {
                        // Single image case: Send the image with the caption of the text answer
                        const imagePath = path.join(__dirname, '../uploads', images[0]);
                        console.log('Image path:', imagePath);

                        if (fs.existsSync(imagePath)) {
                            console.log('Image exists:', images[0]);

                            if (answer && answer.trim() !== '') {
                                console.log('Sending image with caption:', images[0]);
                                await client.sendImage(message.from, imagePath, images[0], answer);
                                console.log('Image sent successfully with caption:', images[0]);
                            } else {
                                console.log('Sending image without caption:', images[0]);
                                // No text answer, send the image without a caption
                                await client.sendImage(message.from, imagePath, images[0]);
                                console.log('Image sent successfully:', images[0]);
                            }
                        } else {
                            console.warn('Image not found:', images[0]);
                        }
                    } else {
                        // Multiple images case: Send each image in a loop
                        for (const imageName of images) {
                            const imagePath = path.join(__dirname, '../uploads', imageName);
                            console.log('Image path:', imagePath);

                            if (fs.existsSync(imagePath)) {
                                console.log('Image exists:', imageName);
                                console.log('Sending image:', imageName);
                                await client.sendImage(message.from, imagePath, imageName);
                                console.log('Image sent successfully:', imageName);
                            } else {
                                console.warn('Image not found:', imageName);
                            }
                        }

                        // If there is no text answer, return early
                        if (!answer || answer.trim() === '') {
                            console.log('No text answer to be sent.');
                            return;
                        }
                    }
                } else {
                    console.log('No images to be sent.');
                }

                // Send text-only answer if available
                if (answer && answer.trim() !== '' && !(images && images.length === 1)) {
                    // Exclude sending text answer if there's a single image
                    await client.sendText(message.from, answer);
                    console.log('Text-only answer sent successfully');
                }

            } else {
                console.log('Ignoring repeated message or message from group, status, or other source.');
            }
        } catch (error) {
            console.error('Error processing message:', error.message);
        }
    });
}
