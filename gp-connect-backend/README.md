# GP Connect Backend

This is the backend for the GP Connect application, built with Node.js, Express, and MongoDB (MERN stack).

## Table of Contents
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Connecting to Frontend](#connecting-to-frontend)
- [Deployment](#deployment)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd gp-connect-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Environment Variables

This project uses environment variables for sensitive information. You need to create a `.env` file in the root of the `gp-connect-backend` directory.

1.  **Create `.env` file:**
    Copy the `.env.example` file and rename it to `.env`:
    ```bash
    cp .env.example .env
    ```

2.  **Fill in your actual values:**
    Open the newly created `.env` file and replace the placeholder values with your own:

    ```
    MONGO_URI=mongodb+srv://<your-mongodb-username>:<your-mongodb-password>@cluster0.xxxxxx.mongodb.net/gpconnex
    JWT_SECRET=a-very-strong-secret-key-for-jwt
    PORT=5000
    ```
    *   `MONGO_URI`: Your MongoDB Atlas connection string.
    *   `JWT_SECRET`: A strong, random string used for signing JWTs.
    *   `PORT`: The port on which the server will run (default is 5000).

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the server using `nodemon`, which automatically restarts the server when file changes are detected.

## Connecting to Frontend

The frontend (gp-connect-frontend) running on `localhost:5173` will connect to this backend. Ensure your frontend's API calls are directed to:

`http://localhost:5000/api`

For example, using Axios in your React frontend:

```javascript
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Example usage:
API.post('/auth/login', { email, password })
   .then(response => console.log(response.data))
   .catch(error => console.error(error));
```

## Deployment

This backend is configured for deployment on Render.

1.  **Procfile:** A `Procfile` is included for Render to understand how to start the application.
    ```
    web: npm start
    ```

2.  **MongoDB Atlas:** The database will be MongoDB Atlas. Ensure your `MONGO_URI` in `.env` (and Render environment variables) points to your Atlas cluster.

3.  **Frontend Deployment:** The frontend is expected to be deployed separately (e.g., on Vercel). Ensure the frontend's environment variables for the API URL are correctly set for the deployed backend.

---
