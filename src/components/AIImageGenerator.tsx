import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  ChevronLeft, 
  Maximize2, 
  Type, 
  Sparkles,
  RefreshCw,
  Layout
} from 'lucide-react';
import { generateImage } from '../services/geminiService';
import { translations } from '../translations';

interface AIImageGeneratorProps {
  onBack: () => void;
  language?: string;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ onBack, language = 'English' }) => {
  const t = translations[language] || translations.English;
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<any>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aspectRatios = [
    { label: '1:1', value: '1:1', icon: 'Square' },
    { label: '2:3', value: '2:3', icon: 'RectangleVertical' },
    { label: '3:2', value: '3:2', icon: 'RectangleHorizontal' },
    { label: '3:4', value: '3:4', icon: 'RectangleVertical' },
    { label: '4:3', value: '4:3', icon: 'RectangleHorizontal' },
    { label: '9:16', value: '9:16', icon: 'Smartphone' },
    { label: '16:9', value: '16:9', icon: 'Monitor' },
    { label: '21:9', value: '21:9', icon: 'Tv' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        setError('Failed to generate image. Please try a different prompt.');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError('An error occurred during generation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `smart-farmer-ai-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 min-h-[600px] flex flex-col relative">
      <header className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50 sticky top-0 z-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/90 to-white/90"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-600 shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-200">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">AI Image Generator</h2>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Powered by Gemini 3 Pro</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Controls */}
        <aside className="w-full lg:w-96 p-8 border-r border-slate-50 space-y-8 bg-slate-50/30">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <Type className="w-4 h-4" /> Describe your image
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A lush green wheat field at sunset with a modern drone flying above..."
              className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <Layout className="w-4 h-4" /> Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`p-2 rounded-xl text-[10px] font-bold transition-all border ${
                    aspectRatio === ratio.value
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>

          {error && (
            <p className="text-sm font-bold text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-100">
              {error}
            </p>
          )}
        </aside>

        {/* Preview Area */}
        <main className="flex-1 p-8 bg-slate-50/50 flex items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 text-center z-10"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                  </div>
                  <Sparkles className="absolute top-0 right-0 w-8 h-8 text-indigo-400 animate-bounce" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 font-display tracking-tight">Creating your masterpiece...</p>
                  <p className="text-slate-500 text-sm font-medium mt-2">This usually takes about 10-15 seconds</p>
                </div>
              </motion.div>
            ) : generatedImage ? (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group w-full max-w-2xl mx-auto z-10"
              >
                <img
                  src={generatedImage}
                  alt="AI Generated"
                  className="w-full rounded-[32px] shadow-2xl border-8 border-white"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px] flex items-center justify-center gap-4 backdrop-blur-sm">
                  <button
                    onClick={downloadImage}
                    className="p-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl"
                  >
                    <Download className="w-5 h-5" /> Download
                  </button>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="p-4 bg-white/20 text-white backdrop-blur-md border border-white/30 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl"
                  >
                    <RefreshCw className="w-5 h-5" /> Regenerate
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6 max-w-sm z-10"
              >
                <div className="w-32 h-32 bg-white rounded-[40px] shadow-xl flex items-center justify-center mx-auto text-slate-200 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <ImageIcon className="w-16 h-16 relative z-10 group-hover:scale-110 transition-transform duration-500 group-hover:text-indigo-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 font-display tracking-tight">Ready to Visualize?</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Enter a prompt on the left to generate high-quality agricultural imagery for your farm reports or presentations.
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

export default AIImageGenerator;
