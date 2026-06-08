import { useState } from 'react';
import { ChevronLeft, Camera, MapPin, Phone, Mail, User, Info, Building2, Banknote, Map, Home, Smile, Palette, EyeOff, Lock, Clock, Search, Edit2, Loader2, CheckCircle2 } from 'lucide-react';
import ProfilePhotoEditModal from './ProfilePhotoEditModal';
import { UserProfile } from '../App';

interface EditProfileViewProps {
  onBack: () => void;
  profileImage: string;
  onUpdateImage: (newImage: string) => void;
  userProfile: UserProfile | null;
  onSaveProfile: (newProfile: UserProfile) => void;
}

export default function EditProfileView({ onBack, profileImage, onUpdateImage, userProfile, onSaveProfile }: EditProfileViewProps) {
  if (!userProfile) return null;

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // State for form fields
  const [formData, setFormData] = useState<UserProfile>(userProfile || {
    name: '',
    username: '',
    bio: '',
    city: '',
    phone: '',
    email: '',
    propertyType: 'Apartment',
    budget: 0,
    favoriteAreas: '',
    bhk: '1 BHK',
    moodEmoji: '🏠',
    homeStyle: 'Modern',
    accentColor: '#FFB627',
    hideContact: false,
    privateProfile: false,
  });
  
  const accentColors = ['#FFB627', '#E88316', '#FF6B6B', '#4ECDC4', '#A8E6CF', '#B8B8FF'];
  const homeStyles = ['Luxury', 'Minimal', 'Modern', 'Budget'];

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      onSaveProfile(formData);
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };
  
  return (
    <div className="flex-1 overflow-y-auto space-y-6 pb-24 font-sans text-luxury-text bg-luxury-bg z-50 fixed inset-0 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-luxury-bg/80 backdrop-blur-xl border-b border-luxury-border/20 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-luxury-surface rounded-full shadow-neo-dark-sm hover:shadow-glow-sm transition-all text-luxury-text hover:text-luxury-citrus border border-luxury-border/30"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-luxury-cream">Edit Profile</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 space-y-8 pb-32">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-2">
          <button 
            onClick={() => setIsPhotoModalOpen(true)}
            className="relative w-24 h-24 shrink-0 rounded-full hover:scale-105 transition-transform group"
          >
            <div 
              className="w-full h-full rounded-full object-cover border-[3px] shadow-glow-sm overflow-hidden flex items-center justify-center bg-luxury-surface"
              style={{ borderColor: formData.accentColor }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl font-bold text-luxury-citrus">
                  {formData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white drop-shadow-md" />
            </div>
            <div 
              className="absolute bottom-0 right-0 p-2 bg-luxury-surface rounded-full border shadow-neo-dark-sm group-hover:scale-110 transition-transform"
              style={{ borderColor: formData.accentColor, color: formData.accentColor }}
            >
              <Edit2 size={14} />
            </div>
          </button>
        </div>

        {/* PERSONAL INFO */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Personal Info</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><User size={12}/> Name</label>
              <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Info size={12}/> Username</label>
              <input type="text" value={formData.username} onChange={e => handleChange('username', e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Info size={12}/> Bio/Status</label>
              <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={2} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset resize-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><MapPin size={12}/> City</label>
              <input type="text" value={formData.city} onChange={e => handleChange('city', e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Phone size={12}/> Phone Number</label>
              <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Mail size={12}/> Email</label>
              <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
            </div>
          </div>
        </section>

        {/* PROPERTY PREFERENCES */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Property Preferences</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Building2 size={12}/> Preferred Property Type</label>
              <select value={formData.propertyType} onChange={e => handleChange('propertyType', e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset appearance-none">
                <option>Villa / Mansion</option>
                <option>Penthouse</option>
                <option>Apartment</option>
                <option>Studio</option>
              </select>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Banknote size={12}/> Budget Range</label>
                <span className="text-xs font-bold text-luxury-citrus">${((formData.budget || 0) / 1000).toFixed(1)}k / mo</span>
              </div>
              <input type="range" min="1000" max="20000" value={formData.budget} onChange={e => handleChange('budget', Number(e.target.value))} className="w-full accent-luxury-citrus h-1 bg-luxury-bg rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="space-y-1 pt-2">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Map size={12}/> Favorite Areas</label>
              <input type="text" value={formData.favoriteAreas} onChange={e => handleChange('favoriteAreas', e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Home size={12}/> BHK Preference</label>
              <div className="flex gap-2">
                {['1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map(bhk => (
                  <button 
                    key={bhk} 
                    onClick={() => handleChange('bhk', bhk)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl shadow-neo-dark-sm transition-colors border ${
                      formData.bhk === bhk 
                        ? 'bg-luxury-surface text-luxury-citrus border-luxury-citrus shadow-neo-dark-inset' 
                        : 'bg-luxury-bg text-luxury-cream border-luxury-border/30 hover:border-luxury-citrus/50'
                    }`}
                  >
                    {bhk}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PERSONALIZATION */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Personalization</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-4 space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1">
                <Smile size={12}/> Mood Emoji
              </label>
              <div className="p-2 bg-luxury-bg rounded-xl shadow-neo-dark-inset border border-luxury-border/30 text-xl overflow-hidden relative">
                <select value={formData.moodEmoji} onChange={e => handleChange('moodEmoji', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full text-center">
                  <option>😎</option>
                  <option>🏡</option>
                  <option>✨</option>
                  <option>🌟</option>
                  <option>🥂</option>
                  <option>🔑</option>
                </select>
                {formData.moodEmoji}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1">
                <Building2 size={12}/> Dream Home Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {homeStyles.map(style => (
                  <button 
                    key={style}
                    onClick={() => handleChange('homeStyle', style)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all shadow-neo-dark-sm border ${
                      formData.homeStyle === style 
                      ? 'bg-luxury-surface text-luxury-citrus border-luxury-citrus shadow-neo-dark-inset' 
                      : 'bg-luxury-bg text-luxury-text border-luxury-border/30 hover:border-luxury-citrus/50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-luxury-border/20">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1 mt-2">
                <Palette size={12}/> Profile Accent Color
              </label>
              <div className="flex gap-3 justify-between px-1">
                {accentColors.map(color => (
                  <button 
                    key={color}
                    onClick={() => handleChange('accentColor', color)}
                    className={`w-8 h-8 rounded-full shadow-neo-dark-sm transition-transform ${formData.accentColor === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-luxury-surface' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color, ringColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRIVACY */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Privacy</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-2">
            <div className="flex items-center justify-between p-3 border-b border-luxury-border/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-luxury-bg rounded-full shadow-neo-dark-inset">
                  <EyeOff size={16} className="text-luxury-text" />
                </div>
                <span className="text-sm font-semibold text-luxury-cream">Hide Contact Info</span>
              </div>
              <button 
                onClick={() => handleChange('hideContact', !formData.hideContact)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.hideContact ? 'bg-luxury-citrus' : 'bg-luxury-bg shadow-neo-dark-inset'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.hideContact ? 'translate-x-6' : 'translate-x-0 bg-luxury-text/50'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-luxury-bg rounded-full shadow-neo-dark-inset">
                  <Lock size={16} className="text-luxury-text" />
                </div>
                <span className="text-sm font-semibold text-luxury-cream">Private Profile</span>
              </div>
              <button 
                onClick={() => handleChange('privateProfile', !formData.privateProfile)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.privateProfile ? 'bg-luxury-citrus' : 'bg-luxury-bg shadow-neo-dark-inset'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.privateProfile ? 'translate-x-6' : 'translate-x-0 bg-luxury-text/50'}`} />
              </button>
            </div>
          </div>
        </section>
        
        <div className="pt-4 pb-8 relative">
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-luxury-citrus hover:bg-luxury-citrus-light text-[#121212] font-bold py-4 rounded-[20px] shadow-glow active:scale-95 transition-all text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
            </button>
            <div className={`absolute -top-12 left-0 right-0 flex justify-center transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-glow-sm backdrop-blur-md">
                <CheckCircle2 size={14} /> Profile Updated Successfully
              </div>
            </div>
        </div>
      </main>

      <ProfilePhotoEditModal 
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentImage={profileImage}
        onUpdateImage={onUpdateImage}
      />
    </div>
  );
}
