# VitalityAI - Student Health Companion 🌿

A modern, responsive full-stack web application designed for students to track their health, analyze food, monitor air quality, and interact with an AI health companion.

## 🚀 Built With
- **React 19**
- **Vite**
- **Tailwind CSS v4** (with clean UI, soft colors, and glassmorphism styling)
- **Redux Toolkit** (Global state management)
- **React Router v7** (Declarative routing)
- **Framer Motion** (Smooth animations and interactions)
- **Lucide Icons**
- **Recharts** (Health dashboard charts)

## 📂 Project Structure
```text
src/
├── components/      # Reusable UI components
│   ├── Layout.jsx   # Main application wrapper
│   └── Navbar.jsx   # Responsive navigation bar
├── pages/           # Application views
│   ├── Home.jsx         # Landing page
│   ├── Login.jsx        # Authentication (Login)
│   ├── Register.jsx     # Authentication (Register/Signup)
│   ├── Dashboard.jsx    # Student & Admin dashboard metrics
│   ├── FoodAnalysis.jsx # AI-powered food nutrition analyzer 
│   ├── WeatherAQI.jsx   # Pollutant index and weather viewer
│   └── Chatbot.jsx      # Wellness AI Chat
├── store/           # Redux state management
│   ├── index.js     # Redux store configuration
│   └── slices/      # Redux slices (authSlice, healthSlice)
├── App.jsx          # Router registry
├── main.jsx         # Entry point
└── index.css        # Tailwind directives and custom colors
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
Switch into the frontend folder if you aren't already there. All the dependencies have been generated for you, but just in case, ensure you are in the `Frontened` directory and install them:
```bash
cd Frontened
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Open the App
Open your browser and navigate to `http://localhost:5173`. You will instantly see the futuristic landing page.

## ✨ Features Breakdown
- **Smooth Navigation**: Framer Motion powers page transitions and element reveals giving it a premium feel.
- **Glassmorphism Theme**: Uses Tailwind's `backdrop-blur-md` on various cards for that elegant ultra-modern look incorporating health-centered colors (`#10b981` (Green) and `#0ea5e9` (Blue)). 
- **Mock AI Models**: Chatbot and Food Analysis contain interactive mock functions simulating actual API delayed analysis.
- **Role-Based Setup**: Switch between Student and Admin dashboards by manually adjusting the Redux `login` action mock state in the Login Component.
