# Gen-AI Analytics Dashboard 📊

A modern, AI-powered analytics dashboard that visualizes data through natural language queries. Built with React, TypeScript, and FastAPI.

![Dashboard Preview](preview.png)

## ✨ Features

- 🤖 Natural Language Query Interface
- 📈 Dynamic Data Visualization
- 💡 AI-Powered Suggestions
- 📊 Multiple Chart Types (Area, Bar, Line)
- 📱 Responsive Design
- 🎨 Modern Glass-Effect UI
- 📤 Data Export Functionality
- 🔍 Real-time Query Suggestions
- 📈 Automatic Insight Generation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/gen-ai-analytics-dashboard.git
cd gen-ai-analytics-dashboard
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
# or
yarn install
```

3. Install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Redux (State Management)
- Recharts (Data Visualization)
- Tailwind CSS (Styling)
- Vite (Build Tool)

### Backend

- FastAPI
- Python
- Uvicorn (ASGI Server)

## 📝 Usage

1. Enter a natural language query in the search bar

   - Example: "Show me the sales trend for the last 6 months"
   - Example: "Compare revenue across quarters"

2. Select from suggested queries or enter your own

3. View the generated visualization and insights

4. Export data as CSV if needed

5. Clear the visualization using the clear button

## 🎨 Features in Detail

### Query Input

- Real-time query suggestions
- Natural language processing
- History tracking
- Clear input functionality

### Visualization Types

- Area Charts (for trends)
- Bar Charts (for comparisons)
- Line Charts (for time series)

### Data Analysis

- Automatic insight generation
- Growth rate calculations
- Target vs. actual comparisons
- Key metric highlighting

### User Interface

- Modern glass-effect design
- Responsive layout
- Interactive tooltips
- Loading states
- Error handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
