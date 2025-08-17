# Prescription Dispense System

A web app for pharmacists to receive, validate, and dispense prescriptions.  
Backend: Node.js (Express) + MongoDB.  
Frontend: React.  
Deployed on AWS EC2 behind NGINX, managed with PM2.

---

## Features
- Create, view, and manage prescriptions
- Validate and mark prescriptions as dispensed
- Simple pharmacist-only interface with secure login
- REST API with JSON responses

---

## Tech Stack
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Frontend: React (Create React App)
- Infra: AWS EC2, NGINX reverse proxy, PM2 process manager
- CI/CD: GitHub Actions (optional)

---


## Environment Variables (backend/.env)
Create a file `backend/.env`:
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority&appName=<appName>
JWT_SECRET=<any_long_random_string>
PORT=5001

## Local Development

### Backend
```bash
cd backend
npm install
npm start

### Frontend
```bash
cd frontend
npm install
npm start
```

The app will run on `http://localhost:3000` by default.




