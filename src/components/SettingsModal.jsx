import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Watch, Shield, ChevronRight, Check } from 'lucide-react';
import { useStore, getPatientDetails } from '../data/simulated_database';

const SettingsModal = ({ isOpen, onClose, patient }) => {
    const { updatePatient } = useStore();
    const [patientDetails, setPatientDetails] = useState(null);

    // Safe access to settings with defaults - check localStorage first
    const getStoredSettings = () => {
        try {
            const stored = localStorage.getItem(`mystree_patient_${patient?.id}_settings`);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    };

    const [storedSettings, setStoredSettings] = useState(getStoredSettings());

    // Update settings when patient or modal opens and fetch patient details
    useEffect(() => {
        if (isOpen && patient) {
            const settings = getStoredSettings();
            setStoredSettings(settings);
            
            // Fetch patient details from SQLite
            // Ensure database is initialized first
            const fetchDetails = async () => {
                try {
                    // Import and initialize database if needed
                    const { initDatabase } = await import('../data/database.js');
                    await initDatabase();
                    
                    // Now fetch patient details
                    const details = getPatientDetails(patient.id);
                    if (details) {
                        setPatientDetails(details);
                    }
                } catch (error) {
                    console.error('Error fetching patient details:', error);
                    // Fallback: try direct fetch without initialization
                    try {
                        const details = getPatientDetails(patient.id);
                        if (details) {
                            setPatientDetails(details);
                        }
                    } catch (e) {
                        console.error('Fallback fetch also failed:', e);
                    }
                }
            };
            
            fetchDetails();
        }
    }, [isOpen, patient?.id]);

    const partnerAlert = storedSettings.partnerAlert ?? patient?.settings?.partnerAlert ?? (patient?.caseType === 'PARTNER_ALERT');
    const wearableConnected = storedSettings.wearableConnected ?? patient?.settings?.wearableConnected ?? false;

    const togglePartnerAlert = () => {
        if (!patient) return;
        const newSettings = { ...storedSettings, partnerAlert: !partnerAlert };
        localStorage.setItem(`mystree_patient_${patient.id}_settings`, JSON.stringify(newSettings));
        setStoredSettings(newSettings);

        // Also update in the store
        updatePatient(patient.id, {
            settings: { ...patient.settings, ...newSettings }
        });

        // Trigger toast to show update
        window.dispatchEvent(new CustomEvent('mystree-toast', {
            detail: { message: `Partner Alert ${!partnerAlert ? 'Enabled' : 'Disabled'}` }
        }));
    };

    const toggleWearable = () => {
        if (!patient) return;
        const newSettings = { ...storedSettings, wearableConnected: !wearableConnected };
        localStorage.setItem(`mystree_patient_${patient.id}_settings`, JSON.stringify(newSettings));
        setStoredSettings(newSettings);

        // Also update in the store
        updatePatient(patient.id, {
            settings: { ...patient.settings, ...newSettings }
        });
    };

    if (!isOpen || !patient) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl m-0 sm:m-4 max-h-[90vh] overflow-y-auto relative z-10"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* User Profile Snippet */}
                    <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <img src={patient.avatar} alt={patient.name} className="w-14 h-14 rounded-full object-cover" />
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">{patient.name}</h3>
                            <p className="text-slate-500 text-sm">Patient ID: #{patient.id.toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Personal Details Section */}
                    <div className="space-y-3 mb-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Personal Details</h3>
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500 block text-xs">Age</span>
                                    <span className="font-medium text-slate-800">{patientDetails?.Age || patient?.age || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Role</span>
                                    <span className="font-medium text-slate-800">{patientDetails?.Role || 'Patient'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Weight</span>
                                    <span className="font-medium text-slate-800">{patientDetails?.Weight_KG ? `${patientDetails.Weight_KG} kg` : 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Blood Pressure</span>
                                    <span className="font-medium text-slate-800">{patientDetails?.BP || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Heart Rate</span>
                                    <span className="font-medium text-slate-800">{patientDetails?.Heart_Rate ? `${patientDetails.Heart_Rate} bpm` : 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Cycle Status</span>
                                    <span className="font-medium text-slate-800">{patientDetails?.Cycle_Status || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-400 italic">
                                    These details will be shared with the doctor when you consent to an alert.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Settings Sections */}
                    <div className="space-y-6">

                        {/* Partner Alert */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Safety & Support</h3>
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                                        <Bell size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-slate-800">Partner Alerts</h4>
                                            <button
                                                onClick={togglePartnerAlert}
                                                className={`w-12 h-7 rounded-full transition-colors relative ${partnerAlert ? 'bg-primary' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${partnerAlert ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            Automatically notify your registered partner on WhatsApp when you trigger a high-stress alert.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wearables */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Devices</h3>
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                                        <Watch size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800">Smart Wearable</h4>
                                        <p className="text-sm text-slate-500">Sync heart rate & sleep data</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleWearable}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${wearableConnected
                                        ? 'bg-green-50 text-green-600 border border-green-200'
                                        : 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                        }`}
                                >
                                    {wearableConnected ? (
                                        <>
                                            <Check size={18} /> Connected to Apple Watch
                                        </>
                                    ) : (
                                        'Connect Device'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Privacy & Legal */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Legal</h3>
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Shield size={20} className="text-slate-400" />
                                        <span className="font-medium text-slate-700">Privacy Policy</span>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300" />
                                </button>
                                <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                        <span className="font-medium text-slate-700">Data Sharing Settings</span>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300" />
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-300">MyStree Soul v1.0.0 (MVP)</p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SettingsModal;
