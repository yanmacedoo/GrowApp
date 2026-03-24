import { Droplets, Scissors, FlaskConical, Move, Eye, Bug, Flower2 } from 'lucide-react';
import './HistoryTimeline.css';

interface ActionProps {
  action: {
    id: string;
    type: string;
    date: string;
    productUsed?: string;
    observation: string;
    plantId?: string;
    environmentName: string;
  };
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'Rega': return <Droplets size={16} />;
    case 'Poda': return <Scissors size={16} />;
    case 'Adubação': return <FlaskConical size={16} />;
    case 'Transplante': return <Move size={16} />;
    case 'Observação': return <Eye size={16} />;
    case 'Pesticida': return <Bug size={16} />;
    case 'Treinamento': return <Flower2 size={16} />;
    default: return <Droplets size={16} />;
  }
};

export const HistoryTimeline = ({ actions }: { actions: ActionProps['action'][] }) => {
  return (
    <div className="timeline-container">
      {actions.map((action, index) => (
        <div key={action.id} className="timeline-item">
          <div className="timeline-marker">
            <div className={`timeline-icon type-${action.type.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, "")}`}>
              {getIconForType(action.type)}
            </div>
            {index !== actions.length - 1 && <div className="timeline-line"></div>}
          </div>
          
          <div className="timeline-content glass-panel">
            <div className="timeline-header">
              <span className="action-type">{action.type}</span>
              <span className="action-date">{action.date}</span>
            </div>
            {action.plantId && <span className="action-target text-sm text-secondary">Planta: #{action.plantId}</span>}
            <span className="action-target text-sm text-secondary ml-2">Amb: {action.environmentName}</span>
            
            <p className="action-observation">{action.observation}</p>
            {action.productUsed && (
              <div className="action-product">
                <FlaskConical size={14} /> <span>Produto: {action.productUsed}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
