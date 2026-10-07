# HR Manager

A full-stack Human Resource Management System designed for managing employee/personnel records, employment history, travel entries, pass slips, departments, and other HR-related information.

The application is built as a **Vue 3 + Vite frontend** with a **Node.js + Express backend** and **PostgreSQL** database.

---

## Tech Stack

### Frontend

* Vue 3
* Vite
* Vue Router
* Pinia
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js
* PostgreSQL
* REST API
* PM2

### Development & Deployment

* Git / GitHub
* npm
* PM2
* Windows Server/PC
* Batch-based CI/CD pipeline

---

## Project Structure

```text
HR-Manager/
│
├── backend/
│   ├── db/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   ├── router/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── cicd.bat
├── cicd_pipeline.log
├── .gitignore
└── README.md
```

---

# Features

The system is intended to centralize common HR and personnel management tasks.

### Personnel Management

* View personnel records
* Add new personnel
* Update personnel information
* Search and filter personnel
* Assign personnel to departments
* View individual personnel profiles

### Employment History

* Record employment history
* Track appointment periods
* Record job position
* Record employment/job type
* Maintain multiple employment records for personnel

### Travel Management

* Create travel entries
* Track travel status
* Record inclusive travel dates
* Record destination and purpose
* Assign travel entries to personnel and departments
* Track travel numbers
* Automatically generate travel numbers

### Pass Slips

* Create personnel pass slips
* Record destination and purpose
* Track departure and arrival
* Record inclusive dates
* Automatically generate pass numbers
* Track whether personnel have returned

### Department Management

* Manage personnel department assignments
* Associate HR records with departments
* Support department-based filtering and reporting

---

# Requirements

Before running the project, make sure the following are installed:

* [Node.js](https://nodejs.org/)
* npm
* PostgreSQL
* Git
* PM2 (for production)

PM2 can be installed globally with:

```bash
npm install -g pm2
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/mrnurios/HR-Manager.git
```

Enter the project directory:

```bash
cd HR-Manager
```

---

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_manager
DB_USER=postgres
DB_PASSWORD=your_password
```

Adjust the database configuration according to your PostgreSQL installation.

Start the backend:

```bash
npm start
```

or, depending on the scripts defined in `package.json`:

```bash
npm run dev
```

The backend
