import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Image as ImageIcon, MoreVertical, Phone } from 'lucide-react';
import { useStore } from '../data/simulated_database';

const ChatInterface = ({ patient }) => {
    const { cases, updateCaseStatus, addMessageToCase, createCase, updateCase } = useStore();
    // Only find cases that are still being analyzed (not yet sent to doctor)
    const currentCase = cases.find(c => c.patientId === patient.id && c.status === 'ANALYZING');

    // Initialize messages from store or default
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (currentCase?.chatHistory && currentCase.chatHistory.length > 0) {
            setMessages(currentCase.chatHistory);
        } else {
            setMessages([{ id: 1, sender: 'bot', text: `Good Morning, ${patient.name}. How are you feeling today?` }]);
        }
    }, [currentCase?.id, patient.name]); // Only reset if patient/case changes

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const messagesEndRef = useRef(null);

    // Generate bot response based on patient type and conversation state
    const generateBotResponse = (userMessage, messageCount, activeCaseId) => {
        let botResponse = '';
        let isAssessmentComplete = false;
        let finalStatus = 'ANALYZING';
        let needsConfirmation = false;

        const lastBotMsg = messages.filter(m => m.sender === 'bot').pop();
        if (lastBotMsg?.needsConfirmation) {
            if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('sure') || userMessage.toLowerCase().includes('ok') || userMessage.toLowerCase().includes('send')) {
                botResponse = "Understood. I've forwarded your case to Dr. Sharma. You should hear back shortly.";
                finalStatus = 'PENDING_REVIEW';
                isAssessmentComplete = true;

                if (activeCaseId) {
                    const storedCases = JSON.parse(localStorage.getItem('mystree_cases') || '[]');
                    const currentCaseData = storedCases.find(c => c.id === activeCaseId);

                    const assessmentText = currentCaseData?.aiAssessment ||
                        (patient.caseType === 'RED'
                            ? "Visual analysis detects irregular borders and inflammation consistent with acute dermatitis or fungal infection."
                            : "Patient reported symptoms that may require medical attention. Further evaluation recommended.");

                    const riskLevel = currentCaseData?.riskLevel ||
                        (patient.caseType === 'RED' ? 'HIGH' : patient.caseType === 'YELLOW' ? 'MEDIUM' : 'LOW');

                    updateCase(activeCaseId, {
                        aiAssessment: assessmentText,
                        riskLevel: riskLevel
                    });
                }
            } else {
                botResponse = "Okay, I won't send it to the doctor. Let me know if you change your mind or if symptoms worsen.";
                finalStatus = 'RESOLVED';
                isAssessmentComplete = true;
            }
        } else if (patient.caseType === 'RED' && messageCount < 3) {
            botResponse = "I understand. Could you please upload a photo of the affected area for a better assessment?";
        } else if (patient.caseType === 'RED' && messageCount >= 3) {
            botResponse = "I've identified this as a high-priority case that may require urgent medical attention. Would you like me to send this to Dr. Sharma for an urgent review?";
            needsConfirmation = true;
            isAssessmentComplete = false;

            if (activeCaseId) {
                updateCase(activeCaseId, {
                    aiAssessment: "Visual analysis detects irregular borders and inflammation consistent with acute dermatitis or fungal infection. High probability of infection requiring immediate medical attention.",
                    riskLevel: 'HIGH'
                });
            }
        } else if (patient.caseType === 'YELLOW' && messageCount < 3) {
            botResponse = "I see. Have you noticed any other symptoms accompanying this?";
        } else if (patient.caseType === 'YELLOW' && messageCount >= 3) {
            botResponse = "Based on your symptoms, I think it would be good to have a doctor review your case. Would you like me to send this to Dr. Sharma for review?";
            needsConfirmation = true;
            isAssessmentComplete = false;

            if (activeCaseId) {
                updateCase(activeCaseId, {
                    aiAssessment: "Patient reported symptoms that may require medical attention. Further evaluation recommended.",
                    riskLevel: 'MEDIUM'
                });
            }
        } else if (patient.caseType === 'GREEN') {
            botResponse = "That sounds normal. Keep monitoring it, and let me know if anything changes. You're doing great!";
            isAssessmentComplete = true;
            finalStatus = 'RESOLVED';
        } else if (patient.caseType === 'PARTNER_ALERT') {
            const isAlertEnabled = patient.settings?.partnerAlert ?? true;

            if (isAlertEnabled) {
                botResponse = "I've sent a support alert to your partner as requested. They should be reaching out soon.";
                window.dispatchEvent(new CustomEvent('mystree-toast', {
                    detail: { message: `Partner Alert Sent to WhatsApp: ${patient.name} needs support.` }
                }));
            } else {
                botResponse = "I notice you're going through a tough time. I haven't sent an alert to your partner since the setting is off, but I'm here for you.";
            }
            isAssessmentComplete = true;
            finalStatus = 'RESOLVED';
        } else {
            botResponse = "Based on what you've told me, I think it would be good to have a doctor review your case. Would you like me to send this to Dr. Sharma for review?";
            needsConfirmation = true;
            isAssessmentComplete = false;
        }

        return { botResponse, isAssessmentComplete, finalStatus, needsConfirmation };
    };

    // Get suggested responses based on last bot message
    const getSuggestedResponses = () => {
        const lastBotMsg = messages.filter(m => m.sender === 'bot').pop();
        if (!lastBotMsg) return [];

        const botText = lastBotMsg.text.toLowerCase();
        
        // Initial greeting responses
        if (botText.includes('how are you feeling')) {
            if (patient.caseType === 'RED') {
                return [
                    "I have a painful lesion on my leg",
                    "There's a rapidly growing sore on my leg",
                    "I'm worried about a skin issue"
                ];
            } else if (patient.caseType === 'YELLOW') {
                return [
                    "I noticed a small bump in my genital area",
                    "I'm worried about a bump I found",
                    "I have a concern about my health"
                ];
            } else if (patient.caseType === 'GREEN') {
                return [
                    "I'm doing well, just checking in",
                    "Everything seems normal",
                    "Just a general question"
                ];
            } else if (patient.caseType === 'PARTNER_ALERT') {
                return [
                    "I'm feeling really down today",
                    "I need emotional support",
                    "I'm going through a tough time"
                ];
            }
        }
        
        // Photo upload request responses
        if (botText.includes('upload a photo') || botText.includes('photo')) {
            return [
                "I'll upload a photo",
                "Let me take a picture",
                "Sure, I'll send a photo"
            ];
        }
        
        // Other symptoms question responses
        if (botText.includes('other symptoms') || botText.includes('noticed any other')) {
            return [
                "No, that's the main issue",
                "Yes, I've been feeling tired too",
                "Just some mild discomfort"
            ];
        }
        
        // Consent request responses (approve)
        if (botText.includes('send this to dr') || botText.includes('doctor') || botText.includes('review')) {
            return [
                "Yes, please send it",
                "Sure, send it to the doctor",
                "Yes, I'd like a review",
                "Yes, send it"
            ];
        }
        
        // Consent request responses (decline) - show these as well
        if (botText.includes('would you like') && (botText.includes('send') || botText.includes('doctor'))) {
            return [
                "Yes, please send it",
                "No, not right now",
                "Maybe later"
            ];
        }
        
        return [];
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Listen for report approval
    useEffect(() => {
        if (currentCase?.status === 'APPROVED') {
            setShowReport(true);
            // Trigger a toast notification for the user
            window.dispatchEvent(new CustomEvent('mystree-toast', {
                detail: { message: 'Dr. Sharma has approved your diagnosis.' }
            }));
        }
    }, [currentCase?.status]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const newMsg = { id: Date.now(), sender: 'user', text: inputText };
        setMessages(prev => [...prev, newMsg]);

        let activeCaseId;
        if (currentCase) {
            addMessageToCase(currentCase.id, newMsg);
            activeCaseId = currentCase.id;
        } else {
            // Create case with ANALYZING status so it's hidden from doctor
            const newCase = createCase(patient.id, newMsg, 'ANALYZING');
            activeCaseId = newCase.id;
        }

        setInputText('');
        setIsTyping(true);

        // Simulated Bot Logic
        setTimeout(() => {
            const updatedMessages = [...messages, newMsg];
            const response = generateBotResponse(inputText, updatedMessages.length, activeCaseId);

            const botMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: response.botResponse,
                needsConfirmation: response.needsConfirmation
            };
            setMessages(prev => [...prev, botMsg]);

            if (activeCaseId) {
                addMessageToCase(activeCaseId, botMsg);
                if (response.isAssessmentComplete) {
                    updateCaseStatus(activeCaseId, response.finalStatus);
                }
            }
            setIsTyping(false);
        }, 1500);
    };

    const handleImageUpload = () => {
        const newMsg = {
            id: Date.now(),
            sender: 'user',
            text: 'Uploaded an image',
            isImage: true,
            imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300'
        };
        setMessages(prev => [...prev, newMsg]);

        let activeCaseId;
        if (currentCase) {
            addMessageToCase(currentCase.id, newMsg);
            activeCaseId = currentCase.id;
        } else {
            const newCase = createCase(patient.id, newMsg, 'ANALYZING');
            activeCaseId = newCase.id;
        }

        setIsTyping(true);

        setTimeout(() => {
            const analyzingMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: "Analyzing image..."
            };
            setMessages(prev => [...prev, analyzingMsg]);
            if (activeCaseId) addMessageToCase(activeCaseId, analyzingMsg);

            setTimeout(() => {
                let riskMsgText = "";
                let finalStatus = 'ANALYZING'; // Keep as ANALYZING until user confirms
                let needsConfirmation = false;

                if (patient.caseType === 'RED') {
                    // RED case: Ask for consent before sending to doctor
                    riskMsgText = "Based on the visual analysis, this looks like a potential infection. Would you like me to send this to Dr. Sharma for an urgent review?";
                    needsConfirmation = true;
                } else if (patient.caseType === 'YELLOW') {
                    // YELLOW case: Ask for consent before sending to doctor
                    riskMsgText = "I see some signs that might need attention. Would you like a doctor to take a look?";
                    needsConfirmation = true;
                } else {
                    riskMsgText = "Thanks for the photo. It looks stable. Keep monitoring it and let me know if anything changes.";
                    finalStatus = 'RESOLVED';
                }

                const riskMsg = {
                    id: Date.now() + 2,
                    sender: 'bot',
                    text: riskMsgText,
                    needsConfirmation: needsConfirmation
                };
                setMessages(prev => [...prev, riskMsg]);
                if (activeCaseId) {
                    addMessageToCase(activeCaseId, riskMsg);

                    // Save the AI assessment text to the case (but don't send to doctor yet)
                    // Only update assessment, keep status as ANALYZING until user confirms
                    const assessmentText = patient.caseType === 'RED'
                        ? "Visual analysis detects irregular borders and inflammation consistent with acute dermatitis or fungal infection. High probability of infection requiring immediate medical attention."
                        : patient.caseType === 'YELLOW'
                            ? "Visual analysis shows some signs that may require medical attention. Further evaluation recommended."
                            : riskMsgText;

                    updateCase(activeCaseId, {
                        aiAssessment: assessmentText,
                        riskLevel: patient.caseType === 'RED' ? 'HIGH' : patient.caseType === 'YELLOW' ? 'MEDIUM' : 'LOW'
                    });

                    // If no confirmation needed (Green), resolve it. If confirmation needed, keep as ANALYZING until user confirms.
                    if (!needsConfirmation) {
                        updateCaseStatus(activeCaseId, finalStatus);
                    }
                }
                setIsTyping(false);
            }, 2000);
        }, 1000);
    };

    if (showReport) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Letterhead Header */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">M</div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">MyStree Soul</h2>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Medical Center</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800">Dr. A. Sharma</p>
                            <p className="text-xs text-slate-500">Dermatologist • Reg: 45892</p>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="p-8 overflow-y-auto flex-1 font-serif">
                        <div className="flex justify-between text-sm text-slate-600 mb-8 border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1">Patient</span>
                                <span className="font-bold text-slate-800 text-base">{patient.name}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1">Date</span>
                                <span className="font-bold text-slate-800 text-base">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider text-primary">Diagnosis & Assessment</h3>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 leading-relaxed">
                                {currentCase?.aiAssessment || "Assessment pending..."}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider text-primary">Prescriptions</h3>
                            <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                <li>Clotrimazole Cream 1% - Apply twice daily for 7 days</li>
                                <li>Cetirizine 10mg - Once daily at night for 3 days (for itching)</li>
                            </ul>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider text-primary">Next Steps</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-slate-700">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                                    <span>Keep the area dry and clean. Avoid tight clothing.</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-700">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                                    <span>Follow up in 3 days if symptoms persist.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-12 flex justify-end">
                            <div className="text-center">
                                <div className="font-cursive text-2xl text-primary mb-2" style={{ fontFamily: 'cursive' }}>Dr. Sharma</div>
                                <div className="h-px bg-slate-300 w-32 mb-1"></div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Signature</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                        <button
                            className="text-slate-500 hover:text-slate-800 text-sm font-medium px-4 py-2"
                            onClick={() => {/* Print logic could go here */ }}
                        >
                            Download PDF
                        </button>
                        <button
                            onClick={() => setShowReport(false)}
                            className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200/50"
                        >
                            Back to Chat
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold mr-3">
                        S
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Soul AI</h3>
                        <p className="text-xs text-green-500 font-medium">Online</p>
                    </div>
                </div>
                <div className="flex gap-4 text-primary">
                    <Phone size={20} />
                    <MoreVertical size={20} />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user'
                            ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-teal-100'
                            : 'bg-white text-slate-700 rounded-tl-none shadow-sm border border-slate-100'
                            }`}>
                            {msg.isImage ? (
                                <img src={msg.imageUrl} alt="Uploaded" className="rounded-lg mb-2" />
                            ) : (
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            )}
                            <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-teal-100' : 'text-slate-400'}`}>
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                            <div className="flex gap-1">
                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-slate-400 rounded-full"></motion.div>
                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-2 h-2 bg-slate-400 rounded-full"></motion.div>
                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-slate-400 rounded-full"></motion.div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Responses */}
            {!isTyping && getSuggestedResponses().length > 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {getSuggestedResponses().map((response, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                // Set the text and send immediately
                                const newMsg = { id: Date.now(), sender: 'user', text: response };
                                setMessages(prev => [...prev, newMsg]);

                                let activeCaseId;
                                if (currentCase) {
                                    addMessageToCase(currentCase.id, newMsg);
                                    activeCaseId = currentCase.id;
                                } else {
                                    const newCase = createCase(patient.id, newMsg, 'ANALYZING');
                                    activeCaseId = newCase.id;
                                }

                                setIsTyping(true);

                                // Use the same bot logic as handleSend
                                setTimeout(() => {
                                    const updatedMessages = [...messages, newMsg];
                                    const botResponse = generateBotResponse(response, updatedMessages.length, activeCaseId);

                                    const botMsg = {
                                        id: Date.now() + 1,
                                        sender: 'bot',
                                        text: botResponse.botResponse,
                                        needsConfirmation: botResponse.needsConfirmation
                                    };
                                    setMessages(prev => [...prev, botMsg]);

                                    if (activeCaseId) {
                                        addMessageToCase(activeCaseId, botMsg);
                                        if (botResponse.isAssessmentComplete) {
                                            updateCaseStatus(activeCaseId, botResponse.finalStatus);
                                        }
                                    }
                                    setIsTyping(false);
                                }, 1500);
                            }}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50 hover:border-primary transition-colors shadow-sm"
                        >
                            {response}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                {/* Reset Chat Option */}
                {(currentCase?.status === 'PENDING_REVIEW' || currentCase?.status === 'RESOLVED') && (
                    <div className="flex justify-center mb-3">
                        <button
                            onClick={() => {
                                // Reset local state to start fresh
                                setMessages([{ id: Date.now(), sender: 'bot', text: `Hi ${patient.name}, how can I help you now?` }]);
                                // We don't clear the currentCase from store immediately, 
                                // but the handleSend logic creates a new case if the current one isn't ANALYZING
                                // However, we need to make sure the UI knows we are starting fresh.
                                // The easiest way is to just let the user type, and handleSend will create a new case
                                // because we filter for 'ANALYZING' status in the component mount.
                                // But since 'currentCase' variable is derived from store, we need to force a refresh or ignore it.

                                // Actually, since we filter `currentCase` by `status === 'ANALYZING'`, 
                                // if the status is PENDING_REVIEW or RESOLVED, `currentCase` will be undefined on next render/check.
                                // So simply clearing messages visually is enough for the user to feel it's a new chat.
                            }}
                            className="text-xs text-slate-400 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                        >
                            <MessageCircle size={12} /> Start New Chat
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={handleImageUpload} className="p-3 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-full transition-colors">
                        <Camera size={24} />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="w-full bg-slate-100 text-slate-800 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        className="p-3 bg-primary text-white rounded-full shadow-lg shadow-teal-200/50 hover:bg-teal-700 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
