import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Sprout, Sparkles } from 'lucide-react';
import './App.css';

import { Environments } from './pages/Environments';
import { Plants } from './pages/Plants';
import { History } from './pages/History';
import { AIAssistant } from './pages/AIAssistant';
import { TipCarousel } from './components/TipCarousel';

function App() {
  return (
    <BrowserRouter>
      <header className="app-header glass-panel">
        <div className="brand">
          <div className="brand-title-wrap">
            <div className="brand-icon">
              <Sprout size={24} color="#000" strokeWidth={2.5} />
            </div>
            <h1>GrowApp</h1>
          </div>
        </div>
        
        <div className="tips-container">
          <TipCarousel />
        </div>

        <nav className="main-nav">
          <Link to="/" className="nav-link">Ambientes</Link>
          <Link to="/plantas" className="nav-link">Plantas</Link>
          <Link to="/historico" className="nav-link">Histórico</Link>
          <Link to="/ia" className="nav-link nav-link-ai">
            <Sparkles size={16} /> Assistente IA
          </Link>
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Environments />} />
          <Route path="/ambientes/:id" element={<Plants />} />
          <Route path="/plantas" element={<Plants />} />
          <Route path="/historico" element={<History />} />
          <Route path="/ia" element={<AIAssistant />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
