import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, FileText, Bell, Search,
    CheckCircle, XCircle, Video, MessageSquare, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { useStore, getPatientDetails } from '../data/simulated_database';
import clsx from 'clsx';

const DoctorDashboard = () => {
    const { cases, patients, updateCaseStatus, updateCase } = useStore();
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [isEditingAssessment, setIsEditingAssessment] = useState(false);
    const [assessmentText, setAssessmentText] = useState('');
    const [showPatientDetails, setShowPatientDetails] = useState(false);
    const [patientDetails, setPatientDetails] = useState(null);

    // Only show cases that have been approved by user (not ANALYZING)
    const visibleCases = cases.filter(c => ['PENDING_REVIEW', 'APPROVED', 'REJECTED'].includes(c.status));

    // Auto-select first pending case (only from visible cases)
    useEffect(() => {
        if (!selectedCaseId && visibleCases.length > 0) {
            setSelectedCaseId(visibleCases[0].id);
        }
    }, [visibleCases, selectedCaseId]);

    const selectedCase = visibleCases.find(c => c.id === selectedCaseId);
    const selectedPatient = patients.find(p => p.id === selectedCase?.patientId);

    useEffect(() => {
        if (selectedCase) {
            setAssessmentText(selectedCase.aiAssessment || "Visual analysis detects irregular borders and inflammation consistent with acute dermatitis or fungal infection.");

            // Load patient details from SQLite
            const details = getPatientDetails(selectedCase.patientId);
            setPatientDetails(details);
        }
    }, [selectedCase]);

    const getRiskColor = (level) => {
        switch (level) {
            case 'HIGH': return 'text-red-500 bg-red-50 border-red-100';
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-50 border-yellow-100';
            case 'LOW': return 'text-green-500 bg-green-50 border-green-100';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };

    const handleDowngradeRisk = () => {
        if (!selectedCase) return;
        const currentRisk = selectedCase.riskLevel || 'MEDIUM';
        let newRisk;
        if (currentRisk === 'HIGH') newRisk = 'MEDIUM';
        else if (currentRisk === 'MEDIUM') newRisk = 'LOW';
        else return;
        updateCase(selectedCase.id, { riskLevel: newRisk });
    };

    const handleUpgradeRisk = () => {
        if (!selectedCase) return;
        const currentRisk = selectedCase.riskLevel || 'MEDIUM';
        let newRisk;
        if (currentRisk === 'LOW') newRisk = 'MEDIUM';
        else if (currentRisk === 'MEDIUM') newRisk = 'HIGH';
        else return;
        updateCase(selectedCase.id, { riskLevel: newRisk });
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <span className="font-bold text-slate-800 text-lg">MyStree Soul</span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <NavItem icon={<Users size={20} />} label="Patients" />
                    <NavItem icon={<FileText size={20} />} label="Reports" />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Dr. Sharma" className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="text-sm font-bold text-slate-800">Dr. A. Sharma</p>
                            <p className="text-xs text-slate-500">Dermatologist</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4 text-slate-400 bg-slate-100 px-4 py-2 rounded-lg w-96">
                        <Search size={20} />
                        <input type="text" placeholder="Search patients, cases..." className="bg-transparent border-none focus:outline-none text-slate-800 w-full" />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 p-8 flex gap-8 overflow-hidden">
                    {/* Case List */}
                    <div className="w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Incoming Cases</h2>
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                                {visibleCases.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {visibleCases.map(c => {
                                const p = patients.find(pat => pat.id === c.patientId);
                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => setSelectedCaseId(c.id)}
                                        className={clsx(
                                            "p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors relative",
                                            selectedCaseId === c.id ? "bg-teal-50/50 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <img src={p?.avatar} alt={p?.name} className="w-12 h-12 rounded-full object-cover" />
                                                {c.riskLevel === 'HIGH' && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-slate-800 truncate">{p?.name}</h3>
                                                    <span className="text-xs text-slate-400">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 truncate">{p?.symptoms}</p>
                                                <div className="mt-2 flex gap-2">
                                                    <span className={clsx("text-[10px] px-2 py-0.5 rounded-full border font-medium", getRiskColor(c.riskLevel))}>
                                                        {c.riskLevel} RISK
                                                    </span>
                                                    <span className={clsx("text-[10px] px-2 py-0.5 rounded-full border font-medium",
                                                        c.status === 'APPROVED' ? 'text-green-600 bg-green-50 border-green-100' : 'text-slate-500 bg-slate-100 border-slate-200'
                                                    )}>
                                                        {c.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Case Detail */}
                    {selectedCase && selectedPatient ? (
                        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                            {/* Patient Header */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <img src={selectedPatient.avatar} alt={selectedPatient.name} className="w-16 h-16 rounded-2xl object-cover" />
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">{selectedPatient.name}</h2>
                                        <p className="text-slate-500">Age {selectedPatient.age} • Cycle Day {selectedPatient.cycleDay}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
                                        <Video size={18} /> Video Call
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
                                        <MessageSquare size={18} /> Message
                                    </button>
                                </div>
                            </div>

                            {/* Patient Details - Collapsible */}
                            {patientDetails && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <button
                                        onClick={() => setShowPatientDetails(!showPatientDetails)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                    >
                                        <h3 className="font-bold text-slate-800">Patient Details</h3>
                                        {showPatientDetails ? (
                                            <ChevronUp size={20} className="text-slate-400" />
                                        ) : (
                                            <ChevronDown size={20} className="text-slate-400" />
                                        )}
                                    </button>
                                    {showPatientDetails && (
                                        <div className="p-6 border-t border-slate-100">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-500 font-medium">ID:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.ID}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Name:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Age:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Age}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Role:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Role}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Blood Pressure:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.BP}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Heart Rate:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Heart_Rate} bpm</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Temperature:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Temperature_F}°F</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">SpO2:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.SpO2_Percent}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Weight:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Weight_KG} kg</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Activity Level:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Activity_Level}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Stress Index:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Stress_Index}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Avg Sleep:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Avg_Sleep}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-slate-500 font-medium">Dietary Note:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Dietary_Note}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Cycle Status:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Cycle_Status}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Active Complaint:</span>
                                                    <span className="ml-2 text-slate-800">{patientDetails.Active_Complaint}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">AI Risk Score:</span>
                                                    <span className={clsx(
                                                        "ml-2 font-bold",
                                                        patientDetails.AI_Risk_Score?.includes('RED') ? 'text-red-600' :
                                                            patientDetails.AI_Risk_Score?.includes('YELLOW') ? 'text-yellow-600' :
                                                                'text-green-600'
                                                    )}>
                                                        {patientDetails.AI_Risk_Score}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">Partner Alert:</span>
                                                    <span className={clsx(
                                                        "ml-2",
                                                        patientDetails.Partner_Alert_Enabled ? 'text-green-600 font-bold' : 'text-slate-400'
                                                    )}>
                                                        {patientDetails.Partner_Alert_Enabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex-1 flex gap-6 min-h-0">
                                {/* Chat History */}
                                <div className="w-1/2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 font-bold text-slate-700">Chat History</div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                                        {selectedCase.chatHistory.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-white border border-slate-200 text-slate-700'
                                                    }`}>
                                                    {msg.text}
                                                    {msg.imageUrl && <img src={msg.imageUrl} alt="Attachment" className="mt-2 rounded-lg blur-md" style={{ filter: 'blur(8px)' }} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Clinical Decision Support */}
                                <div className="w-1/2 flex flex-col gap-6 overflow-y-auto">
                                    {/* AI Assessment */}
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-primary font-bold">
                                                <AlertTriangle size={20} />
                                                <h3>AI Risk Assessment</h3>
                                            </div>
                                            <button
                                                onClick={() => setIsEditingAssessment(!isEditingAssessment)}
                                                className="text-xs text-primary font-bold hover:underline"
                                            >
                                                {isEditingAssessment ? 'Cancel' : 'Edit'}
                                            </button>
                                        </div>

                                        <div className={clsx(
                                            "p-4 rounded-xl mb-4 border",
                                            selectedCase.riskLevel === 'HIGH' ? 'bg-red-50 border-red-100' :
                                                selectedCase.riskLevel === 'MEDIUM' ? 'bg-yellow-50 border-yellow-100' :
                                                    'bg-green-50 border-green-100'
                                        )}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={clsx(
                                                    "font-bold",
                                                    selectedCase.riskLevel === 'HIGH' ? 'text-red-700' :
                                                        selectedCase.riskLevel === 'MEDIUM' ? 'text-yellow-700' :
                                                            'text-green-700'
                                                )}>
                                                    {selectedCase.riskLevel === 'HIGH' ? 'High Probability of Infection' :
                                                        selectedCase.riskLevel === 'MEDIUM' ? 'Moderate Risk - Review Recommended' :
                                                            'Low Risk - Monitor'}
                                                </span>
                                                <span className={clsx(
                                                    "text-xs font-bold px-2 py-1 rounded",
                                                    selectedCase.riskLevel === 'HIGH' ? 'bg-red-200 text-red-800' :
                                                        selectedCase.riskLevel === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                                                            'bg-green-200 text-green-800'
                                                )}>
                                                    {selectedCase.riskLevel === 'HIGH' ? '92% Confidence' :
                                                        selectedCase.riskLevel === 'MEDIUM' ? '75% Confidence' :
                                                            '60% Confidence'}
                                                </span>
                                            </div>
                                            {isEditingAssessment ? (
                                                <div className="flex flex-col gap-2">
                                                    <textarea
                                                        value={assessmentText}
                                                        onChange={(e) => setAssessmentText(e.target.value)}
                                                        className={clsx(
                                                            "w-full p-2 text-sm text-slate-700 border rounded-lg focus:outline-none focus:ring-2 bg-white",
                                                            selectedCase.riskLevel === 'HIGH' ? 'border-red-200 focus:ring-red-200' :
                                                                selectedCase.riskLevel === 'MEDIUM' ? 'border-yellow-200 focus:ring-yellow-200' :
                                                                    'border-green-200 focus:ring-green-200'
                                                        )}
                                                        rows={4}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            updateCase(selectedCase.id, { aiAssessment: assessmentText });
                                                            setIsEditingAssessment(false);
                                                        }}
                                                        className={clsx(
                                                            "self-end px-3 py-1 text-white text-xs font-bold rounded-lg",
                                                            selectedCase.riskLevel === 'HIGH' ? 'bg-red-600 hover:bg-red-700' :
                                                                selectedCase.riskLevel === 'MEDIUM' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                                                    'bg-green-600 hover:bg-green-700'
                                                        )}
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className={clsx(
                                                    "text-sm",
                                                    selectedCase.riskLevel === 'HIGH' ? 'text-red-600' :
                                                        selectedCase.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                                                            'text-green-600'
                                                )}>
                                                    {selectedCase.aiAssessment || "Visual analysis detects irregular borders and inflammation consistent with acute dermatitis or fungal infection."}
                                                </p>
                                            )}
                                        </div>

                                        <h4 className="font-bold text-slate-700 mb-2 text-sm">Recommended Actions</h4>
                                        <ul className="space-y-2 mb-6">
                                            <li className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle size={16} className="text-green-500" /> Prescribe topical antifungal
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle size={16} className="text-green-500" /> Schedule follow-up in 3 days
                                            </li>
                                        </ul>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => updateCaseStatus(selectedCase.id, 'APPROVED')}
                                                disabled={selectedCase.status === 'APPROVED'}
                                                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-200/50"
                                            >
                                                {selectedCase.status === 'APPROVED' ? 'Approved' : 'Approve Diagnosis'}
                                            </button>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={handleUpgradeRisk}
                                                    disabled={selectedCase.riskLevel === 'HIGH' || selectedCase.status === 'APPROVED'}
                                                    className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-l-xl font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    title="Upgrade Risk"
                                                >
                                                    <ChevronUp size={18} />
                                                </button>
                                                <button
                                                    onClick={handleDowngradeRisk}
                                                    disabled={selectedCase.riskLevel === 'LOW' || selectedCase.status === 'APPROVED'}
                                                    className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-r-xl font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    title="Downgrade Risk"
                                                >
                                                    <ChevronDown size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            Select a case to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ icon, label, active }) => (
    <div className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors",
        active ? "bg-teal-50 text-primary font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    )}>
        {icon}
        <span>{label}</span>
    </div>
);

export default DoctorDashboard;
