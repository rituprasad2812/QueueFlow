# QueueFlow 🚦

QueueFlow is a digital queue management system that allows customers to join a queue online and track their position in real time. Staff can manage counters and call the next token, while admins control queues, staff, and view analytics.

## 🌐 Live Demo
[queueflow-line.vercel.app](https://queueflow-line.vercel.app)

## ✨ Features
- Join queue and get a digital token
- Real-time position updates (Socket.io)
- Staff counter view (Call next / Serve / Skip)
- Admin dashboard with queue analytics
- Role-based authentication (Admin / Staff / Customer)
- QR code support for quick joining

## 🛠 Tech Stack
**Frontend:** React (Vite), Axios, Socket.io Client  
**Backend:** Node.js, Express, MongoDB, Socket.io  
**Auth:** JWT (Role-based access control)

## ⚙️ How It Works
1. Customer joins queue and receives a token.
2. Staff calls next token from their counter.
3. All updates reflect instantly using WebSockets.
4. Admin monitors performance through dashboard analytics.
