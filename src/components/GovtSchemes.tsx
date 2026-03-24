import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  ExternalLink, 
  Search, 
  ChevronLeft, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  Landmark,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface GovtSchemesProps {
  onBack: () => void;
}

const GovtSchemes: React.FC<GovtSchemesProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const schemes = [
    {
      title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      description: 'Income support of ₹6,000 per year to all landholding farmers families.',
      benefits: ['Direct benefit transfer', 'Financial stability', 'Support for small farmers'],
      link: 'https://pmkisan.gov.in/',
      category: 'Income Support'
    },
    {
      title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
      description: 'Crop insurance scheme to provide financial support to farmers suffering from crop loss.',
      benefits: ['Low premium rates', 'Full sum insured', 'Quick claim settlement'],
      link: 'https://pmfby.gov.in/',
      category: 'Insurance'
    },
    {
      title: 'Kisan Credit Card (KCC)',
      description: 'Provides farmers with timely access to credit for their cultivation and other needs.',
      benefits: ['Low interest rates', 'Flexible repayment', 'Insurance coverage'],
      link: 'https://www.myscheme.gov.in/schemes/kcc',
      category: 'Credit'
    },
    {
      title: 'Soil Health Card Scheme',
      description: 'Provides information to farmers on nutrient status of their soil along with recommendations on appropriate dosage of nutrients.',
      benefits: ['Improved soil health', 'Reduced fertilizer cost', 'Higher crop yield'],
      link: 'https://soilhealth.dac.gov.in/',
      category: 'Soil Health'
    },
    {
      title: 'e-NAM (National Agriculture Market)',
      description: 'Pan-India electronic trading portal which networks the existing APMC mandis.',
      benefits: ['Better price discovery', 'Direct access to buyers', 'Transparent transactions'],
      link: 'https://www.enam.gov.in/',
      category: 'Marketing'
    },
    {
      title: 'PM-KMY (Pradhan Mantri Kisan Maandhan Yojana)',
      description: 'Pension scheme for small and marginal farmers to provide social security.',
      benefits: ['Monthly pension of ₹3,000', 'Voluntary contribution', 'Old age security'],
      link: 'https://maandhan.in/',
      category: 'Pension'
    }
  ];

  const filteredSchemes = schemes.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shadow-xl relative">
      <header className="p-6 bg-orange-50/50 border-b border-slate-100 flex flex-col gap-6 sticky top-0 z-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/90 to-white/90"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600 shadow-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-md shadow-orange-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">Govt Schemes</h2>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Official Portals & Support</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 shadow-sm">
              <ShieldCheck className="w-4 h-4" /> Verified Portals
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 shadow-sm">
              <Globe className="w-4 h-4" /> All India Coverage
            </div>
          </div>
        </div>

        <div className="relative z-10 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Search schemes, categories, or benefits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm text-slate-700 font-medium"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {scheme.category}
                </div>
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-orange-50 transition-colors">
                  <Landmark className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{scheme.title}</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{scheme.description}</p>
              
              <div className="space-y-2 mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Benefits</p>
                {scheme.benefits.map((benefit, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {benefit}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Info className="w-4 h-4" /> Official Govt Portal
                </div>
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 group/btn"
                >
                  Apply Now <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="mt-12 p-8 bg-indigo-900 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Need help with applications?</h3>
            <p className="text-indigo-200 mb-8 max-w-xl">
              Our AI Advisor can help you understand eligibility criteria and required documents for any government scheme.
            </p>
            <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2">
              Ask AI Advisor <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Landmark className="w-64 h-64" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default GovtSchemes;
