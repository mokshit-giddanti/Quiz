# Quiz Application

This project is a web-based quiz platform that allows users to take quizzes and view their results. The platform also includes an admin interface to manage quizzes and view users' scores.

## Features

- User Authentication (Registration & Login)
- Admin dashboard for creating and managing quizzes
- Users can take quizzes and view their scores
- JWT-based authentication
- MongoDB database integration

## Technologies Used

- Frontend: HTML, JavaScript
- Backend: Node.js, Express.js, MongoDB
- Authentication: JWT
- Styling: TailwindCSS (or any other if applicable)

## Installation

### Backend Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/mokshit-giddanti/Quiz.git
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Set up environment variables in a `.env` file:
    ```bash
    MONGO_URI=your_mongo_db_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=3000
    ```

4. Start the server:
    ```bash
    npm start
    ```

### Frontend Setup
1. Navigate to the `FRONTEND` folder:
    ```bash
    cd ../FRONTEND
    ```

2. Open `index.html` in a browser to start the application.

## API Endpoints

### Auth
- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - User login

### Admin
- **POST** `/api/admin/quizzes` - Create a quiz (Admin only)
- **DELETE** `/api/admin/quizzes/:id` - Delete a quiz (Admin only)
- **GET** `/api/admin/results` - View all results (Admin only)

### Quizzes
- **GET** `/api/quizzes` - Get all quizzes
- **GET** `/api/quizzes/:id` - Get a quiz by ID
- **POST** `/api/quizzes/:id/submit` - Submit quiz and get score


