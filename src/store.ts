import { auth } from './firebase';

// Cria namespaces separados no cache baseado no UID único do autenticado
const getUserKey = (base: string) => {
  const uid = auth.currentUser?.uid || 'guest';
  return `${base}_${uid}`;
};

export const getActions = () => {
    const s = localStorage.getItem(getUserKey('growapp_actions'));
    return s ? JSON.parse(s) : [];
}
 
export const addAction = (action: any) => {
    const actions = getActions();
    actions.unshift({ id: Math.random().toString(36).substr(2,9), ...action });
    localStorage.setItem(getUserKey('growapp_actions'), JSON.stringify(actions));
}

export const getEnvs = () => {
    const s = localStorage.getItem(getUserKey('growapp_envs'));
    return s ? JSON.parse(s) : [];
};

export const saveEnv = (env: any) => {
    const envs = getEnvs();
    const idx = envs.findIndex((e:any) => e.id === env.id);
    if (idx >= 0) envs[idx] = env;
    else envs.push(env);
    localStorage.setItem(getUserKey('growapp_envs'), JSON.stringify(envs));
};

export const deleteEnv = (id: string) => {
    const envs = getEnvs();
    localStorage.setItem(getUserKey('growapp_envs'), JSON.stringify(envs.filter((e:any) => e.id !== id)));
    // Deleção em Cascata (Deleta plantas orfãs para limpar banco e UI)
    const plants = getPlants();
    localStorage.setItem(getUserKey('growapp_plants'), JSON.stringify(plants.filter((p:any) => p.environmentId !== id)));
};

export const getPlants = () => {
    const s = localStorage.getItem(getUserKey('growapp_plants'));
    return s ? JSON.parse(s) : [];
};

export const addPlants = (newPlants: any[]) => {
    const plants = getPlants();
    plants.push(...newPlants);
    localStorage.setItem(getUserKey('growapp_plants'), JSON.stringify(plants));
    
    updateEnvCounts(plants);
};

export const updatePlant = (id: string, updates: any) => {
    const plants = getPlants();
    const idx = plants.findIndex((x:any) => x.id === id);
    if (idx >= 0) {
        plants[idx] = { ...plants[idx], ...updates };
        localStorage.setItem(getUserKey('growapp_plants'), JSON.stringify(plants));
        updateEnvCounts(plants);
    }
};

export const deletePlant = (id: string) => {
    let plants = getPlants();
    plants = plants.filter((p:any) => p.id !== id);
    localStorage.setItem(getUserKey('growapp_plants'), JSON.stringify(plants));
    updateEnvCounts(plants);
};

export const updatePlantStage = (id: string, newStage: string) => {
    const plants = getPlants();
    const p = plants.find((x:any) => x.id === id);
    if(p) {
        p.currentStage = newStage;
        localStorage.setItem(getUserKey('growapp_plants'), JSON.stringify(plants));
    }
};

const updateEnvCounts = (currentPlants: any[]) => {
    const envs = getEnvs();
    envs.forEach((env: any) => {
        env.plantCount = currentPlants.filter((p:any) => p.environmentId === env.id).length;
    });
    localStorage.setItem(getUserKey('growapp_envs'), JSON.stringify(envs));
};
