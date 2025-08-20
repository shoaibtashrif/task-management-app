# Task Management Application

A full-stack task management application built with React, TypeScript, Node.js, and PostgreSQL. This application provides a Kanban-style board interface for managing tasks, lists, and boards with real-time updates and a modern, responsive design.

## 🚀 Features

- **Kanban Board Management**: Create, edit, and delete boards for different projects
- **List Organization**: Organize tasks into customizable lists within boards
- **Task Management**: Add, edit, delete, and move tasks between lists
- **Drag & Drop Interface**: Intuitive drag and drop functionality for task management
- **Real-time Updates**: Instant updates across all connected clients
- **Responsive Design**: Modern UI that works on desktop and mobile devices
- **User Authentication**: Secure user management system
- **Database Persistence**: PostgreSQL database with proper schema design

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React DnD** for drag and drop functionality
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **Rate limiting** for API protection
- **CORS** configuration for security

## 📁 Project Structure

```
interview-tests/
├── client/                 # React frontend application
├── server/                 # Node.js backend application
├── .gitignore            # Git ignore rules
├── README.md             # Project documentation
└── vercel.json           # Vercel deployment configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
2. **Set up the backend**: `cd server && npm install`
3. **Set up the frontend**: `cd client && npm install`
4. **Configure environment variables**
5. **Start the application**

## 🗄️ Database Setup

The application uses PostgreSQL with tables for users, boards, lists, and tasks.

## 🌐 API Endpoints

RESTful API endpoints for managing boards, lists, and tasks with proper CRUD operations.

## 🚀 Deployment

- Frontend: Configured for Vercel deployment
- Backend: Can be deployed to any Node.js hosting service

## 👨‍💻 Author

**Shoaib Tashrif**
- GitHub: [@shoaibtashrif](https://github.com/shoaibtashrif) 