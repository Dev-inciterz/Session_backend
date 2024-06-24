const express = require('express');
const connectDB = require('./src/Database/Db');
const cors = require('cors');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/Routes/Auth'));

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
