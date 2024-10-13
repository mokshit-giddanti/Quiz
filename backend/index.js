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




// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
