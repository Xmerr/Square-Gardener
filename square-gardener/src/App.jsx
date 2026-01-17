function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-primary to-primary-light text-white py-6 px-4 sm:py-8 md:py-10 text-center shadow-md">
        <h1 className="m-0 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
          🌱 Square Gardener
        </h1>
        <p className="mt-2 text-base sm:text-lg opacity-95">
          Your Square Foot Gardening Companion
        </p>
      </header>

      <main className="flex-1 flex justify-center items-center p-4 sm:p-6 md:p-8 bg-background">
        <div className="bg-card rounded-xl p-4 sm:p-6 md:p-8 lg:p-10 max-w-2xl w-full shadow-lg">
          <h2 className="text-primary mt-0 mb-4 text-xl sm:text-2xl md:text-3xl font-semibold">
            Hello World!
          </h2>
          <p className="text-text-dark text-base sm:text-lg leading-relaxed">
            Welcome to Square Gardener - a web app to help you manage your garden.
          </p>
          <div className="mt-6 sm:mt-8 text-left">
            <h3 className="text-primary-light mb-3 sm:mb-4 text-lg sm:text-xl font-medium">
              Coming Soon:
            </h3>
            <ul className="list-none p-0 space-y-2 sm:space-y-3">
              <li className="pl-6 relative text-text-dark leading-relaxed before:content-['🌿'] before:absolute before:left-0">
                Track your plants and watering schedules
              </li>
              <li className="pl-6 relative text-text-dark leading-relaxed before:content-['🌿'] before:absolute before:left-0">
                Plan your garden with square foot gardening principles
              </li>
              <li className="pl-6 relative text-text-dark leading-relaxed before:content-['🌿'] before:absolute before:left-0">
                Discover optimal planting times
              </li>
              <li className="pl-6 relative text-text-dark leading-relaxed before:content-['🌿'] before:absolute before:left-0">
                Get companion planting recommendations
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-footer text-text-muted text-center py-3 px-4 sm:py-4 text-sm sm:text-base">
        <p className="m-0">Built with React + Vite | Deployed via GitHub Actions</p>
      </footer>
    </div>
  );
}

export default App;
