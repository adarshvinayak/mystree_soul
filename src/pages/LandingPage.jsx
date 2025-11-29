import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Stethoscope, ChevronRight } from 'lucide-react';
import { PATIENTS } from '../data/simulated_database';

const LandingPage = ({ onLogin }) => {
    const [showPatientSelect, setShowPatientSelect] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex flex-col items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-bold text-primary mb-2 tracking-tight">MyStree Soul</h1>
                <p className="text-slate-500 text-lg">Women's Health Triage & Support</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                {/* Patient Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer border border-slate-100 relative overflow-hidden group"
                    onClick={() => setShowPatientSelect(true)}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 text-primary">
                            <User size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Patient App</h2>
                        <p className="text-slate-500 mb-6">Access your health companion and triage support.</p>
                        <div className="flex items-center text-primary font-semibold">
                            Launch Simulator <ChevronRight size={20} className="ml-1" />
                        </div>
                    </div>
                </motion.div>

                {/* Doctor Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer border border-slate-100 relative overflow-hidden group"
                    onClick={() => onLogin('doctor', null)}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                            <Stethoscope size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Doctor Portal</h2>
                        <p className="text-slate-500 mb-6">Review cases, diagnostics, and approve reports.</p>
                        <div className="flex items-center text-blue-600 font-semibold">
                            Enter Dashboard <ChevronRight size={20} className="ml-1" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Patient Selection Modal */}
            {showPatientSelect && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPatientSelect(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Select Persona</h3>
                        <div className="space-y-4">
                            {PATIENTS.map((patient) => (
                                <div
                                    key={patient.id}
                                    onClick={() => onLogin('patient', patient)}
                                    className="flex items-center p-4 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                                >
                                    <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                                    <div>
                                        <h4 className="font-bold text-slate-800">{patient.name}</h4>
                                        <p className="text-sm text-slate-500">{patient.caseType} Case • Age {patient.age}</p>
                                    </div>
                                    <ChevronRight size={20} className="ml-auto text-slate-400" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
