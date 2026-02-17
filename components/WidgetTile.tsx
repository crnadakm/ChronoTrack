
import React, { useState, useEffect } from 'react';
import { TimeCounter } from '../types';
import { calculateTimeElapsed, formatTimeDisplay, getRelativeColor } from '../utils/time';
import { GripVertical } from 'lucide-react';

interface WidgetTileProps {
  counter: TimeCounter;
  onClick: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isDragging: boolean;
}

const WidgetTile: React.FC<WidgetTileProps> = ({ 
  counter, 
  onClick, 
  onDragStart, 
  onDragOver, 
  onDrop,
  isDragging 
}) => {
  const [elapsed, setElapsed] = useState(calculateTimeElapsed(counter.startDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(calculateTimeElapsed(counter.startDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [counter.startDate]);

  const hasImage = !!counter.backgroundImage;

  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      style={hasImage ? { backgroundImage: `url(${counter.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      className={`aspect-square rounded-[2rem] p-5 flex flex-col justify-between shadow-lg cursor-pointer transition-all active:scale-95 ${
        isDragging ? 'opacity-30 scale-90 grayscale shadow-none' : 'opacity-100 scale-100 shadow-lg active:brightness-90'
      } ${!hasImage ? getRelativeColor(counter.color) : ''} text-white relative overflow-hidden group`}
    >
      {/* Visual Indicator for dragging possibility */}
      <div className="absolute top-4 right-4 text-white/20 group-hover:text-white/40 transition-colors">
        <GripVertical size={16} />
      </div>

      {/* Overlay for image backgrounds to ensure text readability */}
      {hasImage && <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>}
      
      {/* Decorative inner circles (only for solid colors for cleaner look on images) */}
      {!hasImage && (
        <>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/5 rounded-full"></div>
        </>
      )}
      
      <div className="relative z-10">
        <h3 className="text-sm font-black opacity-90 truncate leading-tight tracking-tight uppercase drop-shadow-sm pr-6">
          {counter.name}
        </h3>
        <div className="w-6 h-1 bg-white/30 rounded-full mt-1"></div>
      </div>
      
      <div className="mt-auto relative z-10">
        <div className="text-2xl font-black tracking-tighter leading-none break-all font-mono drop-shadow-md">
          {formatTimeDisplay(elapsed, counter.displayFormat)}
        </div>
        <div className="text-[9px] uppercase font-black opacity-60 mt-1 tracking-widest">Time Elapsed</div>
      </div>
    </div>
  );
};

export default WidgetTile;
