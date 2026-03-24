import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, ClipboardList, Save, Scale, Filter } from 'lucide-react';
import { getPlants, updatePlant, addAction } from '../store';
import './Plants.css'; // reaproveitamos estilos

export const Harvests = () => {
  const [harvests, setHarvests] = useState<any[]>([]);
  const [periodFilter, setPeriodFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadHarvests();
  }, []);

  const loadHarvests = () => {
    const allPlants = getPlants();
    setHarvests(allPlants.filter((p: any) => p.currentStage === 'Colheita').reverse());
  };

  const filteredHarvests = harvests.filter(h => {
     if (periodFilter === 'all') return true;
     if (!h.harvestDate) return true; // Suporte a colheitas feitas antes do update de data
     
     const harvestTime = new Date(h.harvestDate).getTime();
     const now = new Date().getTime();
     const diffDays = (now - harvestTime) / (1000 * 3600 * 24);
     
     return diffDays <= Number(periodFilter);
  });

  const HarvestCard = ({ plant }: { plant: any }) => {
    const [yieldAmount, setYieldAmount] = useState(plant.yieldAmount || '');
    const [saved, setSaved] = useState(false);

    const handleSaveYield = () => {
      if (!yieldAmount) return;
      updatePlant(plant.id, { yieldAmount });
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR') + ', ' + now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
      
      addAction({
        type: 'Colheita Final',
        date: dateStr,
        observation: `Pesagem de Rendimento Final registrada: ${yieldAmount}. Fim do ciclo visualizado.`,
        environmentName: plant.environmentName,
        plantId: plant.id
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      loadHarvests();
    };

    return (
      <div className={`plant-card glow-${plant.colorTag} glass-panel`} style={{ borderColor: 'var(--accent-primary)' }}>
        <div className="plant-header" style={{ marginBottom: '0.5rem' }}>
          <div>
            <span className="id-hash">#{plant.id}</span>
            <h3 className="strain-name" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={18} color="var(--accent-primary)" /> {plant.strain}
            </h3>
          </div>
          <span className="env-badge" style={{ background: 'rgba(29, 235, 105, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(29, 235, 105, 0.3)' }}>
            Colhida
          </span>
        </div>

        <div className="plant-details" style={{ marginBottom: '1rem' }}>
          <div className="detail-item">
            <span>Ambiente de Origem: <strong>{plant.environmentName}</strong></span>
          </div>
        </div>

        {/* Highlighted Yield Field */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
             <Scale size={16} /> Rendimento / Produção Final
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              className="modal-input" 
              style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(0,0,0,0.5)', textAlign: 'center' }} 
              placeholder="Ex: 50g, 120g secas..." 
              value={yieldAmount}
              onChange={(e) => setYieldAmount(e.target.value)}
            />
            <button 
              className="btn btn-primary" 
              style={{ width: '48px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: saved ? '#111' : 'var(--accent-primary)', color: saved ? '#1deb69' : '#000' }} 
              onClick={handleSaveYield}
            >
              <Save size={20} />
            </button>
          </div>
        </div>

        <div className="plant-footer" style={{ borderTop: 'none', marginTop: '1rem', paddingTop: 0 }}>
          <Link to={`/historico?search=${plant.id}`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%', padding: '0.6rem', borderRadius: '8px', textDecoration: 'none', color: '#000', fontWeight: 600 }}>
            <ClipboardList size={18} /> Resumo Completo do Ciclo
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="flex-header">
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award className="text-accent-primary" size={28} /> Suas Colheitas</h2>
          <p className="page-subtitle">O resultado do seu esforço. Insira o peso final e consulte o histórico.</p>
        </div>
        <button className={`btn ${showFilter ? 'btn-primary' : 'btn-secondary'} text-sm`} onClick={() => setShowFilter(!showFilter)}>
          <Filter size={18} /> Filtrar
        </button>
      </div>

      {showFilter && (
         <div className="filter-panel glass-panel mt-4 mb-4">
            <select 
               className="filter-select"
               style={{ width: '100%' }}
               value={periodFilter}
               onChange={e => setPeriodFilter(e.target.value)}
            >
               <option value="all">Exibindo: Todos os Períodos</option>
               <option value="30">Colhidas nos Últimos 30 dias</option>
               <option value="90">Colhidas nos Últimos 3 meses</option>
               <option value="180">Colhidas nos Últimos 6 meses</option>
               <option value="365">Colhidas no Último Ano</option>
            </select>
         </div>
      )}

      <div className="plants-grid mt-4">
        {filteredHarvests.map(h => (
          <HarvestCard key={h.id} plant={h} />
        ))}
        {filteredHarvests.length === 0 && (
          <div className="flex flex-col items-center glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', opacity: 0.8, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Nenhum troféu ainda! 🏆</h3>
            <p className="text-secondary">Quando você alterar o estágio de uma planta na aba Plantas para "Colheita", ela aparecerá automaticamente aqui para o pesamento final.</p>
          </div>
        )}
      </div>
    </div>
  );
};
