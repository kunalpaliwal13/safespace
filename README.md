# Safespace.ai 🛡️

Safespace.ai is a full-stack application built to provide mental health support using machine learning. It consists of a Python-based ML model, a Node.js backend, and a modern frontend for seamless interaction.

---

## 🗂️ Project Structure
Safespace.ai/<br>
│<br>
├── ML/ # Machine Learning logic (Python)<br>
│ └── app.py # ML server entry point<br>
│ └── .env # Contains API key<br>
│<br>
├── Backend/ # Backend (Node.js + Express)<br>
│ └── index.js # Backend entry point<br>
│ └── .env # Contains server config vars<br>
│<br>
├── Frontend/ # Frontend (React or other modern JS framework)<br>
│<br>
└── .gitignore<br>

---

## 🚀 How to Run the Project

### 1. Clone the Repository
```bash
git clone https://github.com/kunalpaliwal13/Safespace.ai.git
cd Safespace.ai
```
2. Environment Variables

   Create a `.env` file in both ML/ and Backend/ folders with the following:
```
   ML/.env:
   API_KEY=''
```
```
   Backend/.env:
   PORT=
   MONGO_URI=""
   JWT_SECRET=
```
```
   Frontend/.env:
   VITE_EMAILJS_USER_ID=
   VITE_EMAILJS_SERVICE_ID=
   VITE_EMAILJS_TEMPLATE_ID=
```

3. Start the ML Server (Python)

   ```
   cd ML
   python app.py```

4. Start the Backend Server (Node.js)
```
   cd Backend
   npm install
   nodemon index.js
```
   (Make sure nodemon is installed globally with: npm install -g nodemon)

5. Start the Frontend

   cd Frontend
   npm install
   npm run dev

## 🧠 Features

- Sentiment/Suicide detection using ML
- Secure JWT-authenticated backend
- Responsive frontend UI
- Modular and scalable code structure

## 🛡️ Security

- Secrets are stored in `.env` files (never commit them)
- Ensure `.gitignore` excludes `.env`

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you would like to change.

## 📬 Contact

Created by @kunalpaliwal13 (https://github.com/kunalpaliwal13)
