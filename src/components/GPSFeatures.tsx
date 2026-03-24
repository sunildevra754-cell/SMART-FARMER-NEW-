import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  Map as MapIcon, 
  Layers, 
  Maximize2, 
  ChevronLeft, 
  Compass, 
  Target, 
  Info,
  Globe,
  Satellite
} from 'lucide-react';
import { translations } from '../translations';

interface GPSFeaturesProps {
  onBack: () => void;
  language?: string;
}

const GPSFeatures: React.FC<GPSFeaturesProps> = ({ onBack, language = 'English' }) => {
  const t = translations[language] || translations.English;
  const [location, setLocation] = useState({ lat: 26.9124, lng: 75.7873 }); // Default to Jaipur
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setIsLocating(false);
    }, (err) => {
      console.error('GPS error:', err);
      setIsLocating(false);
      alert('Could not get your location. Please enable GPS.');
    });
  };

  useEffect(() => {
    handleLocate();
  }, []);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
      <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50/90 to-white/90"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600 shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl shadow-md shadow-rose-200">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">{t.liveGps}</h2>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Field Tracking & Navigation</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLocate}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-rose-200 relative z-10"
        >
          {isLocating ? <Compass className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
          {t.locateMe}
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <main className="flex-1 relative bg-slate-100 overflow-hidden">
          <div className="w-full h-full relative">
            <img
              src="https://picsum.photos/seed/farm-map/1200/800"
              alt="Field Map"
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/20 to-transparent" />
            
            {/* Mock Field Outlines */}
            <div className="absolute top-1/4 left-1/4 w-48 h-32 border-2 border-rose-500/50 bg-rose-500/10 rounded-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-rose-700 bg-white/80 px-2 py-1 rounded-full">Field A - 4.2 Acres</span>
            </div>
            <div className="absolute top-1/2 left-1/2 w-64 h-48 border-2 border-emerald-500/50 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-1 rounded-full">Field B - 6.8 Acres</span>
            </div>

            {/* Current Location Marker */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-[60%] left-[45%] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-xl relative">
                <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-40" />
              </div>
            </motion.div>

            {/* Map Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3">
              <button className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-lg transition-all text-slate-600">
                <Layers className="w-6 h-6" />
              </button>
              <button className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-lg transition-all text-slate-600">
                <Maximize2 className="w-6 h-6" />
              </button>
              <button className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-lg transition-all text-slate-600">
                <Navigation className="w-6 h-6" />
              </button>
            </div>
          </div>
        </main>

        <aside className="w-full md:w-80 border-l border-slate-100 p-6 bg-slate-50/50 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Field Stats</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.coordinates}</span>
                </div>
                <p className="text-sm font-mono text-slate-600">{location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Satellite className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.totalArea}</span>
                </div>
                <p className="text-xl font-bold text-slate-900">11.0 Acres</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">{t.nearbyResources}</h3>
            <div className="space-y-3">
              <button className="w-full p-4 bg-white hover:bg-rose-50 rounded-2xl border border-slate-100 shadow-sm transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-xl">
                    <MapIcon className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{t.mandi} (2.4km)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
              </button>
              <button className="w-full p-4 bg-white hover:bg-rose-50 rounded-2xl border border-slate-100 shadow-sm transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-xl">
                    <Info className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{t.serviceCenter}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-rose-600 mt-0.5" />
            <p className="text-xs text-rose-800 leading-relaxed">
              <strong>{t.tip}:</strong> {t.gpsTip}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default GPSFeatures;
