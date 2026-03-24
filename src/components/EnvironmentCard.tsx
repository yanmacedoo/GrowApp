import { Link } from 'react-router-dom';
import { Box, ArrowRight, Edit2, Zap, ClipboardList } from 'lucide-react';
import './EnvironmentCard.css';

interface EnvProps {
  environment: {
    id: string;
    name: string;
    size: string;
    type: string;
    plantCount: number;
  };
  onEdit: (env: any) => void;
  onAction: (env: any) => void;
}

export const EnvironmentCard = ({ environment, onEdit, onAction }: EnvProps) => {
  return (
    <div className="env-card glass-panel">
      <div className="env-card-header">
        <div className="env-icon">
          <Box size={20} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="env-type">{environment.type}</span>
          <Link 
             to={`/historico?search=${environment.name}`} 
             className="btn-action" 
             title="Ver Diário do Ambiente" 
             style={{ color: 'var(--text-secondary)' }}
          >
            <ClipboardList size={16} />
          </Link>
          <button 
            className="btn-action" 
            title="Registrar Manejo no Ambiente" 
            onClick={(e) => { e.preventDefault(); onAction(environment); }}
            style={{ color: 'var(--text-secondary)' }}
          >
            <Zap size={16} />
          </button>
          <button 
            className="btn-action" 
            title="Editar Ambiente" 
            onClick={(e) => { e.preventDefault(); onEdit(environment); }}
            style={{ color: 'var(--text-secondary)', zIndex: 10 }}
          >
            <Edit2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="env-body">
        <h3 className="env-title">{environment.name}</h3>
        <p className="env-size">Espaço: {environment.size}</p>
        
        <div className="plant-counter">
          <span className="counter-number">{environment.plantCount}</span>
          <span className="counter-label">{environment.plantCount === 1 ? 'planta ativa' : 'plantas ativas'}</span>
        </div>
      </div>

      <div className="env-footer">
        <Link to={`/ambientes/${environment.id}`} className="env-action">
          Ver Plantas <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
