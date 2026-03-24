import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CloudSun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Sun, 
  Cloud, 
  ChevronLeft, 
  MapPin, 
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Sprout,
  Volume2
} from 'lucide-react';
import { getWeatherInfo, generateSpeech } from '../services/geminiService';
import { translations } from '../translations';

interface WeatherProps {
  onBack: () => void;
  language?: string;
}

const Weather: React.FC<WeatherProps> = ({ onBack, language = 'English' }) => {
  const t = translations[language] || translations.English;
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const speakReport = async () => {
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    if (!weatherData) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsSpeaking(true);
    
    const reportText = `Weather report for ${weatherData.location || 'your location'}. 
    Current temperature is ${weatherData.current.temp} degrees with ${weatherData.current.condition}. 
    Farming advisory: ${weatherData.advisory}. 
    Spray advisory: ${weatherData.shouldSpray ? 'It is safe to spray.' : 'Do not spray.'} ${weatherData.sprayReason}`;

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

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const data = await getWeatherInfo(latitude, longitude);
        setWeatherData(data);
        setIsLoading(false);
      }, (err) => {
        console.error('Geolocation error:', err);
        setError('Please enable location access to see your local weather.');
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather data. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const getIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sun')) return <Sun className="w-6 h-6 text-amber-500" />;
    if (c.includes('rain')) return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (c.includes('cloud')) return <Cloud className="w-6 h-6 text-slate-400" />;
    return <CloudSun className="w-6 h-6 text-blue-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
      <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/90 to-white/90"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600 shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md shadow-blue-200">
              <CloudSun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">{t.weatherReport}</h2>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Live Agriculture Weather</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={speakReport}
            disabled={isLoading || !weatherData}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50 border border-emerald-200 shadow-sm"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            {isSpeaking ? t.speaking : t.listenReport}
          </button>
          <button 
            onClick={fetchWeather}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 border border-blue-200 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-500 font-medium">Updating weather data...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center max-w-xs mx-auto">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
            <p className="text-slate-600 font-bold">{error}</p>
            <button onClick={fetchWeather} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Retry</button>
          </div>
        ) : (weatherData && weatherData.current) ? (
          <div className="space-y-12">
            <section className="flex flex-col md:flex-row items-center justify-between gap-12 p-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[40px] text-white shadow-xl shadow-blue-200">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center gap-2 text-blue-100 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg font-bold">{weatherData.location || 'Unknown Location'}</span>
                </div>
                <h3 className="text-8xl font-black mb-2 tracking-tighter">{weatherData.current.temp ?? '--'}°</h3>
                <p className="text-2xl font-bold text-blue-100 mb-8">{weatherData.current.condition || 'Clear'}</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="w-4 h-4 text-amber-300" />
                    <span className="text-lg font-bold">{(weatherData.current.temp ?? 0) + 2}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-blue-200" />
                    <span className="text-lg font-bold">{(weatherData.current.temp ?? 0) - 4}°</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
                <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center text-center">
                  <Wind className="w-8 h-8 text-blue-100 mb-3" />
                  <p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Wind Speed</p>
                  <p className="text-xl font-bold">{weatherData.current.windSpeed ?? '--'} km/h</p>
                </div>
                <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center text-center">
                  <Droplets className="w-8 h-8 text-blue-100 mb-3" />
                  <p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Humidity</p>
                  <p className="text-xl font-bold">{weatherData.current.humidity ?? '--'}%</p>
                </div>
                <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center text-center">
                  <CloudRain className="w-8 h-8 text-blue-100 mb-3" />
                  <p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Precipitation</p>
                  <p className="text-xl font-bold">{weatherData.current.precipitation ?? '--'}%</p>
                </div>
                <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center text-center">
                  <Thermometer className="w-8 h-8 text-blue-100 mb-3" />
                  <p className="text-[10px] uppercase font-bold text-blue-200 mb-1">UV Index</p>
                  <p className="text-xl font-bold">{weatherData.current.uvIndex ?? '--'}</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className={`p-6 rounded-3xl flex items-start gap-4 border ${weatherData.shouldSpray ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className={`p-3 rounded-2xl ${weatherData.shouldSpray ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  {weatherData.shouldSpray ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 text-rose-600" />}
                </div>
                <div>
                  <h4 className={`text-lg font-bold mb-1 ${weatherData.shouldSpray ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {t.sprayAdvisory}: {weatherData.shouldSpray ? t.safeToSpray : t.doNotSpray}
                  </h4>
                  <p className={`text-sm leading-relaxed ${weatherData.shouldSpray ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {weatherData.sprayReason}
                  </p>
                </div>
              </section>

              <section className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-2xl">
                  <Sun className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-amber-900 mb-1">{t.farmingAdvisory}</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {weatherData.advisory}
                  </p>
                </div>
              </section>
            </div>

            {weatherData.cropAdvice && (
              <section className="p-8 bg-emerald-50 border border-emerald-100 rounded-[40px] space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <Sprout className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">{t.cropSoilAdvice}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm">
                    <h5 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">{t.recommendedCrops}</h5>
                    <div className="flex flex-wrap gap-2">
                      {weatherData.cropAdvice.recommendedCrops.map((crop: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm">
                    <h5 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">{t.waterRequirement}</h5>
                    <p className="text-slate-600 text-sm leading-relaxed">{weatherData.cropAdvice.waterRequirement}</p>
                  </div>
                  
                  <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm">
                    <h5 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">{t.fertilizerAdvice}</h5>
                    <p className="text-slate-600 text-sm leading-relaxed">{weatherData.cropAdvice.fertilizerAdvice}</p>
                  </div>
                  
                  <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm">
                    <h5 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">{t.manureAdvice}</h5>
                    <p className="text-slate-600 text-sm leading-relaxed">{weatherData.cropAdvice.manureAdvice}</p>
                  </div>
                </div>
              </section>
            )}

            {weatherData.forecast && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" /> {t.forecast}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Week</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {weatherData.forecast.map((f: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all group"
                    >
                      <p className="text-sm font-bold text-slate-400 mb-4">{f.day}</p>
                      <div className="mb-4 group-hover:scale-110 transition-transform">{getIcon(f.condition)}</div>
                      <p className="text-xl font-bold text-slate-900 mb-1">{f.temp}°</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.condition}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center max-w-xs mx-auto">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
            <p className="text-slate-600 font-bold">Weather data is unavailable at the moment.</p>
            <button onClick={fetchWeather} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Retry</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
