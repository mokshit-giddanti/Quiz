const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// User Model (Including 'isAdmin' Field)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },  // Flag for admin
});
const User = mongoose.model('User', UserSchema);

// Quiz Model
const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [
        {
            questionText: { type: String, required: true },
            options: [
                {
                    optionText: { type: String, required: true },
                }
            ],
            correctOption: { type: Number, required: true },  // Correct option index (0-3)
        }
    ],
});
const Quiz = mongoose.model('Quiz', QuizSchema);

// Result Model
const ResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
});
const Result = mongoose.model('Result', ResultSchema);

// Middleware for authentication
const auth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send({ message: 'Invalid token.' });
    }
};

// Middleware for admin-only routes
const adminAuth = (req, res, next) => {
    if (!req.user.isAdmin) return res.status(403).send({ message: 'Access denied. Admins only.' });
    next();
};

// User Registration
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, isAdmin } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, isAdmin });

        await newUser.save();
        res.send({ message: 'Registration successful' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
