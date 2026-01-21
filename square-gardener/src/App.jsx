import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import MyGarden from './pages/MyGarden';
import Watering from './pages/Watering';
import Planner from './pages/Planner';
import Calendar from './pages/Calendar';

function App() {
  return (
    <Router basename="/Square-Gardener/">
      <div className="min-h-screen flex flex-col">
        <header className="bg-gradient-to-br from-primary to-primary-light text-white py-6 px-4 sm:py-8 text-center shadow-md">
          <h1 className="m-0 text-2xl sm:text-3xl md:text-4xl font-bold">
            🌱 Square Gardener
          </h1>
          <p className="mt-2 text-base sm:text-lg opacity-95">
            Your Square Foot Gardening Companion
          </p>
        </header>

        <Navigation />

        <main className="flex-1 bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-garden" element={<MyGarden />} />
            <Route path="/watering" element={<Watering />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>

        <footer className="bg-footer text-text-muted text-center py-3 px-4 sm:py-4 text-sm sm:text-base">
          <p className="m-0">Built with React + Vite | Deployed via GitHub Actions</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
