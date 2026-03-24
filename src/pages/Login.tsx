import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { Sprout, LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro ao processar sua solicitação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <div className="flex flex-col items-center mb-8">
          <div className="brand-icon mb-4" style={{ width: 'fit-content' }}>
            <Sprout size={32} color="#000" strokeWidth={2.5} />
          </div>
          <h2 className="auth-title">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Acesse seu painel de cultivo e suas plantas.' 
              : 'Comece a gerenciar seu cultivo de forma inteligente.'}
          </p>
        </div>

        {error && <div className="auth-error mb-4">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="modal-form-group">
              <label>Nome Completo</label>
              <div className="filter-group">
                <User size={18} className="text-secondary" />
                <input 
                  className="filter-input" 
                  placeholder="Seu nome" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="modal-form-group">
            <label>E-mail</label>
            <div className="filter-group">
              <Mail size={18} className="text-secondary" />
              <input 
                type="email"
                className="filter-input" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label>Senha</label>
            <div className="filter-group">
              <Lock size={18} className="text-secondary" />
              <input 
                type="password"
                className="filter-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full py-3 mt-4" 
            disabled={loading}
          >
            {loading 
              ? 'Processando...' 
              : isLogin ? <><LogIn size={18} /> Entrar</> : <><UserPlus size={18} /> Criar Conta</>
            }
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
          <button 
            className="auth-switch-link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Cadastre-se' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
