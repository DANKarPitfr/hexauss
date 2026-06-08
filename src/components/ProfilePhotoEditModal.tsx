import React, { useState, useRef } from 'react';
/// <reference types="vite/client" />
import { X, Upload, Trash2, Loader2, Building2, Home, Landmark, Crown, Building } from 'lucide-react';
import { auth } from '../firebase';
import { uploadToCloudinary } from '../utils/cloudinary';

// Real estate themed SVG avatar generation
const createAvatarSvg = (icon: React.ReactElement, color: string) => {
  const svg = `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="64" fill="#121212"/>
  <circle cx="64" cy="64" r="58" stroke="${color}" stroke-width="2"/>
  <foreignObject x="32" y="32" width="64" height="64">
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex; justify-content:center; align-items:center; width:64px; height:64px; color:${color};">
      ${(icon as any).type.render ? (icon as any).type.render(icon.props, null) : ''}
    </div>
  </foreignObject>
</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const AVATAR_OPTIONS = [
  { category: 'Luxury', icon: <Crown size={40} />, color: '#FFB627' },
  { category: 'Luxury', icon: <Landmark size={40} />, color: '#FFD700' },
  { category: 'Modern', icon: <Building2 size={40} />, color: '#4ECDC4' },
  { category: 'Modern', icon: <Building size={40} />, color: '#A8E6CF' },
  { category: 'Minimal', icon: <Home size={40} />, color: '#FFFFFF' },
  { category: 'Minimal', icon: <Building size={40} />, color: '#E0E0E0' },
  { category: 'Commercial', icon: <Building2 size={40} />, color: '#B8B8FF' },
  { category: 'Royal', icon: <Crown size={40} />, color: '#FF6B6B' },
];

const PREPARED_AVATARS = AVATAR_OPTIONS.map(opt => ({
    ...opt,
    url: createAvatarSvg(opt.icon, opt.color)
}));

interface ProfilePhotoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  onUpdateImage: (url: string) => void;
}

export default function ProfilePhotoEditModal({ isOpen, onClose, currentImage, onUpdateImage }: ProfilePhotoEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const url = await uploadToCloudinary(file, 'image', (p) => console.log(`Progress: ${p}%`));
      if (url) {
        onUpdateImage(url);
      } else {
        alert("Upload failed");
      }
      setIsLoading(false);
      onClose();
    }
  };

  const handleSelect = (url: string) => {
    setIsLoading(true);
    setTimeout(() => {
      onUpdateImage(url);
      setIsLoading(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-luxury-surface/95 backdrop-blur-xl border border-luxury-citrus/20 rounded-[32px] overflow-hidden shadow-neo-dark flex flex-col transform transition-all animate-in slide-in-from-bottom-12 duration-300 max-h-[80vh]">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 sm:hidden" />
        
        {isLoading && (
          <div className="absolute inset-0 bg-luxury-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[32px]">
            <Loader2 className="w-10 h-10 text-luxury-citrus animate-spin mb-4 drop-shadow-[0_0_10px_rgba(255,182,39,0.5)]" />
            <p className="text-luxury-cream font-medium tracking-wide shadow-black drop-shadow-md">Updating Identity...</p>
          </div>
        )}

        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight text-luxury-cream">Choose Your Estate Identity</h2>
            <button onClick={onClose} className="p-2 bg-luxury-bg rounded-full text-luxury-text/60 hover:text-luxury-citrus transition-colors border border-white/5">
              <X size={20} />
            </button>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative group cursor-pointer hover:scale-105 transition-transform" onClick={() => fileInputRef.current?.click()}>
                <img 
                    src={currentImage} 
                    alt="Current Profile" 
                    className="w-28 h-28 rounded-full object-cover border-[3px] border-luxury-citrus shadow-glow-sm"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <Upload className="text-white w-8 h-8 drop-shadow-md" />
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 bg-luxury-bg hover:bg-luxury-citrus/10 text-luxury-cream font-semibold py-3.5 rounded-[20px] shadow-neo-dark-sm hover:shadow-glow-sm transition-all active:scale-95 border border-luxury-citrus/30"
            >
              <Upload size={20} className="text-luxury-citrus" />
              Upload from Gallery
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />

            <div>
              <p className="text-xs font-bold text-luxury-text/50 uppercase tracking-widest mb-4 ml-1 mt-6">Select Estate Logo</p>
              <div className="grid grid-cols-4 gap-3">
                {PREPARED_AVATARS.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSelect(opt.url)}
                    className="aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-luxury-citrus focus:border-luxury-citrus transition-all shadow-neo-dark hover:shadow-glow-sm active:scale-95 group relative"
                  >
                    <img src={opt.url} alt={`Avatar ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button 
                onClick={() => handleSelect('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjQiIGZpbGw9IiMxMjEyMTIiLz48L3N2Zz4=')}
                className="w-full flex items-center justify-center gap-2 py-3 mt-6 text-luxury-text hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium border border-transparent"
            >
              <Trash2 size={16} />
              Reset Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
