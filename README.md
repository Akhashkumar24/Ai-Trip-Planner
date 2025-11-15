# 🌴 AI Trip Planner 🌴

This is a web application that helps users plan their trips using the power of AI. Users can input their destination, travel dates, and preferences, and the application will generate a personalized itinerary, including places to visit, hotel recommendations, and more.

## ✨ Features

*   **AI-Powered Itinerary Generation:** Utilizes Google's Gemini AI to create detailed and personalized travel plans.
*   **User-Friendly Interface:** A simple and intuitive multi-step form to gather travel preferences.
*   **Real-Time Weather Information:** Integrates with OpenWeatherMap to provide current weather data for the destination.
*   **Google OAuth Integration:** Securely sign in with your Google account to save and manage your trips.
*   **Firestore Database:** Stores and retrieves user-generated trip data.
*   **View and Manage Trips:** Users can view their saved trips and access their itineraries at any time.

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, `react-router-dom`
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini AI (`@google/generative-ai`)
*   **Database:** Google Firestore
*   **Authentication:** Google OAuth
*   **Weather:** OpenWeatherMap API

## 🚀 Getting Started

To run the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-trip-planner.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the root directory and add the following environment variables:
    ```
    VITE_GOOGLE_AUTH_CLIENT_ID="YOUR_GOOGLE_AUTH_CLIENT_ID"
    VITE_GOOGLE_GEMINI_AI_API_KEY="YOUR_GOOGLE_GEMINI_AI_API_KEY"
    VITE_OPENWEATHER_API_KEY="YOUR_OPENWEATHER_API_KEY"
    ```
    **(Recommended)** You should also move your Firebase configuration keys to the `.env` file.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
/home/tony-stark/Documents/ai-trip-planner/
├───.env
├───.eslintrc.cjs
├───.gitignore
├───components.json
├───index.html
├───jsconfig.json
├───package-lock.json
├───package.json
├───postcss.config.js
├───README.md
├───tailwind.config.js
├───vercel.json
├───vite.config.js
├───public/
│   ├───landing.png
│   ├───logo.svg
│   ├───placeholder.jpg
│   └───vite.svg
└───src/
    ├───App.css
    ├───App.jsx
    ├───index.css
    ├───main.jsx
    ├───assets/
    │   └───react.svg
    ├───components/
    │   ├───custom/
    │   │   ├───Header.jsx
    │   │   └───Hero.jsx
    │   └───ui/
    │       ├───button.jsx
    │       ├───dialog.jsx
    │       ├───input.jsx
    │       ├───popover.jsx
    │       └───sonner.jsx
    ├───constants/
    │   └───options.jsx
    ├───create-trip/
    │   └───index.jsx
    ├───lib/
    │   └───utils.js
    ├───my-trips/
    │   ├───index.jsx
    │   └───components/
    │       └───UserTripCardItem.jsx
    ├───service/
    │   ├───AIModel.jsx
    │   ├───firebaseConfig.jsx
    │   ├───GlobalApi.jsx
    │   └───weatherService.jsx
    └───view-trip/
        ├───[tripId]/
        │   └───index.jsx
        └───components/
            ├───Footer.jsx
            ├───HotelCardItem.jsx
            ├───Hotels.jsx
            ├───InfoSection.jsx
            ├───PlaceCardItem.jsx
            └───PlacesToVisit.jsx
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## 📄 License

This project is licensed under the MIT License.