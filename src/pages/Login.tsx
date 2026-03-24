import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { Sprout, LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail no campo acima para redefinir a senha.');
      setResetMessage('');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setResetMessage('');
      await sendPasswordResetEmail(auth, email);
      setResetMessage('E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('Nenhuma conta encontrada com este e-mail.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Por favor, insira um e-mail válido.');
      } else {
        setError('Erro ao enviar e-mail de redefinição.');
      }
    } finally {
       setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1.5rem auto', padding: '0.8rem', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '56px', height: '56px' }}>
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
        {resetMessage && <div className="auth-error mb-4" style={{ backgroundColor: 'rgba(29, 235, 105, 0.1)', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>{resetMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label>Nome Completo</label>
              <div className="auth-input-wrap">
                <User size={18} />
                <input 
                  placeholder="Seu nome" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label>E-mail</label>
            <div className="auth-input-wrap">
              <Mail size={18} />
              <input 
                type="email"
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              </div>
          </div>

          <div>
            <label>Senha</label>
            <div className="auth-input-wrap">
              <Lock size={18} />
              <input 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isLogin && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="auth-switch-link" 
                  style={{ fontSize: '0.75rem', padding: 0 }}
                  onClick={handleResetPassword}
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}
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
