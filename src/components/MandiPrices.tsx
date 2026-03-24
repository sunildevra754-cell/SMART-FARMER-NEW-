import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Search, MapPin, Filter, ChevronLeft, ArrowUpRight, ArrowDownRight, RefreshCw, Volume2 } from 'lucide-react';
import { MandiPrice } from '../types';
import { generateSpeech } from '../services/geminiService';
import { translations } from '../translations';

interface MandiPricesProps {
  onBack: () => void;
  language?: string;
}

const MandiPrices: React.FC<MandiPricesProps> = ({ onBack, language = 'English' }) => {
  const t = translations[language] || translations.English;
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const speakPrices = async () => {
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    if (filteredPrices.length === 0) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsSpeaking(true);

    const topPrices = filteredPrices.slice(0, 5);
    let reportText = `Current market rates for ${selectedState === 'All States' ? 'various states' : selectedState}. `;
    
    topPrices.forEach(p => {
      reportText += `${p.commodity} in ${p.market} is trading at a modal price of ${p.modal_price} rupees per quintal. `;
    });

    try {
      const audioUrl = await generateSpeech(reportText);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };
        audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('Speech error:', err);
      setIsSpeaking(false);
    }
  };

  // Mock data for Mandi prices
  const mockPrices: MandiPrice[] = [
    { state: 'Punjab', district: 'Ludhiana', market: 'Ludhiana', commodity: 'Wheat', variety: 'Kalyan', arrival_date: '23/03/2026', min_price: 2100, max_price: 2350, modal_price: 2275 },
    { state: 'Haryana', district: 'Karnal', market: 'Karnal', commodity: 'Rice', variety: 'Basmati', arrival_date: '23/03/2026', min_price: 4500, max_price: 5200, modal_price: 4850 },
    { state: 'Uttar Pradesh', district: 'Agra', market: 'Agra', commodity: 'Potato', variety: 'Desi', arrival_date: '23/03/2026', min_price: 800, max_price: 1200, modal_price: 1050 },
    { state: 'Maharashtra', district: 'Nashik', market: 'Lasalgaon', commodity: 'Onion', variety: 'Red', arrival_date: '23/03/2026', min_price: 1500, max_price: 2200, modal_price: 1850 },
    { state: 'Gujarat', district: 'Rajkot', market: 'Rajkot', commodity: 'Cotton', variety: 'Shankar 6', arrival_date: '23/03/2026', min_price: 6500, max_price: 7800, modal_price: 7200 },
    { state: 'Madhya Pradesh', district: 'Indore', market: 'Indore', commodity: 'Soybean', variety: 'Yellow', arrival_date: '23/03/2026', min_price: 4200, max_price: 4800, modal_price: 4550 },
    { state: 'Rajasthan', district: 'Jaipur', market: 'Jaipur', commodity: 'Mustard', variety: 'Desi', arrival_date: '23/03/2026', min_price: 5400, max_price: 6100, modal_price: 5800 },
    { state: 'Karnataka', district: 'Bangalore', market: 'Bangalore', commodity: 'Tomato', variety: 'Hybrid', arrival_date: '23/03/2026', min_price: 1200, max_price: 1800, modal_price: 1500 },
    { state: 'Andhra Pradesh', district: 'Guntur', market: 'Guntur', commodity: 'Chilli', variety: 'Guntur Sannam', arrival_date: '23/03/2026', min_price: 18000, max_price: 22000, modal_price: 20000 },
    { state: 'Tamil Nadu', district: 'Erode', market: 'Erode', commodity: 'Turmeric', variety: 'Finger', arrival_date: '23/03/2026', min_price: 7000, max_price: 8500, modal_price: 7800 },
    { state: 'Bihar', district: 'Patna', market: 'Patna', commodity: 'Maize', variety: 'Hybrid', arrival_date: '23/03/2026', min_price: 1800, max_price: 2100, modal_price: 1950 },
    { state: 'West Bengal', district: 'Burdwan', market: 'Burdwan', commodity: 'Jute', variety: 'TD-5', arrival_date: '23/03/2026', min_price: 5500, max_price: 6200, modal_price: 5900 },
    { state: 'Kerala', district: 'Kochi', market: 'Kochi', commodity: 'Coconut', variety: 'Local', arrival_date: '23/03/2026', min_price: 25, max_price: 35, modal_price: 30 },
  ];

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setPrices(mockPrices);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const states = ['All States', ...Array.from(new Set(mockPrices.map(p => p.state)))];

  const filteredPrices = prices.filter(p => {
    const matchesSearch = p.commodity.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'All States' || p.state === selectedState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
      <header className="p-6 border-b border-slate-100 flex flex-col gap-6 bg-amber-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595804550742-b065f492a344?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/90 to-white/90"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600 shadow-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-md shadow-amber-200">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">Mandi Prices</h2>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Live Market Rates</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={speakPrices}
              disabled={isLoading || filteredPrices.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50 border border-emerald-200 shadow-sm"
            >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            {isSpeaking ? t.speaking : t.listenRates}
          </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-50 transition-colors border border-amber-200 shadow-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              placeholder="Search commodity or market..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none appearance-none font-medium text-slate-700 shadow-sm cursor-pointer"
              >
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
            <p className="text-slate-500 font-medium">Fetching latest market data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPrices.map((price, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-bold text-xl group-hover:scale-110 transition-transform">
                    {price.commodity[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{price.commodity}</h3>
                    <div className="flex items-center text-sm text-slate-500">
                      <MapPin className="w-3 h-3 mr-1" /> {price.market}, {price.state}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 md:gap-12">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Min Price</p>
                    <p className="text-lg font-bold text-slate-700">₹{price.min_price}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Max Price</p>
                    <p className="text-lg font-bold text-slate-700">₹{price.max_price}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Modal Price</p>
                    <p className="text-2xl font-black text-slate-900">₹{price.modal_price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    idx % 2 === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {idx % 2 === 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {idx % 2 === 0 ? '+2.4%' : '-1.2%'}
                  </div>
                  <p className="text-[10px] font-medium text-slate-400">{price.arrival_date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MandiPrices;
