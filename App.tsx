
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Timer, LayoutGrid, List, Download, Upload, Info, X, Share2 } from 'lucide-react';
import { TimeCounter, DisplayFormat } from './types';
import CounterCard from './components/CounterCard';
import WidgetTile from './components/WidgetTile';
import AddCounterModal from './components/AddCounterModal';

type AppView = 'list' | 'home';

const App: React.FC = () => {
  const [counters, setCounters] = useState<TimeCounter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<AppView>('home');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'list') setView('list');
    if (params.get('action') === 'new') setIsModalOpen(true);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('chrono_counters_v2');
    if (saved) {
      try {
        setCounters(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved counters", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chrono_counters_v2', JSON.stringify(counters));
  }, [counters]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(counters);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `chronotrack_backup_${new Date().toISOString().slice(0,10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setCounters([...imported, ...counters.filter(c => !imported.find(i => i.id === c.id))]);
          alert("Podaci uspešno uvezeni!");
        }
      } catch (err) {
        alert("Greška pri uvozu fajla.");
      }
    };
    reader.readAsText(file);
  };

  const addCounter = (name: string, startDate: string, color: string, format: DisplayFormat, asWidget: boolean, bgImage?: string) => {
    const newCounter: TimeCounter = {
      id: crypto.randomUUID(),
      name,
      startDate,
      createdAt: new Date().toISOString(),
      color,
      backgroundImage: bgImage,
      displayFormat: format,
      isWidget: asWidget
    };
    setCounters([newCounter, ...counters]);
  };

  const deleteCounter = (id: string) => {
    if (confirm('Jeste li sigurni da želite obrisati ovaj counter?')) {
      setCounters(counters.filter(c => c.id !== id));
    }
  };

  const updateCounter = (id: string, updates: Partial<TimeCounter>) => {
    setCounters(counters.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const newCounters = [...counters];
    const draggedIndex = newCounters.findIndex(c => c.id === draggedId);
    const targetIndex = newCounters.findIndex(c => c.id === targetId);
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = newCounters.splice(draggedIndex, 1);
      newCounters.splice(targetIndex, 0, removed);
      setCounters(newCounters);
    }
    setDraggedId(null);
  };

  const widgetCounters = counters.filter(c => c.isWidget);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-xl relative overflow-x-hidden">
      <header className="bg-white px-6 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ChronoTrack</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {view === 'home' ? 'Widget Dashboard' : 'Svi Counteri'}
          </p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={exportData}
                className="bg-slate-50 p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                title="Backup podataka"
            >
                <Download size={18} />
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-50 p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                title="Uvezi podatke"
            >
                <Upload size={18} />
                <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
            </button>
            <button 
                onClick={handleInstallClick}
                className="bg-blue-50 p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                title="Instaliraj App"
            >
                <Share2 size={18} />
            </button>
        </div>
      </header>

      <main className="flex-1 p-6 pb-32">
        {showInstallGuide && (
            <div className="mb-6 bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Info size={16} />
                        </div>
                        <h3 className="font-bold">Pravilna Instalacija</h3>
                    </div>
                    <button onClick={() => setShowInstallGuide(false)} className="p-1 hover:bg-white/10 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-3 text-sm opacity-90 leading-relaxed">
                    <p>Trenutno si u <b>Preview</b> modu. Da bi instalirao pravu aplikaciju:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-1">
                        <li>Preuzmi kod (Export dugme gore).</li>
                        <li>Postavi ga na svoj hosting (npr. Netlify).</li>
                        <li>Otvori taj link u Chrome-u.</li>
                        <li>Klikni <b>tri tačke</b> i <b>"Install app"</b>.</li>
                    </ol>
                </div>
            </div>
        )}

        {view === 'home' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <LayoutGrid size={14} /> Aktivni Widgeti
                </h2>
            </div>
            {widgetCounters.length === 0 ? (
                <div className="py-12 text-center bg-white border border-slate-100 rounded-3xl p-8">
                    <LayoutGrid size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 text-sm mb-4">Nema pinovanih widgeta.</p>
                    <button onClick={() => setView('list')} className="text-blue-600 font-bold text-xs bg-blue-50 px-6 py-2.5 rounded-full">
                        + Izaberi iz liste
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {widgetCounters.map(counter => (
                        <WidgetTile 
                            key={counter.id} 
                            counter={counter} 
                            onClick={() => setView('list')}
                            onDragStart={() => handleDragStart(counter.id)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(counter.id)}
                            isDragging={draggedId === counter.id}
                        />
                    ))}
                </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Svi counteri ({counters.length})</span>
            </div>
            {counters.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <Timer size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-sm">Nema countera. Napravite prvi!</p>
                </div>
            ) : (
                counters.map(counter => (
                    <CounterCard 
                        key={counter.id} 
                        counter={counter} 
                        onDelete={deleteCounter}
                        onUpdate={updateCounter}
                    />
                ))
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20">
         <button 
          onClick={() => setIsModalOpen(true)}
          className="android-fab bg-slate-900 hover:bg-black text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-2xl"
        >
          <Plus size={28} />
        </button>
      </div>

      <nav className="fixed bottom-0 w-full max-w-lg bg-white border-t border-slate-100 px-8 py-4 pb-6 flex justify-around items-center rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <button 
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}
          >
              <LayoutGrid size={22} strokeWidth={view === 'home' ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
          </button>
          
          <div className="w-16"></div>

          <button 
            onClick={() => setView('list')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'list' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}
          >
              <List size={22} strokeWidth={view === 'list' ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Lista</span>
          </button>
      </nav>

      {isModalOpen && (
        <AddCounterModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={addCounter} 
        />
      )}
    </div>
  );
};

export default App;
