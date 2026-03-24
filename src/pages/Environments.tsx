import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { EnvironmentCard } from '../components/EnvironmentCard';
import { ActionModal } from '../components/ActionModal';
import { getEnvs, saveEnv, addAction } from '../store';
import './Environments.css';

export const Environments = () => {
  const [envs, setEnvs] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<any>(null);
  const [actionModalTarget, setActionModalTarget] = useState<any>(null);

  const envActions = ['Rega (Lote Total)', 'Adubação (Lote Total)', 'Limpeza do Espaço', 'Pesticida', 'Observação Direta'];

  const [formData, setFormData] = useState({ name: '', size: '', type: 'Indoor' });

  useEffect(() => {
    setEnvs(getEnvs());
  }, []);

  const handleOpenNew = () => {
    setEditingEnv(null);
    setFormData({ name: '', size: '', type: 'Indoor' });
    setModalOpen(true);
  };

  const handleOpenEdit = (env: any) => {
    setEditingEnv(env);
    setFormData({ name: env.name, size: env.size, type: env.type });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ', ' + now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    let newEnv;
    if (editingEnv) {
      newEnv = { ...editingEnv, ...formData };
      addAction({
        type: 'Observação',
        date: dateStr,
        observation: `O ambiente foi modificado para "${formData.name}" (Tipo: ${formData.type}, Espaço: ${formData.size || 'N/A'}).`,
        environmentName: formData.name
      });
    } else {
      newEnv = { 
        id: Math.random().toString(36).substr(2, 9), 
        plantCount: 0, 
        ...formData 
      };
      addAction({
        type: 'Observação',
        date: dateStr,
        observation: `Um novo ambiente de cultivo foi criado: "${formData.name}" (Tipo: ${formData.type}).`,
        environmentName: formData.name
      });
    }
    
    saveEnv(newEnv);
    setEnvs(getEnvs());
    setModalOpen(false);
  };

  return (
    <div className="dashboard-container">
      <div className="flex-header">
        <div>
          <h2 className="page-title">Seus Ambientes</h2>
          <p className="page-subtitle">Gerencie ou crie novos espaços de cultivo.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenNew}>
          <Plus size={20} /> Novo Ambiente
        </button>
      </div>

      <div className="environments-grid">
        {envs.map(env => (
           <EnvironmentCard key={env.id} environment={env} onEdit={handleOpenEdit} onAction={setActionModalTarget} />
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{editingEnv ? 'Editar Ambiente' : 'Novo Ambiente'}</h3>
            
            <div className="modal-form-group">
              <label>Nome do Ambiente</label>
              <input 
                className="modal-input" 
                placeholder="Ex: Growbox 1" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                autoFocus
              />
            </div>

            <div className="modal-form-group">
              <label>Tamanho (Opcional)</label>
              <input 
                className="modal-input" 
                placeholder="Ex: 80x80x160 ou 'Aberto'" 
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
              />
            </div>

            <div className="modal-form-group">
              <label>Tipo</label>
              <select 
                className="modal-select" 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Indoor">Indoor (Estufa Média/Completa)</option>
                <option value="Outdoor">Outdoor (Aberto/Jardim)</option>
                <option value="Greenhouse">Greenhouse (Estufa de Clones/Germinação)</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {actionModalTarget && (
        <ActionModal 
           targetType="Ambiente" 
           targetId={actionModalTarget.id} 
           targetName={actionModalTarget.name} 
           availableActions={envActions} 
           onClose={() => setActionModalTarget(null)} 
        />
      )}
    </div>
  );
};
