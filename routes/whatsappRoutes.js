const express = require('express');
const router = express.Router();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { isLoggedIn, getWhatsappClient, setWhatsappClient, logout } = require('../modules/whatsappBot');
const path = require('path');

// Middleware to check if user is logged in
router.use(isLoggedIn);

// Route to display the connection status and QR code
router.get('/connection', async (req, res) => {
    const client = getWhatsappClient();

    if (!client) {
        // If the client is not already initialized, create a new instance
        const newClient = new Client();
        setWhatsappClient(newClient);

        // Generate QR code for the new client
        newClient.on('qr', qr => {
            qrcode.toDataURL(qr, (err, url) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.sendFile(path.join(__dirname, '../public/connection.html'), { qrCode: url });
                }
            });
        });

        // Connect the client
        newClient.initialize();
    } else {
        // If the client is already initialized, check if it's connected
        const isConnected = client?.isConnected();

        if (isConnected) {
            res.sendFile(path.join(__dirname, '../public/connection.html'), { isConnected });
        } else {
            // If not connected, generate QR code again
            client.on('qr', qr => {
                qrcode.toDataURL(qr, (err, url) => {
                    if (err) {
                        console.error('Error generating QR code:', err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.sendFile(path.join(__dirname, '../public/connection.html'), { qrCode: url });
                    }
                });
            });

            // Connect the client again
            client.initialize();
        }
    }
});

// Route to logout from WhatsApp Web
router.post('/logout', (req, res) => {
    logout();
    res.redirect('/whatsapp/connection');
});

module.exports = router;
