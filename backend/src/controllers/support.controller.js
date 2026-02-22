const Contact = require('../models/contact.model');

// Send contact message
exports.sendContactMessage = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({
            status: 'success',
            message: 'Message sent successfully! We will get back to you soon.',
            data: {
                contact
            }
        });
    } catch (err) {
        next(err);
    }
};

// Get all contact messages (Admin only - though I won't implement the full admin side now unless needed)
exports.getAllContactMessages = async (req, res, next) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: {
                messages
            }
        });
    } catch (err) {
        next(err);
    }
};
