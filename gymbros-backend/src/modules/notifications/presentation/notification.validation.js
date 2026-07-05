// src/middlewares/notificationValidation.js
const { body, validationResult } = require('express-validator');

const validateNotification = [
    body('judul').notEmpty().withMessage('Judul tidak boleh kosong').isString(),
    body('pesan').notEmpty().withMessage('Pesan tidak boleh kosong').isString(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateNotification };