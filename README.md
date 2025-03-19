# Project Collaboration Tool
## **Author:** 
Ajay Pandey

---

## **Table of Contents**
1. [Problem Definition and Objectives](#problem-definition-and-objectives)
2. [Frontend & Backend Architecture](#frontend--backend-architecture)
3. [Component Breakdown & API Design](#component-breakdown--api-design)
4. [Database Design](#database-design)
5. [Project Directory Structure](#project-directory-structure)
6. [Instructions to Run the Project](#instructions-to-run-the-project)

---

## **Problem Definition and Objectives**

### **Brief Overview**
The **Project Collaboration Tool** is a task management system that allows users to:
- Create tasks
- Assign them to team members
- Track progress with real-time updates

### **Project Goals and Objectives**
- Provide an intuitive UI for task management.
- Assign tasks with **role-based access**.
- Track task progress (**To Do, In Progress, Completed, Failed**).
- Efficiently store and retrieve data using **MS SQL Server**.

---

## **Frontend & Backend Architecture**

### **Chosen Technology Stack**
- **Frontend:** React (Redux for state management)
- **Backend:** ASP.NET Core Web API
- **Database:** Microsoft SQL Server

---

## **Component Breakdown & API Design**

### **Frontend Components**
- **State Management:** Redux
- **Routing:** React Router
- **UI Components:** Login, Signup, Dashboard, Create Task, Manage Task, Update Status, Change Password, Forgot Password, Task History, Task Feedback/comments.

### **API Design & Endpoints**

#### **1. Authentication API**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register users (Project Manager & Users) |
| `/api/auth/login` | POST | User login |
| `/api/auth/change-password` | POST | Change password |
| `/api/auth/forgot-password` | POST | Forgot password (OTP verification) |
| `/api/auth/toggle-approval` | POST | Activate/deactivate user |
| `/api/auth/project-managers` | GET | Fetch all project managers |

#### **2. Task Management API**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks/all` | GET | Fetch all tasks |
| `/api/tasks/create` | POST | Create a new task |
| `/api/tasks/update-status` | PUT | Update task status |
| `/api/tasks/my-tasks` | GET | Fetch assigned tasks for a user |
| `/api/tasks/delete/{task-id}` | DELETE | Delete a task |
| `/api/tasks/addComment` | POST | Add a comment to a task |
| `/api/tasks/tasks/comments/{taskId}` | GET | Fetch comments of a task |
| `/api/tasks/history/{taskId}` | GET | Fetch task history |

### **Authentication Mechanism**
- **JWT Token-based authentication**
- **Role-based access control** (Admin, Project Manager, User)

---

## **Database Design**
The **Entity-Relationship Diagram (ERD)** is available in the project folder.

---

## **Project Directory Structure**
- /FullStackApp
- │── /client (React Frontend)
- │── /server (ASP.NET Core API)
- │── /database
- │── README.md


---

## **Instructions to Run the Project**

### **1. Database Setup**
- Find `setup.sql` in the **database folder**.
- Open **SQL Server Management Studio (SSMS)** and execute it.

### **2. Backend Setup**
- Open the **server folder** and load `server.sln` in **Visual Studio 2022**.
- Update the **Connection String** in `appsettings.json`:
  ```json
  "DefaultConnection": "Server=<YOUR_SERVER_NAME>;Database=FullStackAppDB;Trusted_Connection=True;TrustServerCertificate=True;"

### **3. Frontend Setup**
- After running the  server open client folder in visual studio code.
- Then type npm install to install all used libraries/modules
- after installation type npm start to start the frontend of project.


## **Admin Credentials for Login**
- Username: ajay
- Email: ajaypandey91700@gmail.com
- Password: a
  
**For Project Manager, you can register directly by selecting the role.**
