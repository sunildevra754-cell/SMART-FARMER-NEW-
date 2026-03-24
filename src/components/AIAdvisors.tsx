import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Droplets, 
  Sprout, 
  TrendingUp, 
  FileText, 
  ChevronLeft, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  BarChart3,
  MapPin,
  Store
} from 'lucide-react';
import { getProfitAnalysis, getAIAdvice, findNearbyStores } from '../services/geminiService';
import Markdown from 'react-markdown';

interface AIAdvisorsProps {
  onBack: () => void;
}

const AIAdvisors: React.FC<AIAdvisorsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'profit' | 'spray' | 'fertilizer' | 'action-plan' | 'stores'>('profit');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    crop: '',
    area: '',
    budget: '',
    pest: '',
    soilType: '',
    storeType: 'agricultural supplies',
  });
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setPlaces([]);

    try {
      if (activeTab === 'stores') {
        if (!location) {
          setResult("Location access is required to find nearby stores. Please enable location services.");
          setIsLoading(false);
          return;
        }
        const response = await findNearbyStores(formData.storeType, location.lat, location.lng);
        setResult(response.text);
        setPlaces(response.places);
      } else {
        let advice = '';
        if (activeTab === 'profit') {
          advice = await getProfitAnalysis(formData.crop, parseFloat(formData.area), parseFloat(formData.budget));
        } else if (activeTab === 'spray') {
          advice = await getAIAdvice(`Provide a spray schedule and pest control advice for ${formData.crop} affected by ${formData.pest}.`);
        } else if (activeTab === 'fertilizer') {
          advice = await getAIAdvice(`Suggest a fertilizer budget and application plan for ${formData.crop} on ${formData.area} acres with ${formData.soilType} soil.`);
        } else if (activeTab === 'action-plan') {
          advice = await getAIAdvice(`Create a comprehensive week-by-week action plan for growing ${formData.crop} on ${formData.area} acres.`);
        }
        setResult(advice);
      }
    } catch (error) {
      console.error('Error getting AI advice:', error);
      setResult('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profit', label: 'Profit Detector', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'spray', label: 'Spray Advisor', icon: <Droplets className="w-5 h-5" /> },
    { id: 'fertilizer', label: 'Fertilizer Budget', icon: <Calculator className="w-5 h-5" /> },
    { id: 'action-plan', label: 'Action Plan', icon: <FileText className="w-5 h-5" /> },
    { id: 'stores', label: 'Nearby Stores', icon: <Store className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
      <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-cyan-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/90 to-white/90"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600 shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl shadow-md shadow-cyan-200">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">AI Advisors</h2>
              <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Smart Farming Insights</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col md:flex-row relative">
        <aside className="w-full md:w-64 border-r border-slate-100 p-4 bg-slate-50/50">
          <div className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setResult(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-200/50'
                    : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-white">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-black text-slate-900 mb-3 font-display tracking-tight">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h3>
                  <p className="text-slate-500 font-medium">Fill in the details below to get AI-powered insights.</p>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-6">
                  {activeTab !== 'stores' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Crop Type</label>
                        <input
                          required
                          type="text"
                          value={formData.crop}
                          onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                          placeholder="e.g. Wheat, Rice"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Land Area (Acres)</label>
                        <input
                          required
                          type="number"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'stores' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">What are you looking for?</label>
                      <select
                        value={formData.storeType}
                        onChange={(e) => setFormData({ ...formData, storeType: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all appearance-none"
                      >
                        <option value="agricultural supplies">Agricultural Supplies</option>
                        <option value="fertilizer store">Fertilizer Store</option>
                        <option value="seed supplier">Seed Supplier</option>
                        <option value="tractor dealer">Tractor Dealer</option>
                        <option value="farmers market">Farmers Market</option>
                      </select>
                      {!location && (
                        <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Please enable location services to find nearby stores.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'profit' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Total Budget (₹)</label>
                      <input
                        required
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {activeTab === 'spray' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Observed Pest/Disease</label>
                      <input
                        required
                        type="text"
                        value={formData.pest}
                        onChange={(e) => setFormData({ ...formData, pest: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                        placeholder="e.g. Aphids, Rust"
                      />
                    </div>
                  )}

                  {activeTab === 'fertilizer' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Soil Type</label>
                      <select
                        value={formData.soilType}
                        onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all appearance-none"
                      >
                        <option value="">Select Soil Type</option>
                        <option value="alluvial">Alluvial</option>
                        <option value="black">Black (Regur)</option>
                        <option value="red">Red/Yellow</option>
                        <option value="laterite">Laterite</option>
                        <option value="sandy">Sandy</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5" /> Get AI Analysis
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">AI Analysis Complete</h3>
                      <p className="text-sm text-slate-500">Based on your provided data.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setResult(null)}
                    className="px-4 py-2 text-sm font-bold text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
                  >
                    New Analysis
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 prose prose-slate max-w-none shadow-inner">
                  <Markdown>{result}</Markdown>
                  
                  {places && places.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-lg font-bold text-slate-900">Nearby Locations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {places.map((place, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <h5 className="font-bold text-slate-800 mb-1">{place.title}</h5>
                            <p className="text-sm text-slate-500 flex items-start gap-1">
                              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{place.uri}</span>
                            </p>
                            {place.placeAnswerSources?.reviewSnippets?.[0] && (
                              <p className="text-xs text-slate-600 mt-2 italic">
                                "{place.placeAnswerSources.reviewSnippets[0]}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Disclaimer:</strong> This advice is generated by AI and should be verified with local agricultural departments or experts before implementation.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AIAdvisors;
