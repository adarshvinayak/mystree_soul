import { initDatabase, getPatientById, getAllPatients, updatePatient as updatePatientDb } from './database.js';

// Legacy patient structure for UI compatibility
export const PATIENTS = [
  {
    id: 'p1',
    name: 'Anjali',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    caseType: 'RED',
    symptoms: 'Leg lesion',
    age: 45, // Updated from SQLite
    cycleDay: 14,
  },
  {
    id: 'p2',
    name: 'Priya',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    caseType: 'YELLOW',
    symptoms: 'Genital bump',
    age: 24, // Updated from SQLite
    cycleDay: 21,
  },
  {
    id: 'p3',
    name: 'Sneha',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    caseType: 'GREEN',
    symptoms: 'General inquiry',
    age: 19, // Updated from SQLite
    cycleDay: 5,
  },
  {
    id: 'p4',
    name: 'Riya',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150',
    caseType: 'PARTNER_ALERT',
    symptoms: 'Emotional support',
    age: 28, // Updated from SQLite
    cycleDay: 26,
  },
];

export const INITIAL_CASES = [];

// Initialize SQLite database
export const initializeDatabase = async () => {
  try {
    await initDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
  
  // Keep localStorage for cases
  if (!localStorage.getItem('mystree_cases')) {
    localStorage.setItem('mystree_cases', JSON.stringify(INITIAL_CASES));
  }
};

// Get patient details from SQLite
export const getPatientDetails = (patientId) => {
  return getPatientById(patientId);
};

import { useState, useEffect } from 'react';

export const useStore = () => {
  const [cases, setCases] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dbInitialized, setDbInitialized] = useState(false);

  const loadData = async () => {
    const storedCases = JSON.parse(localStorage.getItem('mystree_cases') || '[]');
    setCases(storedCases);
    
    // Load patients from SQLite if initialized, otherwise use legacy data
    if (dbInitialized) {
      try {
        const sqlitePatients = getAllPatients();
        // Merge SQLite data with legacy structure for UI compatibility
        const mergedPatients = PATIENTS.map(p => {
          const sqliteData = sqlitePatients.find(sp => {
            const idMap = { 'p1': 'user_001', 'p2': 'user_002', 'p3': 'user_003', 'p4': 'user_004' };
            return sp.ID === (idMap[p.id] || p.id);
          });
          return sqliteData ? { ...p, ...sqliteData, age: sqliteData.Age } : p;
        });
        setPatients(mergedPatients);
      } catch (error) {
        console.error('Error loading patients from SQLite:', error);
        setPatients(PATIENTS);
      }
    } else {
      setPatients(PATIENTS);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      setDbInitialized(true);
      await loadData();
    };
    init();

    const handleStorageChange = (e) => {
      if (e.key === 'mystree_cases') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mystree-update', loadData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mystree-update', loadData);
    };
  }, []);
  
  useEffect(() => {
    if (dbInitialized) {
      loadData();
    }
  }, [dbInitialized]);

  const updateCaseStatus = (caseId, status) => {
    const currentCases = JSON.parse(localStorage.getItem('mystree_cases') || '[]');
    const updatedCases = currentCases.map(c =>
      c.id === caseId ? { ...c, status } : c
    );
    localStorage.setItem('mystree_cases', JSON.stringify(updatedCases));
    window.dispatchEvent(new Event('mystree-update'));
  };

  const addMessageToCase = (caseId, message) => {
    const currentCases = JSON.parse(localStorage.getItem('mystree_cases') || '[]');
    const updatedCases = currentCases.map(c => {
      if (c.id === caseId) {
        return { ...c, chatHistory: [...c.chatHistory, message] };
      }
      return c;
    });
    localStorage.setItem('mystree_cases', JSON.stringify(updatedCases));
    window.dispatchEvent(new Event('mystree-update'));
  };

  const createCase = (patientId, initialMessage, initialStatus = 'ANALYZING') => {
    const currentCases = JSON.parse(localStorage.getItem('mystree_cases') || '[]');
    const newCase = {
      id: `c${Date.now()}`,
      patientId,
      status: initialStatus,
      riskLevel: 'MEDIUM', // Default, could be inferred
      timestamp: new Date().toISOString(),
      chatHistory: [initialMessage],
      aiAssessment: '' // Initialize empty assessment
    };
    localStorage.setItem('mystree_cases', JSON.stringify([...currentCases, newCase]));
    window.dispatchEvent(new Event('mystree-update'));
    return newCase;
  };

  const updateCase = (caseId, updates) => {
    const currentCases = JSON.parse(localStorage.getItem('mystree_cases') || '[]');
    const updatedCases = currentCases.map(c =>
      c.id === caseId ? { ...c, ...updates } : c
    );
    localStorage.setItem('mystree_cases', JSON.stringify(updatedCases));
    window.dispatchEvent(new Event('mystree-update'));
  };

  const updatePatient = (patientId, updates) => {
    // Update in SQLite if initialized
    if (dbInitialized) {
      try {
        updatePatientDb(patientId, updates);
      } catch (error) {
        console.error('Error updating patient in SQLite:', error);
      }
    }
    // Trigger reload
    loadData();
    window.dispatchEvent(new Event('mystree-update'));
  };

  return { cases, patients, updateCaseStatus, addMessageToCase, createCase, updatePatient, updateCase, getPatientDetails };
};
