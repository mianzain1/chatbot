const { translate } = require('@vitalets/google-translate-api');

async function translateToEnglish(question, targetLanguage = 'en') {
    try {
        const translation = await translate(question, { to: targetLanguage });
        return translation.text;
    } catch (error) {
        console.error('Translation Error Details:', error);
        throw new Error(`Error translating the question: ${error.message}`);
    }
}

module.exports = translateToEnglish;
