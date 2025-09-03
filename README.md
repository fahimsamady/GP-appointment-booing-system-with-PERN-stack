# 🏥 GP Appointment Booking System with Chat Service

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue.svg" alt="React Version" />
  <img src="https://img.shields.io/badge/Node.js-Express-green.svg" alt="Backend" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue.svg" alt="Database" />
  <img src="https://img.shields.io/badge/Chat-Service-orange.svg" alt="Chat Service" />
  <img src="https://img.shields.io/badge/Docker-Containerized-blue.svg" alt="Docker" />
</p>

<p align="center">
  A comprehensive GP (General Practitioner) appointment booking system built with the PERN stack, featuring real-time chat communication between patients and doctors.
</p>

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Chat System](#-chat-system)
- [User Roles](#-user-roles)
- [Database Schema](#-database-schema)
- [Docker Deployment](#-docker-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Features
- **User Authentication & Authorization** - Secure login system with JWT tokens
- **Appointment Management** - Book, reschedule, and cancel appointments
- **Doctor Availability** - Real-time doctor scheduling and availability
- **Prescription Management** - Digital prescription system
- **Patient Records** - Comprehensive patient information management
- **Admin Dashboard** - Complete administrative control panel
- **Real-time Chat** - Direct communication between patients and doctors
- **Notifications** - Email and in-app notifications
- **Responsive Design** - Mobile-friendly interface

### 💬 Chat System Features
- **Real-time Messaging** - Instant communication between patients and doctors
- **Conversation Management** - Create, view, and manage chat conversations
- **Unread Message Count** - Track unread messages with visual indicators
- **Floating Chat Widget** - Always-accessible chat button
- **Appointment Integration** - Start chats directly from appointment context
- **Message Notifications** - Real-time notifications for new messages
- **Mobile Responsive** - Chat works seamlessly on all devices

### 🔐 User Management
- **Multi-role System** - Patients, Doctors, and Administrators
- **Profile Management** - Complete user profile system
- **Contact Information** - Emergency contacts and communication details
- **Address Management** - Multiple address support

## 🛠 Tech Stack

### Frontend
- **React 18.2.0** - Modern UI library
- **Flowbite React** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client with authentication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize** - ORM for database operations
- **JWT** - JSON Web Tokens for authentication
- **CORS** - Cross-origin resource sharing

### Database
- **PostgreSQL** - Primary database
- **Sequelize Migrations** - Database version control
- **Database Seeders** - Sample data population

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📁 Project Structure

```
GP-appointment-booking-system-with-PERN-stack/
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── Pages/                   # Main page components
│   │   │   ├── Chat.js             # Chat interface
│   │   │   ├── Appointments.js     # Appointment management
│   │   │   ├── Prescription.js     # Prescription management
│   │   │   ├── AdminDashboard.js   # Admin panel
│   │   │   └── ...
│   │   ├── pagesComponents/         # Reusable components
│   │   │   ├── ChatWidget.js       # Floating chat widget
│   │   │   ├── ChatIntegration.js  # Chat integration component
│   │   │   ├── sidebar.js          # Navigation sidebar
│   │   │   └── ...
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── middelware/              # Axios configuration
│   │   └── assets/                  # Images and icons
│   ├── package.json
│   └── Dockerfile
├── server/                          # Node.js Backend
│   ├── controllers/                 # Business logic
│   │   ├── ChatController.js       # Chat functionality
│   │   ├── AppointmentController.js # Appointment logic
│   │   ├── DoctorController.js     # Doctor management
│   │   └── ...
│   ├── models/                      # Database models
│   ├── routes/                      # API routes
│   │   ├── chatRoutes.js           # Chat API endpoints
│   │   ├── appointmentRoutes.js    # Appointment endpoints
│   │   └── ...
│   ├── middleware/                  # Custom middleware
│   ├── migrations/                  # Database migrations
│   ├── seeders/                     # Database seeders
│   ├── config/                      # Configuration files
│   ├── services/                    # Business services
│   └── utils/                       # Utility functions
├── docker-compose.yml               # Docker configuration
└── README.md
```

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Docker** and **Docker Compose** (optional, for containerized deployment)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/GP-appointment-booking-system-with-PERN-stack.git
cd GP-appointment-booking-system-with-PERN-stack
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd server
npm install
```

#### Frontend Dependencies
```bash
cd ../client
npm install
```

### 3. Database Setup

#### Option A: Local PostgreSQL
1. Create a PostgreSQL database
2. Update database configuration in `server/config/database.js`

#### Option B: Docker PostgreSQL
```bash
# Run PostgreSQL in Docker
docker run --name gp-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=gp_appointment_db -p 5432:5432 -d postgres:13
```

### 4. Environment Configuration

Create environment files:

#### Backend (.env in server directory)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gp_appointment_db
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

#### Frontend (.env in client directory)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## ⚙️ Configuration

### Database Configuration

Update `server/config/database.js`:

```javascript
module.exports = {
  development: {
    username: process.env.DB_USER || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'gp_appointment_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  }
};
```

### CORS Configuration

Update `server/config/corsOptions.js` to include your frontend URL:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Add your production domain here
];
```

## 🏃‍♂️ Running the Application

### Development Mode

#### 1. Start the Backend Server
```bash
cd server
npm run dev
# Server will start on http://localhost:5000
```

#### 2. Start the Frontend
```bash
cd client
npm start
# Frontend will start on http://localhost:3000
```

### Production Mode

#### Using Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

#### Manual Production Build
```bash
# Build frontend
cd client
npm run build

# Start backend in production
cd ../server
npm start
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Appointment Endpoints
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Chat Endpoints
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id/messages` - Get conversation messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `GET /api/chat/available-doctors` - Get available doctors for chat
- `GET /api/chat/available-patients` - Get available patients for chat
- `GET /api/chat/unread-count` - Get unread message count

### Doctor Endpoints
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id/availability` - Get doctor availability
- `POST /api/doctors/availability` - Set doctor availability

### Patient Endpoints
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id/appointments` - Get patient appointments
- `POST /api/patients` - Create patient record

## 💬 Chat System

### Features
- **Real-time Messaging**: Instant communication between patients and doctors
- **Conversation Management**: Create, view, and manage chat conversations
- **Unread Notifications**: Visual indicators for unread messages
- **Floating Widget**: Always-accessible chat button
- **Appointment Integration**: Start chats from appointment context

### Usage

#### For Patients:
1. Navigate to "Messages" in the sidebar or click the floating chat button
2. Click "New Chat" to start a conversation with a doctor
3. Select a doctor and send your initial message
4. Continue the conversation in real-time

#### For Doctors:
1. Access chat through the sidebar or floating widget
2. View all patient conversations
3. Respond to patient messages
4. Manage conversations as needed

### Integration
The chat system integrates seamlessly with the appointment system:
- Start chats directly from appointment details
- Context-aware conversation creation
- Real-time notifications for new messages

## 👥 User Roles

### 1. **Patient** (User Type ID: 2)
- Book and manage appointments
- View prescription history
- Chat with doctors
- Update personal information
- View appointment history

### 2. **Doctor** (User Type ID: 3)
- Manage appointment schedule
- View patient information
- Create and manage prescriptions
- Chat with patients
- Set availability

### 3. **Administrator** (User Type ID: 1)
- Full system access
- Manage all users
- System configuration
- View system analytics
- Manage appointments and prescriptions

## 🗄️ Database Schema

### Core Tables
- **users** - User authentication and basic info
- **profiles** - Extended user profile information
- **user_types** - User role definitions
- **patients** - Patient-specific information
- **doctors** - Doctor-specific information
- **admins** - Administrator information

### Appointment System
- **appointments** - Appointment records
- **appointment_status** - Status definitions
- **appointment_requests** - Appointment requests
- **doctor_availability** - Doctor schedule management

### Chat System
- **conversations** - Chat conversation records
- **messages** - Individual chat messages
- **conversation_participants** - Conversation membership

### Additional Tables
- **prescriptions** - Prescription records
- **addresses** - User address information
- **contact_information** - Contact details
- **emergency_contacts** - Emergency contact information
- **notifications** - System notifications

## 🐳 Docker Deployment

### Using Docker Compose

1. **Clone and navigate to project**:
```bash
git clone <repository-url>
cd GP-appointment-booking-system-with-PERN-stack
```

2. **Start all services**:
```bash
docker-compose up --build
```

3. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

### Docker Services
- **Frontend**: React application (Port 3000)
- **Backend**: Node.js/Express API (Port 5000)
- **Database**: PostgreSQL (Port 5432)

### Environment Variables for Docker
Create a `.env` file in the root directory:
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=gp_appointment_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

### Database Testing
```bash
cd server
npm run test:db
```

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

### Mobile Features
- Touch-friendly interface
- Responsive chat widget
- Mobile-optimized forms
- Swipe gestures support

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt password encryption
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Server-side input validation
- **SQL Injection Protection** - Sequelize ORM protection
- **Rate Limiting** - API request rate limiting

## 🚀 Deployment

### Production Deployment

1. **Build the application**:
```bash
# Frontend
cd client
npm run build

# Backend
cd ../server
npm install --production
```

2. **Set up production database**:
```bash
cd server
npm run migrate:prod
npm run seed:prod
```

3. **Start production server**:
```bash
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=gp_appointment_db_prod
DB_USER=your_production_user
DB_PASSWORD=your_production_password
JWT_SECRET=your_production_jwt_secret
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/GP-appointment-booking-system-with-PERN-stack/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Express.js Team** - For the robust backend framework
- **PostgreSQL Team** - For the reliable database system
- **Flowbite** - For the beautiful UI components
- **Tailwind CSS** - For the utility-first CSS framework

---

<p align="center">
  <strong>Built with ❤️ for better healthcare communication</strong>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/5b533bf8-597a-4a4b-928c-d0297c2d4ffe" alt="Screenshot 1" width="200" />
  <img src="https://github.com/user-attachments/assets/4c92d143-e0c4-4543-bfe0-581d69bd96cb" alt="Screenshot 2" width="200" />
  <img src="https://github.com/user-attachments/assets/deef9aaa-d371-4f3c-9ea1-13f4038be25a" alt="Screenshot 3" width="200" />
  <img src="https://github.com/user-attachments/assets/4e9ebc8b-fce7-4fe7-a085-6ff2d5be1341" alt="Screenshot 4" width="200" />
  <img src="https://github.com/user-attachments/assets/e89fbb22-6054-4356-bf9c-f339ad16fd5e" alt="Screenshot 5" width="200" />
</p>
