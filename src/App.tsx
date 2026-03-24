import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import CropDoctor from './components/CropDoctor';
import Marketplace from './components/Marketplace';
import MandiPrices from './components/MandiPrices';
import AIAdvisors from './components/AIAdvisors';
import DroneConnect from './components/DroneConnect';
import GovtSchemes from './components/GovtSchemes';
import Weather from './components/Weather';
import GPSFeatures from './components/GPSFeatures';
import AIImageGenerator from './components/AIImageGenerator';
import { LogIn, Sprout, Globe, Loader2, User as UserIcon, LogOut, ChevronRight, Mic, MicOff, Volume2, X, Send, Brain, Sparkles, Image as ImageIcon } from 'lucide-react';
import { generateSpeech, getAIAdvice, getComplexAdvice, transcribeAudio } from './services/geminiService';
import { translations } from './translations';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [language, setLanguage] = useState('English');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        setLoginError('Login failed. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const t = translations[language] || translations.English;

  const handleVoiceAssistant = async () => {
    if (isListening) {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsProcessingVoice(true);
          try {
            const transcript = await transcribeAudio(base64Audio, 'audio/webm');
            if (transcript) {
              await handleSendText(transcript);
            }
          } catch (err) {
            console.error('Transcription error:', err);
            setVoiceResponse("I couldn't understand the audio. Please try again.");
          } finally {
            setIsProcessingVoice(false);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsListening(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleLogout = () => auth.signOut();

  const languages = ['English', 'Hindi', 'Punjabi', 'Marathi'];

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Beautiful Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop" 
            alt="Lush green farm" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full glass-card rounded-[40px] p-10 text-center relative z-10"
        >
          <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-inner">
            <Sprout className="w-12 h-12 text-emerald-600 drop-shadow-sm" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight font-display">
            SMART FARMER <br/><span className="text-gradient">ONE TOUCH</span>
          </h1>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed font-medium">
            Empowering farmers with AI, real-time data, and a direct marketplace.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(5,150,105,0.3)] hover:shadow-[0_12px_25px_rgba(5,150,105,0.4)] flex items-center justify-center gap-3 group"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              )}
              {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
            </button>
            
            {loginError && (
              <p className="text-rose-500 text-sm font-bold bg-rose-50/80 py-2 rounded-lg">{loginError}</p>
            )}

            <div className="flex items-center gap-2 justify-center text-xs font-bold text-slate-500 uppercase tracking-widest pt-4">
              <Globe className="w-4 h-4" /> Available in 8+ Local Languages
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSendText = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessage = { role: 'user' as const, text };
    setChatHistory(prev => [...prev, newMessage]);
    setVoiceResponse('');
    setIsProcessingVoice(true);
    
    try {
      const response = isThinkingMode 
        ? await getComplexAdvice(text)
        : await getAIAdvice(text);
        
      setVoiceResponse(response);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
      setIsProcessingVoice(false);
      
      // Speak the response
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setIsSpeaking(true);
      const audioUrl = await generateSpeech(response);
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
    } catch (error) {
      console.error('AI Chat error:', error);
      setVoiceResponse("I'm sorry, I couldn't process that. Please try again.");
      setIsProcessingVoice(false);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveView} language={language} />;
      case 'crop-doctor':
        return <CropDoctor onBack={() => setActiveView('dashboard')} language={language} />;
      case 'marketplace':
        return <Marketplace 
          onBack={() => setActiveView('dashboard')} 
          onToggleVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
          language={language} 
        />;
      case 'mandi-prices':
        return <MandiPrices onBack={() => setActiveView('dashboard')} language={language} />;
      case 'ai-advisors':
        return <AIAdvisors onBack={() => setActiveView('dashboard')} />;
      case 'drone-connect':
        return <DroneConnect onBack={() => setActiveView('dashboard')} language={language} />;
      case 'govt-schemes':
        return <GovtSchemes onBack={() => setActiveView('dashboard')} />;
      case 'weather':
        return <Weather onBack={() => setActiveView('dashboard')} language={language} />;
      case 'gps-features':
        return <GPSFeatures onBack={() => setActiveView('dashboard')} language={language} />;
      case 'ai-image-generator':
        return <AIImageGenerator onBack={() => setActiveView('dashboard')} language={language} />;
      default:
        return <Dashboard onNavigate={setActiveView} language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-3 group"
          >
            <div className="p-2 bg-emerald-500 rounded-xl group-hover:rotate-12 transition-transform">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">
              SMART FARMER
            </span>
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer hover:text-emerald-600 transition-colors"
              >
                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>

            <div className="h-8 w-px bg-slate-100 hidden md:block" />

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Premium Farmer</p>
              </div>
              <div className="relative group">
                <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-emerald-500 transition-all">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global AI Voice Assistant */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <AnimatePresence>
          {isVoiceAssistantOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-20 right-0 w-80 bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-slate-100 p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-md shadow-emerald-200">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 font-display tracking-tight">Google AI Voice Assistant</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t.alwaysListening}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsThinkingMode(!isThinkingMode)}
                  className={`p-2 rounded-xl transition-all flex items-center gap-2 border shadow-sm ${
                    isThinkingMode 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-indigo-100' 
                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                  title={isThinkingMode ? "Thinking Mode Active" : "Enable Thinking Mode"}
                >
                  <Brain className={`w-4 h-4 ${isThinkingMode ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">Think</span>
                </button>
              </div>
              
              <div className="min-h-[150px] flex flex-col space-y-4">
                <div className="flex-1 max-h-[200px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isProcessingVoice && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                        <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {isThinkingMode ? 'Deep Thinking...' : 'Processing...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {isListening && (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, 20, 8] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1 bg-emerald-500 rounded-full"
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t.listeningToYou}</p>
                  </div>
                )}

                {isSpeaking && (
                  <button 
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        audioRef.current = null;
                      }
                      setIsSpeaking(false);
                    }}
                    className="flex items-center gap-2 justify-center text-emerald-600 py-2 w-full hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.speaking} (Tap to stop)</span>
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.typeMessage}
                    className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendText((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="' + t.typeMessage + '"]') as HTMLInputElement;
                      if (input) {
                        handleSendText(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>

                <button
                  onClick={handleVoiceAssistant}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg ${
                    isListening 
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-200 animate-pulse' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isListening ? t.stopListening : t.startTalking}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsVoiceAssistantOpen(!isVoiceAssistantOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 z-50 relative ${
            isVoiceAssistantOpen 
              ? 'bg-slate-900 text-white rotate-90 shadow-slate-900/20' 
              : 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50'
          }`}
        >
          {isVoiceAssistantOpen ? <X className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          {!isVoiceAssistantOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-bold text-slate-400">© 2026 SMART FARMER: ONE TOUCH</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
