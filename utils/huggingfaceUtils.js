// utils/huggingfaceUtils.js
const fetch = require('node-fetch');

async function queryHuggingFaceModel(data) {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
            {
                headers: { Authorization: "Bearer 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" },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error querying Hugging Face model:', error.message);
        throw new Error("Error querying Hugging Face model");
    }
}

module.exports = {
    queryHuggingFaceModel,
};
