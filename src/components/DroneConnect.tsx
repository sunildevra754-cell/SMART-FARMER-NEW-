import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Wifi, 
  Battery, 
  Signal, 
  Map as MapIcon, 
  Camera, 
  Video, 
  Power, 
  Navigation, 
  ChevronLeft, 
  AlertTriangle,
  Radio,
  Maximize2,
  Settings,
  Play,
  Square,
  ArrowRight,
  Volume2,
  ShieldCheck,
  Activity,
  CheckCircle2,
  X
} from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { translations } from '../translations';

interface DroneConnectProps {
  onBack: () => void;
  language?: string;
}

const DroneConnect: React.FC<DroneConnectProps> = ({ onBack, language = 'English' }) => {
  const t = translations[language] || translations.English;
  const [isConnected, setIsConnected] = useState(false);
  const [battery, setBattery] = useState(85);
  const [altitude, setAltitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDrones, setAvailableDrones] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  const runDiagnostics = async () => {
    if (!isConnected) return;
    setIsDiagnosing(true);
    setShowDiagnostics(true);
    setDiagnosticResults(null);
    speakStatus("Starting full system diagnostics. Checking motors, sensors, and battery health.");

    // Simulate diagnostic process
    setTimeout(() => {
      const results = {
        motors: [
          { name: 'Motor 1 (Front Left)', status: 'Healthy', temp: '42°C' },
          { name: 'Motor 2 (Front Right)', status: 'Healthy', temp: '41°C' },
          { name: 'Motor 3 (Rear Left)', status: 'Healthy', temp: '44°C' },
          { name: 'Motor 4 (Rear Right)', status: 'Healthy', temp: '43°C' },
        ],
        sensors: [
          { name: 'GPS Module', status: 'Optimal', satellites: 14 },
          { name: 'IMU Sensor', status: 'Calibrated', error: '0.01%' },
          { name: 'Barometer', status: 'Healthy', pressure: '1013 hPa' },
          { name: 'Compass', status: 'Interference Low', accuracy: 'High' },
        ],
        battery: {
          health: '98%',
          voltage: '15.4V',
          cycles: 42,
          temp: '32°C',
          status: 'Good'
        }
      };
      setDiagnosticResults(results);
      setIsDiagnosing(false);
      speakStatus("Diagnostics complete. All systems are functioning within normal parameters. Battery health is at 98 percent.");
    }, 3000);
  };

  const speakStatus = async (text: string) => {
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsSpeaking(true);
    try {
      const audioUrl = await generateSpeech(text);
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

  const handleScan = async () => {
    setIsScanning(true);
    setAvailableDrones([]);
    speakStatus("Scanning for nearby drones. Please wait.");
    
    // Simulate Bluetooth scanning
    setTimeout(() => {
      setAvailableDrones(['DJI Mavic Air 2 - #4492', 'Autel Robotics EVO II - #1102']);
      setIsScanning(false);
    }, 2000);
  };

  const connectToDrone = (name: string) => {
    setIsConnected(true);
    setAvailableDrones([]);
    speakStatus(`Successfully connected to ${name}. Systems are ready for takeoff.`);
  };

  useEffect(() => {
    if (isFlying) {
      const interval = setInterval(() => {
        setAltitude(prev => Math.min(prev + Math.random() * 2, 120));
        setSpeed(prev => Math.min(prev + Math.random() * 5, 45));
        setBattery(prev => Math.max(prev - 0.1, 0));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setAltitude(0);
      setSpeed(0);
    }
  }, [isFlying]);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 relative">
      <header className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl sticky top-0 z-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/90"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-lg ${isConnected ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20' : 'bg-slate-800'}`}>
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-display tracking-tight">Drone Control</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`} />
                <p className={`text-xs font-bold uppercase tracking-wider ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
        </div>

          <div className="flex items-center gap-6 relative z-10">
            <button
              onClick={() => speakStatus(`Current battery is ${Math.round(battery)} percent. Signal strength is strong. Altitude is ${altitude.toFixed(1)} meters.`)}
              disabled={!isConnected}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all text-slate-300 disabled:opacity-50 border border-slate-700/50 backdrop-blur-sm"
              title="Listen to status"
            >
              <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse text-indigo-400' : ''}`} />
            </button>
            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <Battery className={`w-5 h-5 ${battery < 20 ? 'text-rose-500' : 'text-emerald-500'}`} />
            <span className="text-sm font-bold">{Math.round(battery)}%</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <Signal className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold">Strong</span>
          </div>
          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              isConnected 
                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isConnected ? 'Disconnect' : 'Connect Drone'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <main className="flex-1 relative bg-black group">
          {isConnected ? (
            <div className="w-full h-full relative">
              <img
                src="https://picsum.photos/seed/farm-aerial/1280/720"
                alt="Drone Feed"
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 pointer-events-none border-[40px] border-white/5" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-48 h-48 border border-white/20 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </div>

              {/* HUD Overlays */}
              <div className="absolute top-6 left-6 space-y-4">
                <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Navigation className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Telemetry</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Altitude</p>
                      <p className="text-xl font-mono text-white">{altitude.toFixed(1)}m</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Speed</p>
                      <p className="text-xl font-mono text-white">{speed.toFixed(1)}km/h</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-4 rounded-full transition-all ${
                    isRecording ? 'bg-rose-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <Video className={`w-6 h-6 ${isRecording ? 'text-white' : 'text-slate-300'}`} />
                </button>
                <button
                  onClick={() => setIsFlying(!isFlying)}
                  className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 ${
                    isFlying 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/40'
                  }`}
                >
                  {isFlying ? <><Square className="w-5 h-5" /> Land Drone</> : <><Play className="w-5 h-5" /> Take Off</>}
                </button>
                <button className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                  <Camera className="w-6 h-6 text-slate-300" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-center p-8">
              <div className="p-8 bg-slate-800/50 rounded-full relative">
                <Radio className={`w-16 h-16 text-slate-600 ${isScanning ? 'animate-spin' : 'animate-pulse'}`} />
                <div className="absolute inset-0 border-2 border-slate-700 rounded-full animate-ping opacity-20" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isScanning ? 'Scanning for Drones...' : 'No Signal Detected'}
                </h3>
                <p className="text-slate-500 max-w-sm">
                  {isScanning 
                    ? 'Searching for nearby Bluetooth and Wi-Fi enabled drones...' 
                    : 'Please ensure your drone is powered on and within range of your mobile device.'}
                </p>
              </div>
              
              {availableDrones.length > 0 && (
                <div className="w-full max-w-sm space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">Available Devices</p>
                  {availableDrones.map(drone => (
                    <button
                      key={drone}
                      onClick={() => connectToDrone(drone)}
                      className="w-full p-4 bg-slate-800 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Plane className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                        <span>{drone}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {!isScanning && availableDrones.length === 0 && (
                <button
                  onClick={handleScan}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
                >
                  Scan for Real Drone
                </button>
              )}
            </div>
          )}
        </main>

        <aside className="w-full lg:w-80 border-l border-slate-800 bg-slate-900 p-6 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all flex flex-col items-center gap-2 text-slate-300">
                <MapIcon className="w-6 h-6" />
                <span className="text-xs font-bold">Waypoint</span>
              </button>
              <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all flex flex-col items-center gap-2 text-slate-300">
                <Maximize2 className="w-6 h-6" />
                <span className="text-xs font-bold">Scan Area</span>
              </button>
              <button 
                onClick={runDiagnostics}
                disabled={!isConnected || isDiagnosing}
                className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all flex flex-col items-center gap-2 text-slate-300 disabled:opacity-50"
              >
                <ShieldCheck className={`w-6 h-6 ${isDiagnosing ? 'text-indigo-400 animate-pulse' : 'text-emerald-400'}`} />
                <span className="text-xs font-bold">Diagnostics</span>
              </button>
              <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all flex flex-col items-center gap-2 text-slate-300">
                <Settings className="w-6 h-6" />
                <span className="text-xs font-bold">Settings</span>
              </button>
              <button className="p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all flex flex-col items-center gap-2">
                <Power className="w-6 h-6" />
                <span className="text-xs font-bold">Emergency</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Flight Status</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">GPS Satellites</span>
                <span className="text-xs font-bold text-white">14</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Wind Speed</span>
                <span className="text-xs font-bold text-white">12 km/h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Home Point</span>
                <span className="text-xs font-bold text-emerald-500">Set</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-[10px] text-slate-600 leading-relaxed">
              <strong>Warning:</strong> Ensure you are following all local aviation regulations. Maintain line of sight at all times.
            </p>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showDiagnostics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500 rounded-2xl">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">System Diagnostics</h3>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Hardware Health Check</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDiagnostics(false)}
                  className="p-3 hover:bg-slate-700 rounded-2xl transition-colors text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                {isDiagnosing ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <Activity className="w-16 h-16 text-indigo-500 animate-pulse" />
                      <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white mb-2">Running Full Scan...</p>
                      <p className="text-slate-400 text-sm">Checking all critical flight systems</p>
                    </div>
                  </div>
                ) : diagnosticResults && (
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Plane className="w-4 h-4" /> Propulsion System (Motors)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {diagnosticResults.motors.map((m: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-900/50 border border-slate-700 rounded-2xl flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-white">{m.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase">Temp: {m.temp}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-500">{m.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Navigation className="w-4 h-4" /> Navigation & Sensors
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {diagnosticResults.sensors.map((s: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-900/50 border border-slate-700 rounded-2xl flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-white">{s.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase">
                                {s.satellites ? `Satellites: ${s.satellites}` : s.error ? `Error: ${s.error}` : s.pressure ? `Pressure: ${s.pressure}` : `Accuracy: ${s.accuracy}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-500">{s.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Battery className="w-4 h-4" /> Power Management
                      </h4>
                      <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-3xl grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Health</p>
                          <p className="text-xl font-bold text-white">{diagnosticResults.battery.health}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Voltage</p>
                          <p className="text-xl font-bold text-white">{diagnosticResults.battery.voltage}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Cycles</p>
                          <p className="text-xl font-bold text-white">{diagnosticResults.battery.cycles}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Temp</p>
                          <p className="text-xl font-bold text-white">{diagnosticResults.battery.temp}</p>
                        </div>
                      </div>
                    </section>
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-800/50 border-t border-slate-700">
                <button
                  onClick={() => setShowDiagnostics(false)}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DroneConnect;
