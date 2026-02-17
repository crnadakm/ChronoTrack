
import React, { useState, useRef } from 'react';
import { X, Check, Image as ImageIcon, Palette, Upload, Loader2, Link as LinkIcon } from 'lucide-react';
import { DisplayFormat } from '../types';

interface AddCounterModalProps {
  onClose: () => void;
  onAdd: (name: string, date: string, color: string, format: DisplayFormat, asWidget: boolean, bgImage?: string) => void;
}

const COLORS = ['blue', 'green', 'red', 'purple', 'orange', 'pink'];
const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', // Nature
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80', // Mountains
  'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=400&q=80', // Night sky
  'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=400&q=80', // Space
];

const AddCounterModal: React.FC<AddCounterModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [selectedColor, setSelectedColor] = useState('blue');
  const [format, setFormat] = useState<DisplayFormat>('full');
  const [asWidget, setAsWidget] = useState(true);
  const [bgType, setBgType] = useState<'color' | 'image'>('color');
  const [bgImage, setBgImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, date, selectedColor, format, asWidget, bgType === 'image' ? bgImage : undefined);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB to avoid localStorage issues)
    if (file.size > 2 * 1024 * 1024) {
      alert("Slika je prevelika. Molimo izaberite sliku manju od 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBgImage(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Greška pri učitavanju slike.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Novi Counter</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Naziv countera</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="npr. Putovanje u Pariz"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Format prikaza</label>
                    <select 
                        value={format}
                        onChange={(e) => setFormat(e.target.value as DisplayFormat)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="full">Pametni (Y/mo/d)</option>
                        <option value="days">Samo Dani</option>
                        <option value="hm">Samo H:M</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Prikaži kao Widget</label>
                    <button
                        type="button"
                        onClick={() => setAsWidget(!asWidget)}
                        className={`w-full py-3 px-4 rounded-xl border font-bold transition-all text-sm ${
                            asWidget 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                    >
                        {asWidget ? 'DA' : 'NE'}
                    </button>
                </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700">Izgled widgeta</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        type="button"
                        onClick={() => setBgType('color')}
                        className={`p-1.5 rounded-md transition-all ${bgType === 'color' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                    >
                        <Palette size={16} />
                    </button>
                    <button 
                        type="button"
                        onClick={() => setBgType('image')}
                        className={`p-1.5 rounded-md transition-all ${bgType === 'image' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                    >
                        <ImageIcon size={16} />
                    </button>
                </div>
              </div>

              {bgType === 'color' ? (
                <div className="flex justify-between py-2">
                    {COLORS.map((color) => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            selectedColor === color ? 'ring-4 ring-offset-2 ring-slate-300 scale-110' : ''
                        } ${
                            color === 'blue' ? 'bg-blue-500' :
                            color === 'green' ? 'bg-emerald-500' :
                            color === 'red' ? 'bg-rose-500' :
                            color === 'purple' ? 'bg-violet-500' :
                            color === 'orange' ? 'bg-orange-500' : 'bg-pink-500'
                        }`}
                    >
                        {selectedColor === color && <Check size={20} className="text-white" />}
                    </button>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-shrink-0 w-16 h-12 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all bg-slate-50"
                            >
                                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                <span className="text-[8px] font-bold uppercase mt-1">Upload</span>
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />

                            <div className="flex gap-2">
                                {PRESET_IMAGES.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setBgImage(img)}
                                        className={`flex-shrink-0 w-16 h-12 rounded-lg bg-cover bg-center border-2 transition-all ${bgImage === img ? 'border-blue-500 scale-105' : 'border-transparent'}`}
                                        style={{ backgroundImage: `url(${img})` }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <LinkIcon size={14} />
                            </div>
                            <input
                                type="text"
                                value={bgImage.startsWith('data:') ? 'Lokalna slika (učitana)' : bgImage}
                                onChange={(e) => setBgImage(e.target.value)}
                                readOnly={bgImage.startsWith('data:')}
                                placeholder="URL slike ili uploaduj..."
                                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${bgImage.startsWith('data:') ? 'text-blue-600' : ''}`}
                            />
                            {bgImage && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-cover bg-center border border-white shadow-sm"
                                     style={{ backgroundImage: `url(${bgImage})` }}>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Početni datum i vrijeme</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Check size={20} /> Sačuvaj Counter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCounterModal;
