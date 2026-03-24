import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import { Leaf, Droplets, Calendar, Sparkles, ClipboardList } from 'lucide-react';
import { addAction, updatePlantStage } from '../store';
import './PlantCard.css';

interface PlantProps {
  plant: {
    id: string;
    strain: string;
    colorTag: number;
    daysPlanted: number;
    currentStage: string;
    environmentName: string;
  };
  onAction?: (plant: any) => void;
}

export const PlantCard = ({ plant, onAction }: PlantProps) => {
  const [localStage, setLocalStage] = useState(plant.currentStage);

  const handleStageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value;
    const oldStage = localStage;
    setLocalStage(newStage);

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ', ' + now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    addAction({
      type: 'Observação',
      date: dateStr,
      observation: `O cultivador alterou o ciclo da planta de ${oldStage} para a fase de ${newStage}.`,
      plantId: plant.id,
      environmentName: plant.environmentName
    });
    
    updatePlantStage(plant.id, newStage);
  };

  return (
    <div className={`plant-card glow-${plant.colorTag} glass-panel`}>
      <div className="plant-header">
        <div className="plant-id">
          <span className="id-hash">#{plant.id}</span>
          <h3 className="strain-name">{plant.strain}</h3>
        </div>
        <button className="btn-ai-tip" title="Pedir dica IA para esta planta">
          <Sparkles size={18} />
        </button>
      </div>

      <div className="plant-details">
        <div className="detail-item">
          <Calendar size={16} />
          <span>{plant.daysPlanted} dias</span>
        </div>
        <div className="detail-item">
          <Leaf size={16} />
          <select 
            className="stage-select text-sm bg-transparent border-none text-white outline-none cursor-pointer" 
            value={localStage}
            onChange={handleStageChange}
          >
            <option value="Germinação">Germinação</option>
            <option value="Muda">Muda</option>
            <option value="Vegetativo">Vegetativo</option>
            <option value="Floração">Floração</option>
            <option value="Colheita">Colheita</option>
          </select>
        </div>
      </div>

      <div className="plant-footer">
        <span className="env-badge">{plant.environmentName}</span>
        <div className="actions">
          <Link to={`/historico?search=${plant.id}`} className="btn-action" title="Ver Histórico Individual">
            <ClipboardList size={16} />
          </Link>
          <button className="btn-action" title="Registrar Manejo na Planta" onClick={() => onAction && onAction(plant)}>
            <Droplets size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
