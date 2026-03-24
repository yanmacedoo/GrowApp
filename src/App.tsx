import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Sprout, Sparkles, User } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';

import { Environments } from './pages/Environments';
import { Plants } from './pages/Plants';
import { Harvests } from './pages/Harvests';
import { History } from './pages/History';
import { CalendarView } from './pages/CalendarView';
import { AIAssistant } from './pages/AIAssistant';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { TipCarousel } from './components/TipCarousel';
import { initStore, clearStore } from './store';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Bloqueia a UI de carregar até a fazenda toda ser enviada do Firestore pro Cache Local
      if (currentUser) {
         await initStore(currentUser.uid);
      } else {
         clearStore();
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-vh-100 bg-dark">
        <div className="brand-icon animate-pulse">
          <Sprout size={48} color="var(--accent-primary)" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user && (
        <header className="app-header glass-panel">
          <div className="brand">
            <div className="brand-title-wrap">
              <div className="brand-icon">
                <Sprout size={24} color="#000" strokeWidth={2.5} />
              </div>
              <h1>GrowApp</h1>
            </div>
            <Link to="/configuracoes" title="Configurações de Conta" style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
              transition: 'all 0.2s ease', border: '1px solid var(--border-subtle)'
            }}>
              <User size={20} />
            </Link>
          </div>
          
          <div className="tips-container">
            <TipCarousel />
          </div>

          <nav className="main-nav">
            <Link to="/" className="nav-link">Ambientes</Link>
            <Link to="/plantas" className="nav-link">Plantas</Link>
            <Link to="/mapa" className="nav-link">Mapa Geral</Link>
            <Link to="/historico" className="nav-link">Histórico</Link>
            <Link to="/colheitas" className="nav-link">Colheitas</Link>
            <Link to="/ia" className="nav-link nav-link-ai">
              <Sparkles size={16} /> Assistente IA
            </Link>
          </nav>
        </header>
      )}

      <main className={`main-content ${!user ? 'pt-0' : ''}`}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          
          <Route path="/" element={user ? <Environments /> : <Navigate to="/login" />} />
          <Route path="/ambientes/:id" element={user ? <Plants /> : <Navigate to="/login" />} />
          <Route path="/plantas" element={user ? <Plants /> : <Navigate to="/login" />} />
          <Route path="/mapa" element={user ? <CalendarView /> : <Navigate to="/login" />} />
          <Route path="/colheitas" element={user ? <Harvests /> : <Navigate to="/login" />} />
          <Route path="/historico" element={user ? <History /> : <Navigate to="/login" />} />
          <Route path="/ia" element={user ? <AIAssistant /> : <Navigate to="/login" />} />
          <Route path="/configuracoes" element={user ? <Settings /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
