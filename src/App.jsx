import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import PatientApp from './pages/PatientApp';
import DoctorDashboard from './pages/DoctorDashboard';
import { initializeDatabase } from './data/simulated_database';

function App() {
  const [view, setView] = useState('landing'); // landing, patient, doctor
  const [currentPatient, setCurrentPatient] = useState(null);

  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  const handleLogin = (role, patient) => {
    if (role === 'patient') {
      setCurrentPatient(patient);
      setView('patient');
    } else {
      setView('doctor');
    }
  };

  const handleReset = () => {
    // Clear specific keys
    localStorage.removeItem('mystree_patients');
    localStorage.removeItem('mystree_cases');
    // Clear everything to be safe
    localStorage.clear();

    // Broadcast reset event to other tabs
    const channel = new BroadcastChannel('mystree_reset_channel');
    channel.postMessage('reset');
    channel.close();

    window.location.reload();
  };

  useEffect(() => {
    const channel = new BroadcastChannel('mystree_reset_channel');
    channel.onmessage = (event) => {
      if (event.data === 'reset') {
        window.location.reload();
      }
    };
    return () => channel.close();
  }, []);

  return (
    <div className="antialiased text-slate-900 bg-slate-50 min-h-screen">
      {view === 'landing' && <LandingPage onLogin={handleLogin} />}
      {view === 'patient' && (
        <PatientApp
          patient={currentPatient}
          onSwitchPersona={() => setView('landing')}
        />
      )}
      {view === 'doctor' && <DoctorDashboard />}

      {/* Dev Toggle (Hidden in production, useful for demo) */}
      <div className="fixed bottom-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={handleReset}
          className="bg-black text-white px-3 py-1 rounded text-xs"
        >
          Reset Data
        </button>
      </div>

      <ToastContainer />
    </div>
  );
}

const ToastContainer = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('mystree-toast', handleToast);
    return () => window.removeEventListener('mystree-toast', handleToast);
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-slide-down">
      <div className="bg-white/90 backdrop-blur-md text-slate-800 px-6 py-3 rounded-full shadow-2xl border border-slate-200 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="font-medium text-sm">{toast.message}</span>
      </div>
    </div>
  );
};

export default App;
