import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Map as MapIcon, Calendar as CalendarIcon, Target, Trash2, CheckSquare, Square, History as HistoryIcon } from 'lucide-react';
import { getTasks, addTask, updateTask, deleteTask, getEnvs, getPlants, getActions } from '../store';
import './CalendarView.css';

// Canonical Task Types for the Droopdown and Legend
const taskTypes = ['Rega', 'Adubação', 'Poda', 'Aplicação Foliar', 'Transplante', 'Colheita', 'Outros'];

const getTaskColor = (type: string) => {
  if(!type) return '#f5f5f5';
  const t = type.toLowerCase();
  if (t.includes('rega')) return '#3b82f6';
  if (t.includes('aduba') || t.includes('nutri') || t.includes('fertil')) return '#1deb69';
  if (t.includes('poda') || t.includes('treino') || t.includes('amarra')) return '#f97316';
  if (t.includes('foliar') || t.includes('pulveriza') || t.includes('defensivo')) return '#0ea5e9';
  if (t.includes('transplante') || t.includes('vaso')) return '#a855f7';
  if (t.includes('colheita')) return '#eab308';
  return '#f5f5f5'; // default
};

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [envs, setEnvs] = useState<any[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [envFilter, setEnvFilter] = useState('all');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Rega',
    targetType: 'Ambiente',
    targetId: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTasks(getTasks());
    setActions(getActions());
    const loadedEnvs = getEnvs();
    setEnvs(loadedEnvs);
    setPlants(getPlants());
    if(loadedEnvs.length > 0 && !formData.targetId) {
       setFormData(f => ({ ...f, targetId: loadedEnvs[0].id }));
    }
  };

  const parseActionDate = (dateStr: string) => {
     if(!dateStr) return new Date();
     const parts = dateStr.split(',');
     if(!parts[0]) return new Date();
     const dateString = parts[0].trim();
     
     if(dateString.includes('/')) {
        const dateParts = dateString.split('/');
        if(dateParts.length === 3) {
           if(dateParts[0].length === 4) { // YYYY/MM/DD
              return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
           }
           // DD/MM/YYYY
           return new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
        }
     }
     
     const d = new Date(dateStr);
     return isNaN(d.getTime()) ? new Date() : d;
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const handleSaveTask = () => {
    if(!selectedDate || !formData.targetId) return;
    
    // resolve targetName and environment dependency
    let tName = '';
    let envIdForFilter = '';
    
    if(formData.targetType === 'Ambiente') {
       const e = envs.find(x => x.id === formData.targetId);
       tName = e ? e.name : 'Ambiente Desconhecido';
       envIdForFilter = formData.targetId;
    } else {
       const p = plants.find(x => x.id === formData.targetId);
       tName = p ? p.strain + ' (' + p.id + ')' : 'Planta Desconhecida';
       envIdForFilter = p ? p.environmentId : '';
    }

    const isoDate = selectedDate.toISOString();
    addTask({
       date: isoDate,
       type: formData.type,
       targetType: formData.targetType,
       targetId: formData.targetId,
       targetName: tName,
       envId: envIdForFilter, // Usado para filtrar no mapa depois
       description: formData.description
    });
    
    setShowModal(false);
    setFormData({ ...formData, description: '' });
    loadData();
  };

  const toggleTask = (id: string, currentStatus: boolean) => {
    updateTask(id, { completed: !currentStatus });
    loadData();
  };

  const removeTask = (id: string) => {
    deleteTask(id);
    loadData();
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const cells = [];
    const today = new Date();

    // Filtra tasls pelo Ambiente selecionado
    const visibleTasks = envFilter === 'all' 
       ? tasks 
       : tasks.filter(t => t.envId === envFilter);
       
    const visibleActions = envFilter === 'all'
       ? actions
       : actions.filter(a => {
           const env = envs.find(e => e.id === envFilter);
           return env && a.environmentName === env.name;
       });

    // Empty cells before 1st
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell disabled"></div>);
    }

    // Days 1..N
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const isSelected = selectedDate && isSameDay(cellDate, selectedDate);
      const isToday = isSameDay(cellDate, today);
      
      const dayTasks = visibleTasks.filter(t => {
         const d = new Date(t.date);
         return isSameDay(d, cellDate);
      });
      
      const dayActions = visibleActions.filter(a => isSameDay(parseActionDate(a.date), cellDate));
      const allDots = [...dayTasks, ...dayActions.map((a:any) => ({ ...a, completed: true }))];

      cells.push(
        <div 
          key={day} 
          className={`calendar-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => setSelectedDate(cellDate)}
        >
          <span className="day-num">{day}</span>
          <div className="day-dots">
            {allDots.map((t:any, idx:number) => {
               // Renderizamos dots sólidos para Actions Históricas, e opacos para Tasks não processadas mas já passadas.
               return (
                  <div 
                     key={t.id || idx} 
                     className="dot" 
                     style={{ 
                        backgroundColor: getTaskColor(t.type), 
                        opacity: (t.completed && !t.isAction) ? 0.3 : 1 
                     }}
                  ></div>
               )
            })}
          </div>
        </div>
      );
    }

    return cells;
  };

  // List of tasks for the selected date
  const selectedDateTasks = (!selectedDate) ? [] : tasks.filter(t => {
     if(envFilter !== 'all' && t.envId !== envFilter) return false;
     return isSameDay(new Date(t.date), selectedDate);
  });
  
  const selectedDateActions = (!selectedDate) ? [] : actions.filter(a => {
     if(envFilter !== 'all') {
        const env = envs.find(e => e.id === envFilter);
        if(env && a.environmentName !== env.name) return false;
     }
     return isSameDay(parseActionDate(a.date), selectedDate);
  });

  const combinedItems = [
     ...selectedDateTasks.map((t:any) => ({ ...t, isAction: false })),
     ...selectedDateActions.map((a:any) => {
        let tName = a.environmentName;
        if(a.plantId) {
           const p = plants.find((x:any) => x.id === a.plantId);
           if(p) tName = p.strain;
        }
        return {
           isAction: true,
           id: a.id,
           type: a.type || 'Ação Rápida',
           completed: true,
           targetType: a.plantId ? 'Planta' : 'Ambiente',
           targetName: tName,
           description: a.observation + (a.productUsed ? ` (Produto: ${a.productUsed})` : '')
        };
     })
  ];

  return (
    <div className="dashboard-container" style={{ paddingBottom: '6rem' }}>
      <div className="flex-header mb-4" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapIcon className="text-accent-primary" size={28} /> Mapa Geral</h2>
          <p className="page-subtitle">Planeje seu cultivo com agendamentos precisos.</p>
        </div>
        
        <select 
           className="filter-select w-full"
           value={envFilter}
           onChange={e => setEnvFilter(e.target.value)}
        >
           <option value="all">Visão Global (Todos os Ambientes)</option>
           {envs.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
           <button className="btn-action" style={{ background: 'transparent' }} onClick={prevMonth}><ChevronLeft size={24} /></button>
           <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
           <button className="btn-action" style={{ background: 'transparent' }} onClick={nextMonth}><ChevronRight size={24} /></button>
        </div>

        <div className="calendar-grid">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
             <div key={i} className="calendar-day-header">{d}</div>
          ))}
          {renderCalendar()}
        </div>

        <div className="legend-container">
          {taskTypes.map(label => (
            <div key={label} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getTaskColor(label) }}></div>
              {label}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
         <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarIcon size={18} className="text-accent-primary"/> 
                  Agenda ({selectedDate.toLocaleDateString('pt-BR')})
               </h3>
               <button className="btn btn-primary text-sm" onClick={() => setShowModal(true)}>
                  <Plus size={16} /> Nova Tarefa
               </button>
            </div>

            {combinedItems.length === 0 ? (
               <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>
                  <p style={{ color: 'var(--text-secondary)' }}>Nada registrado para este dia.</p>
               </div>
            ) : (
               <div className="tasks-list">
                  {combinedItems.map((t:any) => (
                     <div key={t.id} className={`task-item ${t.completed && !t.isAction ? 'completed' : ''}`}>
                        <div className="task-color-bar" style={{ backgroundColor: getTaskColor(t.type) }}></div>
                        <div className="task-content">
                           <div className="task-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {t.type} em {t.targetType}
                              {t.isAction && <span title="Ação do Passado" style={{ display: 'flex' }}><HistoryIcon size={12} color="var(--accent-primary)" /></span>}
                           </div>
                           <div className="task-meta">
                              <Target size={12} /> {t.targetName}
                           </div>
                           {t.description && <div className="task-desc">{t.description}</div>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                           {t.isAction ? null : (
                              <>
                                 <button className="btn-action" onClick={() => toggleTask(t.id, t.completed)}>
                                    {t.completed ? <CheckSquare size={20} color="var(--accent-primary)" /> : <Square size={20} />}
                                 </button>
                                 <button className="btn-action" onClick={() => removeTask(t.id)}>
                                    <Trash2 size={20} color="#f87171" />
                                 </button>
                              </>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel">
            <h3 className="modal-title">Agendar Tarefa</h3>
            <p className="modal-subtitle" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
               Data selecionada: {selectedDate?.toLocaleDateString('pt-BR')}
            </p>

            <div className="modal-form-group">
              <label>Tipo de Ação</label>
              <select 
                 className="modal-select" 
                 value={formData.type}
                 onChange={e => setFormData({...formData, type: e.target.value})}
              >
                 {taskTypes.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div className="modal-form-group">
              <label>Aplicar em</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <button 
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: formData.targetType === 'Ambiente' ? 'rgba(29, 235, 105, 0.2)' : 'transparent', color: formData.targetType === 'Ambiente' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                    onClick={() => {
                       setFormData(f => ({ ...f, targetType: 'Ambiente', targetId: envs.length > 0 ? envs[0].id : '' }));
                    }}
                 >Ambiente Inteiro</button>
                 <button 
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: formData.targetType === 'Planta' ? 'rgba(29, 235, 105, 0.2)' : 'transparent', color: formData.targetType === 'Planta' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                    onClick={() => {
                       setFormData(f => ({ ...f, targetType: 'Planta', targetId: plants.length > 0 ? plants[0].id : '' }));
                    }}
                 >Apenas uma Planta</button>
              </div>

              <select 
                 className="modal-select mt-2"
                 value={formData.targetId}
                 onChange={e => setFormData({...formData, targetId: e.target.value})}
              >
                 {formData.targetType === 'Ambiente' 
                    ? envs.map(e => <option key={e.id} value={e.id}>{e.name}</option>)
                    : plants.filter(p => p.currentStage !== 'Colheita').map(p => <option key={p.id} value={p.id}>{p.strain} ({p.id})</option>)
                 }
              </select>
            </div>

            <div className="modal-form-group">
              <label>Descrição / Lembrete</label>
              <textarea 
                className="modal-input" 
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Ex: Adubar com 2ml/L FloraNova..." 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveTask}>Confirmar Agendamento</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
