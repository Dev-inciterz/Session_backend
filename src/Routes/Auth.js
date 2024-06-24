const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/Users');

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '30d' });
        user.token = token;
        user.tokenExpire = Date.now() + 30 * 24 * 60 * 60 * 1000;

        await user.save();
        res.json({ token, expiresIn: user.tokenExpire });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (user.tokenExpire < Date.now()) {
            const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '30d' });
            user.token = token;
            user.tokenExpire = Date.now() + 30 * 24 * 60 * 60 * 1000;
            await user.save();
        }

        res.json({ token: user.token, expiresIn: user.tokenExpire });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
