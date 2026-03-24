import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Filter, Search } from 'lucide-react';
import { PlantCard } from '../components/PlantCard';
import { ActionModal } from '../components/ActionModal';
import { getPlants, addPlants, updatePlant, deletePlant, getEnvs, addAction } from '../store';
import './Plants.css';

export const Plants = () => {
  const { id } = useParams();
  
  const [plants, setPlants] = useState<any[]>([]);
  const [envs, setEnvs] = useState<any[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<any>(null);

  const [formData, setFormData] = useState({ strain: '', quantity: 1, colorTag: 0, environmentId: '' });
  
  // Mobile e Desktop - Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  
  // Actions Modal
  const [actionModalTarget, setActionModalTarget] = useState<any>(null);
  const plantActions = ['Rega Própria', 'Poda', 'Adubação Balanceada', 'Transplante de Vaso', 'Treinamento HST/LST', 'Pesticida', 'Observação'];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  const loadData = () => {
    const allEnvs = getEnvs();
    setEnvs(allEnvs);
    
    let allPlants = getPlants();
    if (id) {
        allPlants = allPlants.filter((p:any) => p.environmentId === id);
    }
    setPlants(allPlants);
    
    if (id) {
        setFormData(prev => ({ ...prev, environmentId: id }));
    } else if (allEnvs.length > 0) {
        setFormData(prev => ({ ...prev, environmentId: allEnvs[0].id }));
    }
  };

  const handleOpenNew = () => {
    setEditingPlant(null);
    setFormData(prev => ({ ...prev, strain: '', quantity: 1, colorTag: 0 }));
    setModalOpen(true);
  };

  const handleOpenEdit = (plant: any) => {
    setEditingPlant(plant);
    setFormData({ 
      strain: plant.strain, 
      quantity: 1, 
      colorTag: plant.colorTag, 
      environmentId: plant.environmentId 
    });
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (!editingPlant) return;
    if (window.confirm(`Excluir permanentemente a genética "${editingPlant.strain}" do sistema? Essa ação não pode ser desfeita.`)) {
      deletePlant(editingPlant.id);
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR') + ', ' + now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
      addAction({
        type: 'Observação',
        date: dateStr,
        observation: `Planta (Genética: ${editingPlant.strain}) removida permanentemente pelo cultivador. Causa não registrada.`,
        environmentName: editingPlant.environmentName
      });

      loadData();
      setModalOpen(false);
    }
  };

  const handleSave = () => {
    if (!formData.strain || !formData.environmentId) return;
    
    const targetEnv = envs.find(e => e.id === formData.environmentId);
    if (!targetEnv) return;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ', ' + now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    if (editingPlant) {
      updatePlant(editingPlant.id, { 
        strain: formData.strain, 
        colorTag: formData.colorTag, 
        environmentId: formData.environmentId,
        environmentName: targetEnv.name
      });
      addAction({
        type: 'Observação',
        date: dateStr,
        observation: `Dados corporais da planta foram editados. Nova identificação visual: ${formData.strain} e transferida para ambiente ${targetEnv.name}.`,
        environmentName: targetEnv.name
      });
    } else {
      const qty = Number(formData.quantity) || 1;
      const newPlants = [];
      
      for(let i=0; i<qty; i++) {
          newPlants.push({
              id: Math.random().toString(36).substr(2, 6),
              strain: formData.strain + (qty > 1 ? ` #${i+1}` : ''),
              colorTag: Number(formData.colorTag),
              daysPlanted: 0,
              currentStage: 'Germinação',
              environmentId: formData.environmentId,
              environmentName: targetEnv.name
          });
      }
      
      addPlants(newPlants);
      addAction({
        type: 'Observação',
        date: dateStr,
        observation: `Semeadura/Plantio: ${qty}x plantas da genética "${formData.strain}" adicionadas ao ambiente.`,
        environmentName: targetEnv.name
      });
    }
    
    loadData();
    setModalOpen(false);
  };

  const filteredPlants = plants.filter(p => {
      const matchQuery = p.strain.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery.toLowerCase());
      const matchStage = stageFilter ? p.currentStage === stageFilter : true;
      return matchQuery && matchStage;
  });

  return (
    <div className="dashboard-container relative">
      <div className="flex-header">
        <div>
          <h2 className="page-title">Suas Plantas {id && envs.find(e => e.id===id) ? `- ${envs.find(e => e.id===id)?.name}` : ''}</h2>
          <p className="page-subtitle">Acompanhe o ciclo de cultivo na linha do tempo.</p>
        </div>
        <div className="header-actions">
          <button className={`btn ${showFilter ? 'btn-primary' : 'btn-secondary'} text-sm`} onClick={() => setShowFilter(!showFilter)}>
            <Filter size={18} /> Filtrar
          </button>
          <button className="btn btn-primary text-sm" onClick={handleOpenNew}>
            <Plus size={18} /> Nova
          </button>
        </div>
      </div>

      {showFilter && (
         <div className="filter-panel glass-panel">
            <div className="filter-group">
               <Search size={18} className="text-secondary" />
               <input 
                  className="filter-input"
                  placeholder="Buscar genética ou Tag ID..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
               />
            </div>
            <select 
               className="filter-select"
               value={stageFilter}
               onChange={e => setStageFilter(e.target.value)}
            >
               <option value="">Filtro: Todos os Estágios</option>
               <option value="Germinação">Germinação</option>
               <option value="Muda">Muda</option>
               <option value="Vegetativo">Vegetativo</option>
               <option value="Floração">Floração</option>
               <option value="Colheita">Colheita</option>
            </select>
         </div>
      )}

      <div className="plants-grid mt-4">
        {filteredPlants.map(p => (
          <PlantCard key={p.id} plant={p} onAction={setActionModalTarget} onEdit={handleOpenEdit} />
        ))}
        {filteredPlants.length === 0 && (
          <div className="flex flex-col items-center glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', opacity: 0.8, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Nenhuma semente no solo</h3>
            <p className="text-secondary">Abra algum ambiente e plante seu primeiro lote para começar a registrar ocorrências de fenótipos.</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{editingPlant ? 'Editar Aspectos Visuais/Cadastro' : 'Novo Lote ou Planta'}</h3>
            
            <div className="modal-form-group">
              <label>Nome / Genética (Strain)</label>
              <input 
                className="modal-input" 
                placeholder="Ex: Gorilla Glue" 
                value={formData.strain}
                onChange={(e) => setFormData({...formData, strain: e.target.value})}
                autoFocus
              />
            </div>

            <div className="modal-form-group">
              <label>Glow Visual (Tag de Cor)</label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {[0,1,2,3,4,5,6,7,8].map(c => (
                  <button 
                    key={c}
                    onClick={() => setFormData({...formData, colorTag: c})}
                    style={{ 
                        width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                        backgroundColor: `var(--glow-${c})`,
                        border: formData.colorTag === c ? '3px solid white' : 'none',
                        transform: formData.colorTag === c ? 'scale(1.1)' : 'none',
                        transition: 'all 0.2s',
                        outline: 'none'
                     }}
                  />
                ))}
              </div>
            </div>
            
            <div className="modal-form-group" style={{ marginTop: '0.5rem' }}>
              <label>Ambiente de Destino</label>
              <select 
                className="modal-select" 
                value={formData.environmentId}
                onChange={(e) => setFormData({...formData, environmentId: e.target.value})}
              >
                {envs.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            {!editingPlant && (
              <div className="modal-form-group">
                <label>Quantidade de Semeadura (Lote)</label>
                <input 
                  type="number"
                  min="1"
                  max="50"
                  className="modal-input" 
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1 })}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem'}}>
                  Gera ramificações em batch com identificadores contínuos (*ex: #1, #2*).
                </span>
              </div>
            )}

            <div className="modal-actions" style={{ flexWrap: 'wrap' }}>
              {editingPlant && (
                <button 
                  className="btn text-sm font-semibold" 
                  style={{ color: '#ef4444', marginRight: 'auto', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'transparent' }} 
                  onClick={handleDelete}
                >
                  Excluir Planta
                </button>
              )}
              <div style={{ display: 'flex', gap: '1rem', width: editingPlant ? 'auto' : '100%', flex: editingPlant ? 'none' : 1 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>{editingPlant ? 'Salvar Configuração' : 'Plantar Lote'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {actionModalTarget && (
        <ActionModal 
           targetType="Planta" 
           targetId={actionModalTarget.id} 
           targetName={actionModalTarget.strain + ' ID#' + actionModalTarget.id} 
           envName={actionModalTarget.environmentName}
           availableActions={plantActions} 
           onClose={() => setActionModalTarget(null)} 
        />
      )}
    </div>
  );
};
