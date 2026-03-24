import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// O Cache local que faz a ponte ultra-rápida (Zero Latência) com o UI,
// enquanto o Firestore gerencia o backup mestre silencioso no fundo.
let memoryCache: any = null;

export const initStore = async (uid: string) => {
    const ref = doc(db, 'users', uid);
    try {
        const snap = await getDoc(ref);
        if(snap.exists()) {
            memoryCache = snap.data();
            // Fallbacks de segurança para contas antigas/novas
            if(!memoryCache.envs) memoryCache.envs = [];
            if(!memoryCache.plants) memoryCache.plants = [];
            if(!memoryCache.actions) memoryCache.actions = [];
            if(!memoryCache.tasks) memoryCache.tasks = [];
        } else {
            // MIGRATION BRIDGE: Se o banco do Cloud estiver vazio, procura no cache velho do celular.
            const getOld = (base: string) => {
               const s = localStorage.getItem(`${base}_${uid}`);
               return s ? JSON.parse(s) : [];
            };
            
            memoryCache = { 
               envs: getOld('growapp_envs'), 
               plants: getOld('growapp_plants'), 
               actions: getOld('growapp_actions'), 
               tasks: getOld('growapp_tasks') 
            };
            
            await setDoc(ref, memoryCache);
        }
    } catch(err) {
        console.error("GrowApp Firestore Init Error:", err);
        // Fallback para memória vazia se estiver offline ou erro de security rules
        memoryCache = { envs: [], plants: [], actions: [], tasks: [] };
    }
};

export const clearStore = () => {
    memoryCache = null;
};

// Commita o Cache inteiro na Nuvem de forma fire-and-forget (Assíncrono no fundo)
const persistStore = () => {
    const uid = auth.currentUser?.uid;
    if(!uid || !memoryCache) return;
    const ref = doc(db, 'users', uid);
    setDoc(ref, memoryCache, { merge: true }).catch(err => {
        console.error("GrowApp Firestore Persist Error:", err);
    });
};

export const getActions = () => memoryCache?.actions || [];
 
export const addAction = (action: any) => {
    if(!memoryCache) return;
    memoryCache.actions.unshift({ id: Math.random().toString(36).substr(2,9), ...action });
    persistStore();
}

export const getEnvs = () => memoryCache?.envs || [];

export const saveEnv = (env: any) => {
    if(!memoryCache) return;
    const idx = memoryCache.envs.findIndex((e:any) => e.id === env.id);
    if (idx >= 0) memoryCache.envs[idx] = env;
    else memoryCache.envs.push(env);
    persistStore();
};

export const deleteEnv = (id: string) => {
    if(!memoryCache) return;
    memoryCache.envs = memoryCache.envs.filter((e:any) => e.id !== id);
    memoryCache.plants = memoryCache.plants.filter((p:any) => p.environmentId !== id);
    persistStore();
};

export const getPlants = () => memoryCache?.plants || [];

export const addPlants = (newPlants: any[]) => {
    if(!memoryCache) return;
    memoryCache.plants.push(...newPlants);
    updateEnvCountsSync();
    persistStore();
};

export const updatePlant = (id: string, updates: any) => {
    if(!memoryCache) return;
    const idx = memoryCache.plants.findIndex((x:any) => x.id === id);
    if (idx >= 0) {
        memoryCache.plants[idx] = { ...memoryCache.plants[idx], ...updates };
        updateEnvCountsSync();
        persistStore();
    }
};

export const deletePlant = (id: string) => {
    if(!memoryCache) return;
    memoryCache.plants = memoryCache.plants.filter((p:any) => p.id !== id);
    updateEnvCountsSync();
    persistStore();
};

export const updatePlantStage = (id: string, newStage: string) => {
    if(!memoryCache) return;
    const p = memoryCache.plants.find((x:any) => x.id === id);
    if(p) {
        p.currentStage = newStage;
        if(newStage === 'Colheita' && !p.harvestDate) {
            p.harvestDate = new Date().toISOString();
        }
        persistStore();
    }
};

const updateEnvCountsSync = () => {
    if(!memoryCache) return;
    memoryCache.envs.forEach((env: any) => {
        env.plantCount = memoryCache.plants.filter((p:any) => p.environmentId === env.id && p.currentStage !== 'Colheita').length;
    });
};

// --- TASKS (AGENDA/MAPA) ---
export const getTasks = () => memoryCache?.tasks || [];

export const addTask = (task: any) => {
    if(!memoryCache) return;
    task.id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    task.completed = false;
    memoryCache.tasks.push(task);
    persistStore();
};

export const updateTask = (id: string, updates: any) => {
    if(!memoryCache) return;
    const t = memoryCache.tasks.find((x:any) => x.id === id);
    if(t) {
        Object.assign(t, updates);
        persistStore();
    }
};

export const deleteTask = (id: string) => {
    if(!memoryCache) return;
    memoryCache.tasks = memoryCache.tasks.filter((x:any) => x.id !== id);
    persistStore();
};
