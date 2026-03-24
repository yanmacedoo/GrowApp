import { useState } from 'react';
import { auth } from '../firebase';
import { 
  updateProfile, 
  updateEmail, 
  updatePassword,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { User, Mail, Lock, LogOut, Save, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(user, { displayName: name });
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Reautenticação necessária para mudanças sensíveis
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, email);
      setMessage({ type: 'success', text: 'E-mail atualizado com sucesso!' });
      setCurrentPassword('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Senha atual incorreta.' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar e-mail. Reautenticação necessária.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setNewPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Senha atual incorreta.' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar senha.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="flex-header">
        <div>
          <h2 className="page-title">Configurações</h2>
          <p className="page-subtitle">Gerencie suas informações de acesso e perfil.</p>
        </div>
        <button className="btn btn-secondary text-sm" onClick={handleLogout}>
          <LogOut size={18} /> Sair
        </button>
      </div>

      {message.text && (
        <div className={`auth-${message.type} mb-6`} style={{ 
          background: message.type === 'success' ? 'rgba(29, 235, 105, 0.1)' : undefined,
          color: message.type === 'success' ? 'var(--accent-primary)' : undefined,
          border: message.type === 'success' ? '1px solid rgba(29, 235, 105, 0.2)' : undefined,
          padding: '1rem',
          borderRadius: '8px'
        }}>
          {message.text}
        </div>
      )}

      <div className="settings-section">
        <div className="profile-header">
          <div className="profile-avatar">
            {(name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{name || 'Usuário'}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="settings-group glass-panel">
            <h3><User size={20} className="text-accent-primary" /> Dados do Perfil</h3>
            <form onSubmit={handleUpdateProfile} className="auth-form">
              <div className="modal-form-group">
                <label>Nome de Exibição</label>
                <input 
                  className="modal-input" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" disabled={loading}>
                <Save size={18} /> Salvar Nome
              </button>
            </form>
          </div>

          <div className="settings-group glass-panel">
            <h3><Mail size={20} className="text-accent-primary" /> Alterar E-mail</h3>
            <form onSubmit={handleUpdateEmail} className="auth-form">
              <div className="modal-form-group">
                <label>Novo E-mail</label>
                <input 
                  type="email"
                  className="modal-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="modal-form-group">
                <label>Senha Atual (Requerido)</label>
                <input 
                  type="password"
                  className="modal-input" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Senha para confirmar"
                />
              </div>
              <button className="btn btn-primary" disabled={loading}>
                <Save size={18} /> Atualizar E-mail
              </button>
            </form>
          </div>

          <div className="settings-group glass-panel">
            <h3><Lock size={20} className="text-accent-primary" /> Segurança</h3>
            <form onSubmit={handleUpdatePassword} className="auth-form">
              <div className="modal-form-group">
                <label>Nova Senha</label>
                <input 
                  type="password"
                  className="modal-input" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="modal-form-group">
                <label>Senha Atual (Requerido)</label>
                <input 
                  type="password"
                  className="modal-input" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Senha para confirmar"
                />
              </div>
              <button className="btn btn-primary" disabled={loading}>
                <Save size={18} /> Mudar Senha
              </button>
            </form>
          </div>

          <div className="settings-group glass-panel border-warning" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <h3 style={{ color: '#ef4444' }}><ShieldAlert size={20} /> Zona de Perigo</h3>
            <p className="text-secondary text-sm mb-4">
              Estas ações são irreversíveis. Tenha cuidado ao prosseguir.
            </p>
            <button className="btn btn-secondary text-sm" disabled style={{ opacity: 0.5 }}>
              Excluir Minha Conta (Em breve)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
