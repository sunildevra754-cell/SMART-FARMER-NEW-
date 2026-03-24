import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Send, Loader2, AlertCircle, ChevronLeft, Stethoscope, MessageSquare, Volume2, X } from 'lucide-react';
import { detectCropDisease, getAIAdvice, generateSpeech } from '../services/geminiService';
import Markdown from 'react-markdown';
import { translations } from '../translations';

interface Message {
  role: 'user' | 'ai';
  content: string;
  image?: string;
}

interface CropDoctorProps {
  onBack: () => void;
  language?: string;
}

const CropDoctor: React.FC<CropDoctorProps> = ({ onBack, language = 'English' }) => {
  const t = translations[language] || translations.English;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    // We'll use a timeout or useEffect to ensure the video element is rendered
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Could not access camera. Please check permissions.');
        setIsCameraOpen(false);
      }
    }, 100);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const speakText = async (text: string) => {
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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round(height * (MAX_SIZE / width));
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round(width * (MAX_SIZE / height));
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setSelectedImage(compressedDataUrl);
          } else {
            setSelectedImage(reader.result as string);
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let aiResponse = '';
      if (userMessage.image) {
        const base64Data = userMessage.image.split(',')[1];
        const mimeType = userMessage.image.split(';')[0].split(':')[1];
        // Pass the user's text as additional context if available
        aiResponse = await detectCropDisease(base64Data, mimeType, userMessage.content);
      } else {
        aiResponse = await getAIAdvice(userMessage.content);
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error('Error in AI response:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.cropDoctor}</h2>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">AI Powered Diagnosis</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400">
          <AlertCircle className="w-4 h-4" />
          Always consult local experts for critical decisions.
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 relative">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 relative z-10">
            <div className="p-6 bg-emerald-100 rounded-full shadow-inner border border-emerald-200">
              <Camera className="w-12 h-12 text-emerald-600 drop-shadow-sm" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 mb-3 font-display tracking-tight">{t.howCanIHelp}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {t.uploadPhotoDesc}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <button
                onClick={startCamera}
                className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/5 transition-all flex flex-col items-center gap-3 group"
              >
                <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                  <Camera className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">{t.liveCamera}</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/5 transition-all flex flex-col items-center gap-3 group"
              >
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">{t.gallery}</span>
              </button>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded crop"
                    className="rounded-xl mb-3 max-h-64 object-cover w-full"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="prose prose-sm max-w-none prose-slate">
                  <Markdown>{msg.content}</Markdown>
                </div>
                {msg.role === 'ai' && (
                  <button
                    onClick={() => speakText(msg.content)}
                    className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
                  >
                    <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-pulse' : ''}`} />
                    {isSpeaking ? t.speaking : t.listenAdvice}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <span className="text-sm text-slate-500 font-medium">{t.analyzing}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        {isCameraOpen && (
          <div className="fixed inset-0 z-[60] bg-black flex flex-col">
            <div className="p-4 flex justify-between items-center text-white">
              <h3 className="font-bold">Live Diagnosis</h3>
              <button onClick={stopCamera} className="p-2 bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="p-8 flex justify-center bg-black/50 backdrop-blur-md">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full border-8 border-white/20 flex items-center justify-center active:scale-90 transition-transform"
              >
                <div className="w-14 h-14 bg-emerald-500 rounded-full" />
              </button>
            </div>
          </div>
        )}
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl border-2 border-emerald-500"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={startCamera}
            className="p-3 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 rounded-xl transition-all text-slate-600"
            title="Live Camera"
          >
            <Camera className="w-6 h-6" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 rounded-xl transition-all text-slate-600"
            title="Upload from Gallery"
          >
            <ImageIcon className="w-6 h-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.askAnything}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-2xl transition-all shadow-lg shadow-emerald-200"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropDoctor;
