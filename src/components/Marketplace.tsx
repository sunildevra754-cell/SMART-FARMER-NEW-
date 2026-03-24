import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  MapPin, 
  Tag, 
  User, 
  Calendar, 
  ChevronLeft, 
  PlusCircle,
  X,
  CheckCircle2,
  Filter,
  ArrowRight,
  Volume2,
  Mic
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { CropListing } from '../types';
import { generateSpeech } from '../services/geminiService';
import { translations } from '../translations';

interface MarketplaceProps {
  onBack: () => void;
  onToggleVoiceAssistant?: () => void;
  language?: string;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onBack, onToggleVoiceAssistant, language = 'English' }) => {
  const t = translations[language] || translations.English;
  const [listings, setListings] = useState<CropListing[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'buyer' | 'seller'>('buyer');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    unit: 'kg',
    location: '',
    imageUrl: '',
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
            setNewListing(prev => ({ ...prev, imageUrl: compressedDataUrl }));
          } else {
            setNewListing(prev => ({ ...prev, imageUrl: reader.result as string }));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const path = 'listings';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CropListing[];
      setListings(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, []);

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const path = 'listings';
    try {
      await addDoc(collection(db, path), {
        ...newListing,
        price: parseFloat(newListing.price),
        sellerId: auth.currentUser.uid,
        sellerName: auth.currentUser.displayName || 'Farmer',
        createdAt: serverTimestamp(),
      });
      setShowAddForm(false);
      setNewListing({ title: '', description: '', price: '', unit: 'kg', location: '', imageUrl: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesView = viewMode === 'buyer' 
      ? (!auth.currentUser || l.sellerId !== auth.currentUser.uid)
      : (auth.currentUser && l.sellerId === auth.currentUser.uid);
    return matchesSearch && matchesView;
  });

  const speakListing = async (listing: CropListing) => {
    if (isSpeaking === listing.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setIsSpeaking(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsSpeaking(listing.id || 'temp');
    
    const text = `${listing.title} for sale by ${listing.sellerName} in ${listing.location}. 
    Price is ${listing.price} rupees per ${listing.unit}. 
    Description: ${listing.description}`;

    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(null);
          audioRef.current = null;
        };
        audio.play();
      } else {
        setIsSpeaking(null);
      }
    } catch (err) {
      console.error('Speech error:', err);
      setIsSpeaking(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-xl">
      <header className="p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Marketplace</h2>
              <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Direct Sale</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleVoiceAssistant}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
            title="Google AI Voice Assistant"
          >
            <Mic className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Google AI Voice</span>
          </button>
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('buyer')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                viewMode === 'buyer' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Buyer
            </button>
            <button
              onClick={() => setViewMode('seller')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                viewMode === 'seller' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Seller
            </button>
          </div>
          {viewMode === 'seller' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-purple-100"
            >
              <PlusCircle className="w-4 h-4" /> Add Listing
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing, idx) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100/60 overflow-hidden hover:shadow-xl hover:shadow-purple-900/5 transition-all group flex flex-col"
            >
              <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                <img
                  src={listing.imageUrl || `https://source.unsplash.com/400x250/?${encodeURIComponent(listing.title)},agriculture,crop`}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to picsum if unsplash source fails
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.title}/400/250`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg text-xs font-black text-purple-700 shadow-lg shadow-black/5">
                  ₹{listing.price}/{listing.unit}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-800 font-display tracking-tight">{listing.title}</h3>
                  <div className="flex items-center text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    <Calendar className="w-3 h-3 mr-1" />
                    {listing.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1 leading-relaxed">{listing.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => speakListing(listing)}
                      className={`p-2 rounded-xl transition-all ${
                        isSpeaking === listing.id 
                          ? 'bg-purple-600 text-white animate-pulse shadow-md shadow-purple-600/20' 
                          : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                      }`}
                      title="Listen to details"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none mb-0.5">{listing.sellerName}</p>
                      <div className="flex items-center text-[10px] font-medium text-slate-500">
                        <MapPin className="w-3 h-3 mr-0.5 text-slate-400" /> {listing.location}
                      </div>
                    </div>
                  </div>
                  {viewMode === 'buyer' ? (
                    <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 hover:-translate-y-0.5">
                      Buy Now <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/30 shrink-0">
                <h3 className="text-base font-bold text-slate-900">Sell Your Crop</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto p-4">
                <form onSubmit={handleAddListing} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Crop Photo</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative"
                    >
                      {newListing.imageUrl ? (
                        <>
                          <img src={newListing.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white font-bold text-[10px]">Change Photo</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 text-slate-300 mb-1" />
                          <p className="text-[10px] font-bold text-slate-400">Click to upload</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Crop Name</label>
                      <input
                        required
                        type="text"
                        value={newListing.title}
                        onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="e.g. Wheat"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</label>
                      <input
                        required
                        type="text"
                        value={newListing.location}
                        onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</label>
                    <textarea
                      required
                      value={newListing.description}
                      onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none h-16 resize-none"
                      placeholder="Quality, variety, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price (₹)</label>
                      <input
                        required
                        type="number"
                        value={newListing.price}
                        onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit</label>
                      <select
                        value={newListing.unit}
                        onChange={(e) => setNewListing({ ...newListing, unit: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="quintal">quintal</option>
                        <option value="ton">ton</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all shadow-md shadow-purple-100 mt-2 text-xs"
                  >
                    Post Listing
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
