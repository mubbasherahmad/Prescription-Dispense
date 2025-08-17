# Prescription Dispense App

This project is a full-stack web application that allows pharmacists to manage prescriptions and record dispensing details. The backend is built with Node.js, Express, and MongoDB, while the frontend is developed using React. The app is deployed on an AWS EC2 instance using Nginx and PM2.

## Project Setup Instructions

### Prerequisites

- Node.js and npm installed
- MongoDB connection string (Atlas or local)
- Git installed

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5001
```

4. Start the backend with PM2:
```bash
pm2 start server.js --name backend
```

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update the `axiosInstance.js` file to point to the backend API URL.

4. Start the frontend with PM2:
```bash
pm2 start npm --name frontend -- run start
```

### Run on EC2 Instance

Nginx is configured to serve the frontend and proxy API requests to the backend.

After rebooting, run:
```bash
pm2 resurrect
pm2 status
```

## Public URL

- **Frontend:** http://13.55.31.24
- **Backend API:** http://13.55.31.24:5001

## Login Credentials

For demo and testing purposes, you can log in with these credentials:

```
Email: test@example.com
Password: password123
```

**Note:** These are the seeded test user credentials for accessing the application.

## Local Development

The app will run on `http://localhost:3000` by default.




