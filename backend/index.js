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

// User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });
        res.send({ token, isAdmin: user.isAdmin });  // Send isAdmin in the response
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Admin - Create a Quiz
app.post('/api/admin/quizzes', auth, adminAuth, async (req, res) => {
    const { title, questions } = req.body;

    try {
        const quiz = new Quiz({ title, questions });
        await quiz.save();
        res.send({ message: 'Quiz created successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Admin - Delete a Quiz
app.delete('/api/admin/quizzes/:id', auth, adminAuth, async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).send('Quiz not found');

        res.send({ message: 'Quiz deleted successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Admin - View All Users' Results
app.get('/api/admin/results', auth, adminAuth, async (req, res) => {
    try {
        const results = await Result.find().populate('user quiz');
        res.send(results);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get All Quizzes (For both users and admin)
app.get('/api/quizzes', auth, async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.send(quizzes);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get Quiz by ID (For both users and admin)
app.get('/api/quizzes/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).send('Quiz not found');
        res.send(quiz);
    } catch (err) {
        res.status(500).send('Server error');
    }
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
