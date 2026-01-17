import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>🌱 Plant Tracker</h1>
        <p className="tagline">Your Square Foot Gardening Companion</p>
      </header>

      <main className="main">
        <div className="welcome-card">
          <h2>Hello World!</h2>
          <p>Welcome to Plant Tracker - a web app to help you manage your garden.</p>
          <div className="features">
            <h3>Coming Soon:</h3>
            <ul>
              <li>Track your plants and watering schedules</li>
              <li>Plan your garden with square foot gardening principles</li>
              <li>Discover optimal planting times</li>
              <li>Get companion planting recommendations</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>Built with React + Vite | Deployed via GitHub Actions</p>
      </footer>
    </div>
  )
}

export default App
