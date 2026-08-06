import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export const DateTimeDisplay: React.FC<{ className?: string }> = ({ className }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 text-slate-400 font-medium ${className}`}
    >
      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-lg">
        <Calendar size={14} className="text-[#3B82F6]" />
        <span className="text-[11px] uppercase tracking-wider whitespace-nowrap">
          {formatDate(now)}
        </span>
      </div>
      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-lg min-w-[100px] justify-center">
        <Clock size={14} className="text-[#3B82F6]" />
        <span className="text-[11px] font-mono tracking-widest text-[#3B82F6] font-bold">
          {formatTime(now)}
        </span>
      </div>
    </motion.div>
  );
};
