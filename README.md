# 🧠 StudentCare – Zero Friction AI Health Companion

StudentCare is an AI-powered platform designed to help students monitor their **diet, academic workload, environment, and overall wellbeing** with minimal effort. It combines **computer vision, real-time environmental data, and intelligent insights** into a seamless experience.

---

## 🚀 Features

### 🍱 AI Food Recognition

* Upload food images from the frontend
* Detect food items using **LogMeal API**
* High accuracy food identification

---

### 🥗 Nutrition Analysis

* Fetch real nutritional data (calories, protein, etc.)
* Intelligent mapping from detected food → nutrition insights

---

### 📅 Academic Calendar Intelligence

* Upload academic calendar in **PDF / CSV / JSON formats**

* Automatically converts data into structured **JSON format**

* Extracts:

  * Exams, deadlines, classes
  * Time distribution & workload density

* Generates:

  * 📊 **Stress level estimation based on schedule intensity**
  * Identification of busy vs relaxed periods

---

### 🌫️ Real-Time AQI & Weather Insights

* Fetches **Air Quality Index (AQI)** using weather APIs

* Provides:

  * Real-time environmental conditions
  * Health-aware suggestions (e.g., outdoor activity warnings)

* Helps students:

  * Adjust routines based on air quality
  * Make smarter lifestyle decisions

---

### 🤖 AI Chatbot Assistant

* Interactive chatbot for:

  * Guidance on using the platform
  * Answering health-related queries
  * Explaining insights (diet, stress, AQI)

* Acts as a **personal assistant for student wellbeing**

---

### 📊 Health & Lifestyle Tracking

* Monitor food intake and patterns
* Understand correlation between:

  * Diet 🍱
  * Academic load 📚
  * Environment 🌫️

---

## 🏗️ Architecture Overview

* **Frontend (Vite + React)**
  Handles UI, uploads, and user interaction

* **Backend (FastAPI)**
  Processes requests, integrates APIs, and performs analysis

* **AI & Data Layer**

  * Food detection via **LogMeal API**
  * Calendar parsing → JSON → stress analysis
  * AQI data via weather APIs
  * Chatbot interaction system

---

## ⚙️ Setup Instructions

### 🔹 1. Clone Repository

```bash
git clone <your-repo-url>
cd StudentCare
```

---

### 🔹 2. Run Backend (FastAPI)

```bash
cd Backend
pip install -r requirements.txt
python main.py
```

Backend runs at:

```
http://localhost:8000
```

---

### 🔹 3. Run Frontend

```bash
cd Frontened
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔗 System Workflow

### 🍱 Food Pipeline

1. User uploads food image
2. Backend calls **LogMeal API**
3. Food item detected
4. Nutrition data fetched
5. Results returned

---

### 📅 Calendar Intelligence Pipeline

1. Upload calendar (PDF/CSV/JSON)
2. Convert → structured JSON
3. Extract events
4. Analyze workload density
5. Generate stress level

---

### 🌫️ AQI Intelligence

1. Fetch real-time data via weather API
2. Analyze AQI levels
3. Generate health suggestions

---

### 🤖 Chatbot Flow

1. User asks query
2. Backend processes intent
3. Returns helpful response (health / system guidance)

---

## 🧪 Tech Stack

### Frontend

* React (Vite)
* JavaScript

### Backend

* FastAPI (Python)

### APIs & Intelligence

* LogMeal API (Food Detection)
* Weather API (AQI Data)
* Calendar Parsing Engine
* Chatbot Logic

---

## ⚠️ Current Status

* ✅ Food detection (LogMeal) integrated
* ✅ Academic calendar → stress analysis working
* ✅ AQI-based suggestions implemented
* ✅ Chatbot functional
* 🚧 Advanced personalization in progress

---

## 🔧 Future Enhancements

* Portion size estimation for precise nutrition
* AI-based stress prediction (beyond calendar)
* Personalized recommendations
* Visual dashboards (graphs & trends)
* Integration with wearable devices

---


* Diet 🍱
* Academic workload 📚
* Environment 🌫️

…and provides **real-time intelligent guidance** to improve both **health and productivity**.
