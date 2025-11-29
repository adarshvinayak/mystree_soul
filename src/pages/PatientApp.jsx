import React, { useState } from 'react';
import MobileFrame from '../components/MobileFrame';
import ChatInterface from '../components/ChatInterface';
import CycleTracker from '../components/CycleTracker';
import SettingsModal from '../components/SettingsModal';
import { Home, MessageCircle, User, Calendar, Settings, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientApp = ({ patient, onSwitchPersona }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <MobileFrame>
            <div className="h-full flex flex-col bg-slate-50 relative">
                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    patient={patient}
                />

                {activeTab === 'home' && (
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Good Morning,</h1>
                                <p className="text-2xl font-light text-primary">{patient.name}</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onSwitchPersona}
                                className="relative group"
                            >
                                <img src={patient.avatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
                                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-[10px] text-white font-bold">SWITCH</span>
                                </div>
                            </motion.button>
                        </div>

                        {/* Cycle Tracker */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 mb-8 flex flex-col items-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-teal-200"></div>
                            <h3 className="text-slate-500 font-medium mb-4 self-start">Cycle Status</h3>
                            <CycleTracker day={patient.cycleDay} />
                            <p className="mt-4 text-sm text-slate-400 text-center">
                                {patient.cycleDay < 14 ? 'Follicular Phase' : 'Luteal Phase'} • High Energy
                            </p>

                            {/* Talk to Soul Button - Moved here */}
                            <div className="w-full mt-6 pt-6 border-t border-slate-100">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab('chat')}
                                    className="w-full bg-gradient-to-r from-teal-500 to-teal-400 text-white p-4 rounded-2xl font-bold shadow-lg shadow-teal-200/50 flex items-center justify-center gap-3"
                                >
                                    <MessageCircle size={24} />
                                    Talk to Soul
                                </motion.button>
                                <p className="text-xs text-slate-400 text-center mt-3 px-4 leading-relaxed">
                                    Whether you just need to vent or have a health concern, Soul is here to listen and help diagnose any issues.
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform cursor-pointer">
                                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                                    <Calendar size={20} />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Log Symptoms</span>
                            </div>
                            <div
                                onClick={() => setIsSettingsOpen(true)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                    <Settings size={20} />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Settings</span>
                            </div>
                        </div>

                        {/* Simulate Partner Alert */}
                        <div className="mb-8">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={async () => {
                                    // Get partner alert setting from localStorage
                                    const getStoredSettings = () => {
                                        try {
                                            const stored = localStorage.getItem(`mystree_patient_${patient.id}_settings`);
                                            return stored ? JSON.parse(stored) : {};
                                        } catch {
                                            return {};
                                        }
                                    };

                                    const storedSettings = getStoredSettings();
                                    const partnerAlertEnabled = storedSettings.partnerAlert ?? patient?.settings?.partnerAlert ?? (patient?.caseType === 'PARTNER_ALERT');

                                    if (!partnerAlertEnabled) {
                                        window.dispatchEvent(new CustomEvent('mystree-toast', {
                                            detail: { message: 'Turn on partner alert in settings' }
                                        }));
                                        return;
                                    }

                                    // Call webhook
                                    try {
                                        // Using no-cors to avoid CORS errors from browser
                                        // Note: This makes the response opaque, so we can't check status
                                        await fetch('https://n8n.yashrajpatil.in/webhook/946a3521-8199-4447-80f2-b202ac9f9194', {
                                            method: 'POST',
                                            mode: 'no-cors',
                                            headers: {
                                                'Content-Type': 'text/plain', // no-cors only supports simple headers
                                            },
                                            body: JSON.stringify({
                                                patientId: patient.id,
                                                patientName: patient.name,
                                                timestamp: new Date().toISOString()
                                            })
                                        });

                                        window.dispatchEvent(new CustomEvent('mystree-toast', {
                                            detail: { message: 'Partner notified' }
                                        }));
                                    } catch (error) {
                                        console.error('Error calling webhook:', error);
                                        window.dispatchEvent(new CustomEvent('mystree-toast', {
                                            detail: { message: 'Failed to notify partner. Please try again.' }
                                        }));
                                    }
                                }}
                                className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white p-4 rounded-2xl shadow-lg shadow-pink-200/50 flex flex-col items-center gap-2"
                            >
                                <div className="flex items-center gap-2">
                                    <Bell size={20} />
                                    <span className="font-bold">Simulate Partner Alert</span>
                                </div>
                                <p className="text-xs text-pink-100 text-center px-4">
                                    Based on your mood/cycle, automatic messages will be sent to your partner, keeping them aware of your state, fostering empathy and bonding
                                </p>
                            </motion.button>
                        </div>


                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="flex-1 flex flex-col h-full">
                        <ChatInterface patient={patient} />
                    </div>
                )}

                {/* Bottom Nav */}
                <div className="bg-white border-t border-slate-100 p-4 pb-8 flex justify-around items-center">
                    <NavIcon icon={<Home size={24} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <NavIcon icon={<Calendar size={24} />} />
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-200 -mt-8 border-4 border-slate-50">
                        <MessageCircle size={24} />
                    </div>
                    <NavIcon icon={<User size={24} />} onClick={() => setIsSettingsOpen(true)} />
                </div>
            </div>
        </MobileFrame>
    );
};

const NavIcon = ({ icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-xl transition-colors ${active ? 'text-primary bg-teal-50' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {icon}
    </button>
);

export default PatientApp;
