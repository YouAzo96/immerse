# Immerse

Immerse is a microservices-based web application designed to provide a modular, secure platform for user interaction with real-time communication features. It employs a gateway architecture with token-based authentication and push notifications, and leverages both REST and socket communication. The project is containerized for ease of development and was intended for cloud deployment.

---

## 🚀 Features

- API Gateway with JWT verification and routing
- Socket-based communication between services
- Authentication service for secure login and registration
- User profile service
- Push notifications via Firebase Cloud Messaging
- Planned WebRTC support for video/audio calls (not implemented)
- Dockerized development environment

---

## 🏗️ System Design

Immerse is composed of four backend microservices:

1. **Gateway Service**
   - Acts as a single entry point for all frontend requests
   - Verifies JWT tokens and routes requests to appropriate services
   - Communicates over HTTP and sockets

2. **Authentication Service**
   - Issues and verifies JWT tokens
   - Handles user registration and login

3. **User Service**
   - Manages user data
   - Accepts authenticated requests via the gateway

4. **Notifications Service**
   - Sends real-time notifications using Firebase Cloud Messaging (FCM)
   - Pushes notifications directly to the frontend

> 🔌 **Inter-Service Communication**:  
> REST and WebSockets are used where applicable for synchronous and event-driven communication between services.

> 🎥 **WebRTC Support**:  
> WebRTC-based audio/video communication was planned, but not implemented due to the complexity of setting up a TURN server for NAT traversal.

---

## 🧰 Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js, Socket.io
- **Authentication**: JSON Web Tokens (JWT)
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Real-Time Comms**: WebSockets (Socket.io), WebRTC (planned)
- **Containerization**: Docker
- **CI/CD (Planned)**: GitHub Actions + IBM Cloud

---

## ⚖️ Tradeoffs Made

| Decision | Tradeoff |
|---------|----------|
| Shared database | Simplifies data handling but reduces service independence |
| No TURN server | Avoided cost/complexity but blocked WebRTC functionality |
| No centralized logs | Limited observability and harder debugging |
| No service discovery | Services are hardcoded, less scalable |
| Minimal gateway logic | No rate limiting, caching, or circuit breaking |

---

## ❗ Shortcomings and Improvements

| Shortcoming | Suggested Solution |
|-------------|--------------------|
| I used a single shared database | I plan to move to per-service databases for full microservice isolation. This will improve scalability and allow each service to handle its own data more effectively. |
| I didn’t implement a TURN/STUN server for WebRTC | I'll need to either integrate a public STUN server or set up a TURN server using Coturn. This will allow WebRTC functionality to work across different NAT configurations. |
| There’s no centralized logging | I'll add a logging service like Winston, Logstash, or integrate with the ELK stack for better observability across all services. This will make it easier to debug and monitor the system. |
| I didn’t include service discovery | I plan to integrate a service discovery mechanism like Consul or move to Kubernetes, which would handle dynamic service registration and allow for easier scaling. |
| The API Gateway doesn’t include resilience features like caching or rate limiting | I’ll add features like caching, rate limiting, and circuit breaking to the gateway to enhance performance and reliability. I might use Nginx or Kong for these features. |
| Deployment is incomplete | I need to finalize the CI/CD pipeline using GitHub Actions and deploy the app to IBM Cloud to get it into a production environment. |

---



## Prerequistes
Please make sure you have the following installed:

- Yarn 
- NodeJS
- Git
- Mysql: We do not have the database online yet, so you will need mysql and workbench or way to interact with it.

## Installation

Once you install the prerequisites, download the repo. Inside the repo you will find an sql dump holding the schema to the database, import it in workbench or however you'd prefer. Please also update the dbconfig file in immerse/backend/envRoutes to put your mysql username and password.

Once you have finished the above step you can run the following commands into the command prompt from the root directory of the project 

npm install: This will install all the dependencies

if for any reason you get dependency error, navigate to the frontend (CD frontend) and run yarn install and the backend folder and run the command again.

Once they all download, you can run npm start (at the root of the of the project), which is set in the package.json to run all the microservices at the same time, should you wise to run them separately, the package.json file
has the commands you should run for each microservice inside of 'start:#NAMEOFMICROSERVICE'
