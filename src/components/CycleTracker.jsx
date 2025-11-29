import React from 'react';
import { motion } from 'framer-motion';

const CycleTracker = ({ day }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const progress = (day / 28) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            {/* Background Circle */}
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#F1F5F9"
                    strokeWidth="12"
                    fill="transparent"
                />
                {/* Progress Circle */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00897B" />
                        <stop offset="100%" stopColor="#2DD4BF" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center Content */}
            <div className="absolute flex flex-col items-center">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Day</span>
                <span className="text-4xl font-bold text-slate-800">{day}</span>
                <span className="text-xs text-slate-400">of 28</span>
            </div>
        </div>
    );
};

export default CycleTracker;
