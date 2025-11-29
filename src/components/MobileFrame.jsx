import React from 'react';
import { motion } from 'framer-motion';

const MobileFrame = ({ children }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-[393px] h-[852px] bg-black rounded-[55px] shadow-2xl overflow-hidden border-[8px] border-slate-900 ring-4 ring-slate-300/50"
            >
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-b-[20px] z-50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-800 mr-2"></div>
                    <div className="w-16 h-16 rounded-full bg-transparent"></div>
                </div>

                {/* Screen Content */}
                <div className="w-full h-full bg-white overflow-hidden rounded-[48px] pt-10 pb-8 relative">
                    {/* Status Bar Time (Simulated) */}
                    <div className="absolute top-3 left-8 text-white text-xs font-medium z-40">
                        9:41
                    </div>
                    {/* Status Bar Icons (Simulated) */}
                    <div className="absolute top-3 right-8 flex gap-1 z-40">
                        <div className="w-4 h-3 bg-white rounded-sm"></div>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>

                    {children}

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[140px] h-[5px] bg-black/20 rounded-full z-50"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default MobileFrame;
