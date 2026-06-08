import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Phone, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Megaphone, 
  TrendingUp, 
  Star, 
  MessageSquareShare, 
  HelpCircle, 
  FileQuestion, 
  FileText, 
  Info, 
  LogOut, 
  Edit2, 
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfilePhotoEditModal from './ProfilePhotoEditModal';
import AdvertiseWithUsSection from './AdvertiseWithUsSection';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';

import { UserProfile } from '../App';

const SettingsToggle = ({ enabled, onChange }: { enabled: boolean; onChange: (e: boolean) => void }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onChange(!enabled); }}
      className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${enabled ? 'bg-luxury-citrus' : 'bg-[#2A2A2A]'} border border-luxury-border shadow-inner`}
    >
        <div className={`w-4 h-4 rounded-full bg-luxury-cream transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </button>
);

interface SettingsViewProps {
  onBack: () => void;
  profileImage: string;
  onUpdateImage: (newImage: string) => void;
  themeMode: 'dark' | 'light' | 'auto';
  onThemeChange: (mode: 'dark' | 'light' | 'auto') => void;
  onEditProfile: () => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  onContactClick: () => void;
  onFaqClick: () => void;
  onFeedbackClick: () => void;
  onAboutClick: () => void;
}

export default function SettingsView({ onBack, profileImage, onUpdateImage, themeMode, onThemeChange, onEditProfile, userProfile, onLogout, onContactClick, onFaqClick, onFeedbackClick, onAboutClick }: SettingsViewProps) {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const [privacy, setPrivacy] = useState({
    privateProfile: false,
    hidePhone: false,
    hideEmail: false,
    propertyVisibility: true,
    onlineStatus: true,
  });

  const [notifications, setNotifications] = useState({
      propertyUpdates: true,
      recommendations: true,
      messages: true,
      promotions: false,
      nearby: true
  });

  const handleToggle = (setter: any, key: string) => (val: boolean) => {
    setter((prev: any) => ({ ...prev, [key]: val }));
  };

  const accountSettings = [
    { label: 'Mobile Number', icon: Phone },
    { label: 'Email Address', icon: Mail },
    { label: 'Change Password', icon: Lock },
    { label: 'Notification Settings', icon: Bell },
    { label: 'Privacy Controls', icon: Shield },
  ];

  const supportSettings = [
    { label: 'Help & Support', icon: HelpCircle },
    { label: 'FAQs', icon: FileQuestion },
    { label: 'Share Feedback', icon: MessageSquareShare },
    { label: 'Terms of Service', icon: FileText },
    { label: 'Privacy Policy', icon: Shield },
    { label: 'About Us', icon: Info },
  ];

  const renderSettingItem = (item: { label: string; icon: any }, isLast: boolean, highlighted: boolean = false, onClick?: () => void) => (
    <button 
      key={item.label}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-luxury-surface hover:bg-luxury-surface/80 transition-all active:bg-luxury-surface/60 group
        ${!isLast ? 'border-b border-luxury-border/30' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl shadow-neo-dark-inset ${highlighted ? 'bg-luxury-bg border border-luxury-citrus/30' : 'bg-luxury-bg'}`}>
          <item.icon size={20} className={`${highlighted ? 'text-luxury-citrus drop-shadow-[0_0_5px_rgba(255,182,39,0.5)]' : 'text-luxury-text group-hover:text-luxury-cream'} transition-colors`} />
        </div>
        <span className={`text-sm font-semibold tracking-wide ${highlighted ? 'text-luxury-cream' : 'text-luxury-cream group-hover:text-luxury-citrus-light'} transition-colors`}>
          {item.label}
        </span>
      </div>
      <ChevronRight size={18} className={`text-luxury-text/40 group-hover:text-luxury-citrus transition-all ${expandedSection === item.label ? 'rotate-90' : ''}`} />
    </button>
  );

  const renderSection = (title: string, items: { label: string; icon: any }[], isAdSection: boolean = false) => (
    <section>
      <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 px-2 ${isAdSection ? 'text-luxury-citrus/80' : 'text-luxury-text/60'}`}>{title}</h3>
      <div className={`bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] overflow-hidden shadow-neo-dark border ${isAdSection ? 'border-luxury-citrus/40' : 'border-luxury-border/40'}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isSelected = expandedSection === item.label;

          return (
            <React.Fragment key={item.label}>
              {renderSettingItem(item, isLast, isAdSection, () => {
                if (item.label === 'Terms of Service') window.location.href = '/terms-of-service';
                else if (item.label === 'Privacy Policy') window.location.href = '/privacy-policy';
                else if (item.label === 'Help & Support') onContactClick();
                else if (item.label === 'FAQs') onFaqClick();
                else if (item.label === 'Share Feedback') onFeedbackClick();
                else if (item.label === 'About Us') onAboutClick();
                else setExpandedSection(isSelected ? null : item.label);
              })}
              
              {isSelected && (
                <div className="px-4 py-3 bg-luxury-bg/50 border-b border-luxury-border/30">
                  {/* Detailed Settings rendering logic here */}
                  {item.label === 'Privacy Controls' && (
                     <div className="space-y-3">
                       {Object.entries(privacy).map(([key, val]) => (
                         <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-luxury-text capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <SettingsToggle enabled={val as boolean} onChange={handleToggle(setPrivacy, key)} />
                         </div>
                       ))}
                     </div>
                  )}
                  {item.label === 'Mobile Number' && (
                    <div className="space-y-3">
                         <div className="relative">
                            <input type="text" placeholder="+91 XXXXXXXXXX" maxLength={13} className="w-full bg-luxury-surface border border-luxury-border rounded-xl p-3 text-sm text-luxury-cream" />
                         </div>
                         <button className="w-full bg-luxury-citrus text-luxury-bg font-bold py-2 rounded-xl" onClick={() => {
                             alert('Sending OTP to +91XXXXXXXXXX...');
                             setTimeout(() => alert('OTP Sent Successfully (Demo: 1234)'), 500);
                         }}>Send OTP</button>
                         <input type="text" placeholder="Enter 4-digit OTP" maxLength={4} className="w-full bg-luxury-surface border border-luxury-border rounded-xl p-3 text-sm text-luxury-cream" />
                         <button className="w-full bg-luxury-bg border border-luxury-citrus text-luxury-citrus font-bold py-2 rounded-xl" onClick={() => {
                             alert('Verification Success!');
                         }}>Verify OTP</button>
                    </div>
                  )}
                  {item.label === 'Email Address' && (
                    <div className="space-y-3">
                         <input type="email" value={userProfile?.email || ''} readOnly className="w-full bg-luxury-surface border border-luxury-border rounded-xl p-3 text-sm text-luxury-cream" />
                         <button className="w-full bg-luxury-citrus text-luxury-bg font-bold py-2 rounded-xl" onClick={async () => {
                             if (auth.currentUser) {
                               try {
                                 await sendEmailVerification(auth.currentUser);
                                 alert('Verification email sent!');
                               } catch (error) {
                                 console.error(error);
                                 alert('Failed to send verification email.');
                               }
                             } else {
                               alert('No user logged in.');
                             }
                         }}>Verify Email</button>
                    </div>
                  )}
                  {item.label === 'Change Password' && (
                    <div className="space-y-3">
                         <input type="password" placeholder="Current Password" className="w-full bg-luxury-surface border border-luxury-border rounded-xl p-3 text-sm text-luxury-cream" />
                         <input type="password" placeholder="New Password" className="w-full bg-luxury-surface border border-luxury-border rounded-xl p-3 text-sm text-luxury-cream" />
                         <input type="password" placeholder="Confirm Password" className="w-full bg-luxury-surface border border-luxury-border rounded-xl p-3 text-sm text-luxury-cream" />
                         <button className="w-full bg-luxury-citrus text-luxury-bg font-bold py-2 rounded-xl">Update Password</button>
                    </div>
                  )}
                  {item.label === 'Notification Settings' && (
                     <div className="space-y-3">
                       {Object.entries(notifications).map(([key, val]) => (
                         <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-luxury-text capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <SettingsToggle enabled={val as boolean} onChange={handleToggle(setNotifications, key)} />
                         </div>
                       ))}
                     </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );

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
          <h1 className="text-xl font-bold tracking-tight text-luxury-cream">Settings</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 space-y-8 pb-32">
        {/* Appearance Section */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Appearance</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] overflow-hidden shadow-neo-dark border border-luxury-border/40 p-5">
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => onThemeChange('dark')} className={`flex flex-col items-center gap-3 p-4 rounded-[20px] transition-all group ${themeMode === 'dark' ? 'bg-luxury-bg shadow-neo-dark-inset border border-luxury-citrus' : 'bg-transparent border border-transparent hover:bg-luxury-surface/50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${themeMode === 'dark' ? 'bg-[#121212] border-[3px] border-[#FFB627] shadow-[0_0_15px_rgba(255,182,39,0.4)]' : 'bg-luxury-bg border-2 border-luxury-border group-hover:border-luxury-citrus/50'}`}>
                  <Moon size={20} className={themeMode === 'dark' ? 'text-[#FFB627]' : 'text-luxury-text'} />
                </div>
                <span className={`text-[11px] font-bold text-center leading-tight transition-colors ${themeMode === 'dark' ? 'text-luxury-citrus' : 'text-luxury-cream group-hover:text-luxury-citrus-light'}`}>Dark Citrus</span>
              </button>

              <button onClick={() => onThemeChange('light')} className={`flex flex-col items-center gap-3 p-4 rounded-[20px] transition-all group ${themeMode === 'light' ? 'bg-luxury-bg shadow-neo-dark-inset border border-luxury-citrus' : 'bg-transparent border border-transparent hover:bg-luxury-surface/50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${themeMode === 'light' ? 'bg-[#FDF9EC] border-[3px] border-[#E88316] shadow-[0_0_15px_rgba(232,131,22,0.4)]' : 'bg-luxury-bg border-2 border-luxury-border group-hover:border-luxury-citrus/50'}`}>
                  <Sun size={20} className={themeMode === 'light' ? 'text-[#E88316]' : 'text-luxury-text'} />
                </div>
                <span className={`text-[11px] font-bold text-center leading-tight transition-colors ${themeMode === 'light' ? 'text-luxury-citrus' : 'text-luxury-cream group-hover:text-luxury-citrus-light'}`}>Light Citrus</span>
              </button>

              <button onClick={() => onThemeChange('auto')} className={`flex flex-col items-center gap-3 p-4 rounded-[20px] transition-all group ${themeMode === 'auto' ? 'bg-luxury-bg shadow-neo-dark-inset border border-luxury-citrus' : 'bg-transparent border border-transparent hover:bg-luxury-surface/50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${themeMode === 'auto' ? 'bg-gradient-to-tr from-[#121212] to-[#FDF9EC] border-[3px] border-luxury-citrus shadow-glow-sm' : 'bg-luxury-bg border-2 border-luxury-border group-hover:border-luxury-citrus/50'}`}>
                  <Smartphone size={20} className={themeMode === 'auto' ? 'text-[#E88316] drop-shadow-md' : 'text-luxury-text'} />
                </div>
                <span className={`text-[11px] font-bold text-center leading-tight transition-colors ${themeMode === 'auto' ? 'text-luxury-citrus' : 'text-luxury-cream group-hover:text-luxury-citrus-light'}`}>Auto Mode</span>
              </button>
            </div>
          </div>
        </section>

        {renderSection('Account', accountSettings)}
        <AdvertiseWithUsSection />
        {renderSection('Support', supportSettings)}

        {/* Account Actions */}
        <section>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] overflow-hidden shadow-neo-dark border border-red-500/20">
            <button onClick={onLogout} className="w-full flex items-center justify-between p-4 bg-luxury-surface hover:bg-red-900/10 transition-all text-red-400">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-luxury-bg rounded-xl border border-red-500/30"><LogOut size={20} /></div>
                 <span className="text-sm font-semibold tracking-wide">Logout</span>
               </div>
            </button>
            <div className="border-t border-luxury-border/30"></div>
            <button className="w-full flex items-center justify-between p-4 bg-luxury-surface hover:bg-red-900/10 transition-all text-red-400">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-luxury-bg rounded-xl border border-red-500/30"><Shield size={20} /></div>
                 <span className="text-sm font-semibold tracking-wide">Delete Account</span>
               </div>
            </button>
          </div>
        </section>
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
