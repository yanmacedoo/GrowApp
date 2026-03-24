import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import { HistoryTimeline } from '../components/HistoryTimeline';
import { getActions } from '../store';
import './History.css';

export const History = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [actions, setActions] = useState<any[]>([]);
  
  // States - Pré-carregando do Hook de Parâmetros
  const [showFilter, setShowFilter] = useState(!!initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setActions(getActions());
  }, []);

  const filteredActions = actions.filter(a => {
      const qs = searchQuery.toLowerCase();
      // O texto preenchido procura tanto em nome de ambiente, ID da planta, produto utilizado, quanto no texto da observação
      const matchSearch = 
        (a.environmentName || '').toLowerCase().includes(qs) ||
        (a.plantId || '').toLowerCase().includes(qs) ||
        (a.observation || '').toLowerCase().includes(qs) ||
        (a.productUsed || '').toLowerCase().includes(qs) || 
        (a.type || '').toLowerCase().includes(qs);
        
      const matchType = typeFilter ? a.type === typeFilter : true;
      
      return matchSearch && matchType;
  });

  // Extrair dinamicamente a array com todos os tipos únicos de ação que estão em banco de dados presentemente p/ o select
  const uniqueTypes = Array.from(new Set(actions.map(a => a.type)));

  return (
    <div className="dashboard-container relative">
      <div className="flex-header" style={{ marginBottom: showFilter ? '0' : '2rem' }}>
        <div>
          <h2 className="page-title">Histórico de Manejos</h2>
          <p className="page-subtitle">Acompanhe e filtre a timeline de atividades do seu cultivo.</p>
        </div>
        <div className="header-actions">
          <button className={`btn ${showFilter ? 'btn-primary' : 'btn-secondary'} text-sm`} onClick={() => setShowFilter(!showFilter)}>
            <Filter size={18} /> Filtrar Timeline
          </button>
        </div>
      </div>

      {showFilter && (
         <div className="filter-panel glass-panel" style={{ marginBottom: '1.5rem' }}>
            <div className="filter-group" style={{ flex: 2 }}>
               <Search size={18} className="text-secondary" />
               <input 
                  className="filter-input"
                  placeholder="Buscar Ambiente, ID da Planta, ou Observação..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
               />
            </div>
            <select 
               className="filter-select"
               style={{ flex: 1 }}
               value={typeFilter}
               onChange={e => setTypeFilter(e.target.value)}
            >
               <option value="">Ação: Todo Tipo de Registro</option>
               {uniqueTypes.map(t => (
                  <option key={t as string} value={t as string}>{t as string}</option>
               ))}
            </select>
         </div>
      )}

      <div style={{ maxWidth: '800px', width: '100%' }}>
        {filteredActions.length > 0 ? (
           <HistoryTimeline actions={filteredActions} />
        ) : (
           <div className="flex flex-col items-center" style={{ padding: '3rem', opacity: 0.6 }}>
             <p>Nenhum registro encontrado para essa busca.</p>
           </div>
        )}
      </div>
    </div>
  );
};
