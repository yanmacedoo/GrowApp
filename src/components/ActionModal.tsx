import { useState } from 'react';
import { addAction } from '../store';

interface ActionModalProps {
  targetType: 'Ambiente' | 'Planta';
  targetId: string;
  targetName: string;
  envName?: string; // Usado para histórico de plantas no Timeline
  availableActions: string[];
  onClose: () => void;
}

export const ActionModal = ({ targetType, targetId, targetName, envName, availableActions, onClose }: ActionModalProps) => {
  const [formData, setFormData] = useState({
    type: availableActions[0],
    observation: '',
    product: ''
  });

  const handleSave = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR') + ', ' + today.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    const payload: any = {
      type: formData.type,
      date: dateStr,
      observation: formData.observation || `Registro de Manejo: ${formData.type} computado com sucesso.`,
      environmentName: targetType === 'Ambiente' ? targetName : (envName || 'Ambiente')
    };

    if (formData.product) {
      payload.productUsed = formData.product;
    }

    if (targetType === 'Planta' && targetId) {
      payload.plantId = targetId;
    }

    addAction(payload);
    
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Registros - {targetName}</h3>
        
        <div className="modal-form-group">
          <label>Manejo Efetuado</label>
          <select 
            className="modal-select" 
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            {availableActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {formData.type === 'Poda' && targetType === 'Planta' && (
           <div className="modal-form-group">
             <label style={{ color: 'var(--accent-primary)' }}>💡 Dica: Especifique a Poda</label>
             <p style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>Especifique abaixo o feitio. Exemplos: Poda FIM, Top Pruning, Lollipopping ou Defoliação por praga.</p>
           </div>
        )}

        <div className="modal-form-group">
          <label>Insumo Utilizado (Opcional)</label>
          <input 
            className="modal-input" 
            placeholder="Ex: Bio-Grow 2ml/L, Óleo de Neem" 
            value={formData.product}
            onChange={e => setFormData({...formData, product: e.target.value})}
          />
        </div>

        <div className="modal-form-group">
          <label>Logbook / Observação da Reação</label>
          <textarea 
            className="modal-input" 
            style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Relate os detalhes percebidos da planta ou ambiente..." 
            value={formData.observation}
            onChange={e => setFormData({...formData, observation: e.target.value})}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Anotar na Timeline 📝</button>
        </div>
      </div>
    </div>
  );
};
