export const getActions = () => {
    const s = localStorage.getItem('growapp_actions');
    if (s) return JSON.parse(s);
    const m = [
       { id: '1', type: 'Rega', date: 'Hoje, 09:30', observation: 'Rega com água pH 6.2 e run-off de 10%', plantId: 'ab79f', environmentName: 'Growbox Indoor Principal' },
       { id: '2', type: 'Adubação', date: 'Ontem, 18:00', productUsed: 'Bio-Grow 2ml/L', observation: 'Adição de nitrogênio para a fase vegetativa.', environmentName: 'Varanda Sul' },
       { id: '3', type: 'Poda', date: '21 Mar 2026', observation: 'Top pruning (Poda Top) realizada no 4º nó.', plantId: 'b99ea', environmentName: 'Estufa de Clones' },
       { id: '4', type: 'Pesticida', date: '18 Mar 2026', productUsed: 'Óleo de Neem 5ml/L', observation: 'Aplicação preventiva contra insetos.', environmentName: 'Growbox Indoor Principal' },
    ];
    localStorage.setItem('growapp_actions', JSON.stringify(m));
    return m;
}
 
export const addAction = (action: any) => {
    const actions = getActions();
    actions.unshift({ id: Math.random().toString(36).substr(2,9), ...action });
    localStorage.setItem('growapp_actions', JSON.stringify(actions));
}

export const getEnvs = () => {
    const s = localStorage.getItem('growapp_envs');
    if (s) return JSON.parse(s);
    const m = [
      { id: '1', name: 'Growbox Indoor Principal', size: '80x80x160', type: 'Indoor', plantCount: 2 },
      { id: '2', name: 'Varanda Sul', size: 'Aberta', type: 'Outdoor', plantCount: 1 },
      { id: '3', name: 'Estufa de Clones', size: '40x40x120', type: 'Greenhouse', plantCount: 1 },
    ];
    localStorage.setItem('growapp_envs', JSON.stringify(m));
    return m;
};

export const saveEnv = (env: any) => {
    const envs = getEnvs();
    const idx = envs.findIndex((e:any) => e.id === env.id);
    if (idx >= 0) envs[idx] = env;
    else envs.push(env);
    localStorage.setItem('growapp_envs', JSON.stringify(envs));
};

export const getPlants = () => {
    const s = localStorage.getItem('growapp_plants');
    if (s) return JSON.parse(s);
    const m = [
      { id: 'ab79f', strain: 'OG Kush', colorTag: 4, daysPlanted: 34, currentStage: 'Vegetativo', environmentId: '1', environmentName: 'Growbox Indoor Principal' },
      { id: 'c2e4a', strain: 'Northern Lights', colorTag: 7, daysPlanted: 60, currentStage: 'Floração', environmentId: '1', environmentName: 'Growbox Indoor Principal' },
      { id: '88df1', strain: 'Sour Diesel', colorTag: 2, daysPlanted: 12, currentStage: 'Muda', environmentId: '2', environmentName: 'Varanda Sul' },
      { id: 'b99ea', strain: 'Blue Dream', colorTag: 6, daysPlanted: 5, currentStage: 'Germinação', environmentId: '3', environmentName: 'Estufa de Clones' },
    ];
    localStorage.setItem('growapp_plants', JSON.stringify(m));
    return m;
};

export const addPlants = (newPlants: any[]) => {
    const plants = getPlants();
    plants.push(...newPlants);
    localStorage.setItem('growapp_plants', JSON.stringify(plants));
    
    // Auto atualiza o contador nos ambientes (reuso de inteligência da camada de persistência)
    const envs = getEnvs();
    newPlants.forEach(p => {
       const env = envs.find((e:any) => e.id === p.environmentId);
       if (env) env.plantCount += 1;
    });
    localStorage.setItem('growapp_envs', JSON.stringify(envs));
};

export const updatePlantStage = (id: string, newStage: string) => {
    const plants = getPlants();
    const p = plants.find((x:any) => x.id === id);
    if(p) {
        p.currentStage = newStage;
        localStorage.setItem('growapp_plants', JSON.stringify(plants));
    }
};
