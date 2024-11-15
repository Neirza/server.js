require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); 

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3111;  

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

let generatedCode;
let userEmail;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,  
    },
});

app.post('/send-code', (req, res) => {
    userEmail = req.body.email;
    generatedCode = Math.floor(100000 + Math.random() * 900000); 
    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: userEmail,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${generatedCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again.' });
        } else {
            console.log('Email sent: ' + info.response);
            res.json({ success: true, message: 'Verification code sent to your email.' });
        }
    });
});

app.post('/verify-code', (req, res) => {
    const { code } = req.body;

    if (parseInt(code) === generatedCode) {
        res.json({ success: true, message: 'Email verified successfully!' });
    } else {
        res.json({ success: false, message: 'Invalid verification code. Please try again.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/verified.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verified.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
