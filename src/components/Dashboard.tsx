import React from 'react';
import { motion } from 'motion/react';
import { 
  Stethoscope, 
  CloudSun, 
  MapPin, 
  TrendingUp, 
  Plane, 
  ShoppingBag, 
  FileText, 
  Calculator, 
  Droplets, 
  Sprout,
  ChevronRight,
  MessageSquare,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { translations } from '../translations';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  exploreText: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, color, onClick, exploreText }) => (
  <motion.button
    whileHover={{ scale: 1.02, translateY: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative flex flex-col items-start p-6 bg-white rounded-[24px] shadow-sm border border-slate-100/60 text-left transition-all hover:shadow-xl hover:shadow-emerald-900/5 group overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color.replace('bg-', 'from-').replace('-50', '-100/40')} to-transparent rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
    <div className={`p-3.5 rounded-2xl ${color} mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2 font-display tracking-tight">{title}</h3>
    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">{description}</p>
    <div className="mt-auto pt-5 flex items-center text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">
      {exploreText} <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.button>
);

interface DashboardProps {
  onNavigate: (view: string) => void;
  language?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, language = 'English' }) => {
  const t = translations[language] || translations.English;

  const features = [
    {
      id: 'crop-doctor',
      title: t.cropDoctor,
      description: 'AI-powered disease detection and chat.',
      icon: <Stethoscope className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50',
    },
    {
      id: 'weather',
      title: t.weatherReport,
      description: 'Live local weather and forecasts.',
      icon: <CloudSun className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      id: 'mandi-prices',
      title: t.mandiPrices,
      description: 'Real-time prices for all states and cities.',
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      color: 'bg-amber-50',
    },
    {
      id: 'marketplace',
      title: t.marketplace,
      description: 'Buy and sell crops directly.',
      icon: <ShoppingBag className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      id: 'gps-features',
      title: t.liveGps,
      description: 'Track fields and equipment.',
      icon: <MapPin className="w-6 h-6 text-rose-600" />,
      color: 'bg-rose-50',
    },
    {
      id: 'drone-connect',
      title: t.droneControl,
      description: 'Live drone connectivity and monitoring.',
      icon: <Plane className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50',
    },
    {
      id: 'ai-advisors',
      title: t.aiAdvisors,
      description: 'Spray, fertilizer, and profit advisors.',
      icon: <Calculator className="w-6 h-6 text-cyan-600" />,
      color: 'bg-cyan-50',
    },
    {
      id: 'govt-schemes',
      title: t.govtSchemes,
      description: 'Latest government portals and schemes.',
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-50',
    },
    {
      id: 'ai-image-generator',
      title: 'AI Image Generator',
      description: 'Create high-quality agricultural images.',
      icon: <ImageIcon className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12 relative rounded-[32px] overflow-hidden shadow-2xl">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2064&auto=format&fit=crop" 
            alt="Farm landscape" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 font-display">
              {t.welcome}
            </h1>
            <p className="text-emerald-50/80 text-lg md:text-xl font-medium leading-relaxed">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-xl">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-900/20">
              <CloudSun className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">{t.localWeather}</p>
              <p className="text-3xl font-black text-white font-display tracking-tight">28°C <span className="text-sm font-bold text-emerald-200 ml-1 uppercase tracking-wider">{t.sunny}</span></p>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <DashboardCard
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              onClick={() => onNavigate(feature.id)}
              exploreText={language === 'Hindi' ? 'देखें' : 'Explore'}
            />
          </motion.div>
        ))}
      </div>

      <section className="mt-16">
        <div className="bg-slate-900 rounded-[40px] overflow-hidden relative shadow-2xl group">
          <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-700">
            <img 
              src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c6c13?q=80&w=2070&auto=format&fit=crop" 
              alt="Crop inspection" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-10 md:p-20 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4" /> AI Powered
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-display tracking-tight leading-tight">{t.aiCropDoctorTitle}</h2>
            <p className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed font-medium">
              {t.aiCropDoctorDesc}
            </p>
            <button
              onClick={() => onNavigate('crop-doctor')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(5,150,105,0.3)] hover:shadow-[0_12px_25px_rgba(5,150,105,0.4)] flex items-center gap-3 hover:-translate-y-1 text-lg"
            >
              <Stethoscope className="w-6 h-6" /> {t.startDiagnosis}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
