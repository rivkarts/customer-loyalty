# LoyaltyApp — Customer Rewards

A modern, interactive customer loyalty web application. Built with React and DaisyUI, designed to be clean, responsive, and easy to use.

---

## 📊 Project Status

| Area | Status |
|------|--------|
| ✅ Frontend UI (Home, Rewards, Wallet, Profile) | **Done** |
| ✅ Responsive Layouts (Mobile & Desktop) | **Done** |
| ✅ UI Components (DaisyUI Integration) | **Done** |
| ✅ Design System (Strict 3-color palette) | **Done** |
| ⏳ User Authentication (Sign Up / Log In) | *Pending* |
| ⏳ Database (MongoDB) | *Pending* |
| ⏳ Backend API | *Pending* |

---

## 🛠 Tech Stack & Design

- **React & Vite:** Powers the fast, interactive user interface.
- **Tailwind CSS & DaisyUI:** Provides beautiful, accessible components (buttons, cards, badges, progress bars) for a polished look.
- **3-Color System:** To prevent visual clutter, the app strictly uses **Primary (Coral Red)**, **Accent (Gold)**, and **Dark (Near-Black)**, alongside neutral grays and whites.

---

## 🚀 How to Run Locally

You will need [Node.js](https://nodejs.org) installed on your computer.

1. Open your terminal in the project folder:
   ```bash
   cd "Customer loyalty reward app"
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
4. Open your browser and visit: **http://localhost:5173**

---

## 🏗 Next Phase: Bringing It to Life

The frontend UI (what the user sees) is fully locked in and responsive. To make the app functional, the next steps involve building the backend:

1. **Authentication:** Integrate a login/signup system (e.g., Firebase Auth) so users can securely access their own accounts.
2. **Database (MongoDB):** Set up a database to persistently store user profiles, real point balances, and transaction history.
3. **Backend API (Node.js/Express):** Create the server logic that connects the app to the database (e.g., safely adding points on purchases or subtracting points when a user clicks "Redeem").
