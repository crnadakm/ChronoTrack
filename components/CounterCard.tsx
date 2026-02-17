
import React, { useState, useEffect } from 'react';
import { TimeCounter, DisplayFormat } from '../types';
import { calculateTimeElapsed, formatTimeDisplay, getRelativeColor } from '../utils/time';
import { Trash2, Calendar, Clock, LayoutGrid, LayoutList, Image as ImageIcon } from 'lucide-react';

interface CounterCardProps {
  counter: TimeCounter;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TimeCounter>) => void;
}

const CounterCard: React.FC<CounterCardProps> = ({ counter, onDelete, onUpdate }) => {
  const [elapsed, setElapsed] = useState(calculateTimeElapsed(counter.startDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(calculateTimeElapsed(counter.startDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [counter.startDate]);

  const formats: { value: DisplayFormat; label: string }[] = [
    { value: 'full', label: 'Puno' },
    { value: 'days', label: 'Dani' },
    { value: 'hm', label: 'H:M' },
  ];

  const startDateObj = new Date(counter.startDate);
  const hasImage = !!counter.backgroundImage;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4 transition-all hover:shadow-md overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {hasImage ? (
              <div 
                className="w-8 h-8 rounded-lg bg-cover bg-center border border-slate-200" 
                style={{ backgroundImage: `url(${counter.backgroundImage})` }}
              ></div>
          ) : (
              <div className={`w-3 h-3 rounded-full ${getRelativeColor(counter.color)} animate-pulse`}></div>
          )}
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{counter.name}</h3>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onUpdate(counter.id, { isWidget: !counter.isWidget })}
            className={`p-2 rounded-full transition-colors ${counter.isWidget ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
            title={counter.isWidget ? "Ukloni sa widgeta" : "Dodaj kao widget"}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => onDelete(counter.id)}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className={`rounded-xl p-4 mb-4 text-center relative overflow-hidden ${!hasImage ? 'bg-slate-50' : 'text-white'}`}
           style={hasImage ? { backgroundImage: `url(${counter.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        {hasImage && <div className="absolute inset-0 bg-black/40"></div>}
        <div className="text-3xl font-mono font-bold tracking-wider relative z-10 drop-shadow-sm">
          {formatTimeDisplay(elapsed, counter.displayFormat)}
        </div>
        <div className="flex justify-center gap-2 mt-3 relative z-10">
            {formats.map((f) => (
                <button
                    key={f.value}
                    onClick={() => onUpdate(counter.id, { displayFormat: f.value })}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${
                        counter.displayFormat === f.value 
                        ? (hasImage ? 'bg-white text-slate-900' : 'bg-slate-900 text-white') 
                        : (hasImage ? 'bg-black/30 text-white hover:bg-black/50' : 'bg-slate-200 text-slate-500 hover:bg-slate-300')
                    }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg">
          <Calendar size={14} className="text-slate-400" />
          <span>{startDateObj.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg">
          <Clock size={14} className="text-slate-400" />
          <span>{startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

export default CounterCard;
