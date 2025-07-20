
# Smart Tasker Frontend

Smart Tasker is a modern, full-featured task management application that allows users to register, log in, and manage their daily tasks with a clean and responsive UI. This frontend is built using **React (Vite)** and **Tailwind CSS**, and integrates with the Smart Tasker backend (Spring Boot with JWT authentication and PostgreSQL).


## 🚀 Features

- 🔐 **JWT Authentication** (Login/Register)
- ✅ **Create, Edit, Complete, Delete Tasks**
- 📋 **View Completed & Pending Tasks**
- 📧 **Welcome Email on Registration**
- 🌙 **Responsive Premium UI** (Desktop)
- ⚡ **Fast Build Setup** with Vite + Tailwind

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, React Router
- **State Management:** useState, useEffect (optional Redux for scaling)
- **Backend Integration:** REST APIs with JWT Auth

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Smart Tasker Backend running (see [Backend Repo](https://github.com/KumarPadigeri/smart-tasker))

### Installation

```bash
git clone https://github.com/KumarPadigeri/smart-tasker-ui.git
cd smart-tasker-ui
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## 🔧 Environment Variables

Create a `.env` file in the root with the following:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Make sure this matches your backend URL.

---

## 📁 Project Structure

```
src/
│
├── components/         # Reusable UI components
├── pages/              # App pages (Login, Register, Dashboard, etc.)
├── services/           # API services (axios, auth)
├── hooks/              # Custom React hooks (optional)
├── config/             # API base URLs, headers, etc.
├── App.tsx             # Main App routing
└── main.tsx            # Entry point
```

---

## 🧪 Future Enhancements

- Task Categories and Filters
- Due Date Reminders
- Drag & Drop Task Sorting
- Progressive Web App (PWA)

---

## 👨‍💻 Author

Kumara Swamy Padigeri  
[LinkedIn](https://www.linkedin.com/in/kumaraswamypadigeri) | [Portfolio](https://kumarpadigeri.wixsite.com/web-developer)
