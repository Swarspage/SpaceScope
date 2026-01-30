# SpaceScope

**SpaceScope – Explore, Learn & Stay Connected with the Universe**

SpaceScope is a comprehensive web application designed for space enthusiasts, students, and researchers. It provides interactive tools to explore celestial bodies, track space missions, analyze environmental data, and connect with a community of like-minded individuals.

## 🚀 Features

*   **Interactive Universe**: Explore 3D models of planets and satellites using standard web technologies.
*   **Real-time Mission Tracking**: Stay updated with the latest launches from SpaceX, ISRO, and NASA.
*   **Environmental Analysis**: Utilize tools for NDVI, CO2 monitoring, global temperature anomalies, light pollution, and more.
*   **Community Hub**: Share posts, discuss topics, and stay connected with the space community.
*   **Learning Resources**: Access quizzes, articles, and educational content.
*   **Admin Dashboard**: Manage content, users, and internships/activities (if applicable).

## 🛠 Tech Stack

**Frontend:**
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS
*   **3D/Maps**: React Three Fiber (Three.js), React Leaflet, React Globe GL
*   **Visualization**: Chart.js, Recharts
*   **State Management**: Zustand
*   **Routing**: React Router DOM

**Backend:**
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Authentication**: JWT (implied)
*   **File Storage**: Cloudinary

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB Instance
*   API Keys (NASA, Agromonitoring, Visual Crossing, Unsplash, Cloudinary)

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd SpaceScope
\`\`\`

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
\`\`\`bash
cd Backend
npm install
\`\`\`

Create a \`.env\` file in the \`Backend\` directory based on \`.env.example\`:
\`\`\`bash
cp .env.example .env
# Fill in your MONGODB_URI, NASA_API_KEY, CLOUDINARY credentials, etc.
\`\`\`

Start the backend server:
\`\`\`bash
npm start
# or for development
npm run dev
\`\`\`

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
\`\`\`bash
cd ../Frontend
npm install
\`\`\`

Create a \`.env\` file in the \`Frontend\` directory based on \`.env.example\`:
\`\`\`bash
cp .env.example .env
# Fill in your VITE_AGROMONITORING_API_KEY, VITE_VISUAL_CROSSING_KEY, etc.
\`\`\`

Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

## 🤝 Contributing
Contributions are welcome! Please fork the repository and create a pull request.

## 📄 License
[MIT License](LICENSE)
