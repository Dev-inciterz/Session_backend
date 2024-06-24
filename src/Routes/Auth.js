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
        console.log("this is the user", email, password)
        res.json({ token, expiresIn: user.tokenExpire });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


//Login
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

        // Check if tokenExpire is already set
        if (!user.tokenExpire) {
            // If tokenExpire is not set (this should ideally not happen if set correctly during signup)
            return res.status(400).json({ msg: 'Token expiration details missing' });
        }

        // Generate a new token (if needed, e.g., if token has expired)
        if (user.tokenExpire < Date.now()) {
            const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '30d' });
            user.token = token;
            user.tokenExpire = Date.now() + 30 * 24 * 60 * 60 * 1000;
            await user.save();
        } else {

            const token = jwt.sign({ userId: user.id }, 'your_jwt_secret');
            user.token = token;
            await user.save();

        }

        // Return the existing or newly generated token and its expiration time
        res.json({ token: user.token, expiresIn: user.tokenExpire });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});




// Logout
router.post('/logout', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, 'your_jwt_secret');
  
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Invalidate the current token (optional: you can also clear it if desired)
      user.token = null;
  
      await user.save();
  
      res.json({ msg: 'Logged out successfully' });
    } catch (err) {
      console.error(err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ msg: 'Invalid token' });
      }
      res.status(500).send('Server error');
    }
  });
  

module.exports = router;
