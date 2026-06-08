import { useState, useEffect } from 'react';
import { Settings, MapPin, Grid, Bookmark, Clock, Edit2, Home, Heart, X } from 'lucide-react';
import PropertyCard from './PropertyCard';
import SmallPropertyCard from './SmallPropertyCard';
import { ManagePropertyCard } from './ManagePropertyCard';
import ProfilePhotoEditModal from './ProfilePhotoEditModal';
import { UserProfile } from '../App';
import { Property } from '../constants';

interface ProfileViewProps {
  onSettingsClick?: () => void;
  setCurrentView?: (view: 'home' | 'profile' | 'settings' | 'edit-profile' | 'post-property' | 'sell-property') => void;
  profileImage: string;
  onUpdateImage: (newImage: string) => void;
  userProfile: UserProfile | null;
  myProperties?: Property[];
  onPropertyClick?: (property: Property) => void;
  onDeleteProperty?: (propertyId: string) => void;
  onEditProperty?: (property: Property) => void;
  onVisibilityChange?: (propertyId: string, visibility: 'public' | 'private') => void;
  onSaleStatusChange?: (propertyId: string, saleStatus: 'rented' | 'sold' | null) => void;
  onShareQR?: (property: Property) => void;
  onViewStats?: (property: Property) => void;
}

export default function ProfileView({ onSettingsClick, setCurrentView, profileImage, onUpdateImage, userProfile, myProperties = [], onPropertyClick, onDeleteProperty, onEditProperty, onVisibilityChange, onSaleStatusChange, onShareQR, onViewStats }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'posted' | 'saved' | 'searches' | 'activity' | 'viewed'>('posted');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [viewedProperties, setViewedProperties] = useState<Property[]>([]);
  const [activeMenuCardId, setActiveMenuCardId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'viewed') {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setViewedProperties(viewed);
    }
  }, [activeTab]);

  if (!userProfile) return null;

  return (
    <div className="flex-1 overflow-y-auto space-y-6 pb-24 font-sans text-luxury-text bg-luxury-bg">
      {/* Profile Header */}
      <div className="px-4 pt-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPhotoModalOpen(true)}
              className="relative w-24 h-24 rounded-full hover:scale-105 transition-transform group shrink-0 shadow-glow-sm border-[3px]"
              style={{ borderColor: userProfile.accentColor }}
            >
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Edit2 size={24} className="text-white drop-shadow-md" />
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-luxury-surface rounded-full border border-luxury-border shadow-neo-dark-sm text-luxury-citrus">
                <Edit2 size={12} />
              </div>
            </button>
            <div>
              <h1 className="text-xl font-bold text-luxury-cream">
                {userProfile.name} {userProfile.moodEmoji}
              </h1>
              <p className="text-sm text-luxury-text/60 flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-luxury-citrus/80" />
                {userProfile.city}
              </p>
              {userProfile.bio && (
                <p className="text-xs text-luxury-text/70 mt-2 max-w-[200px] truncate">
                  {userProfile.bio}
                </p>
              )}
              <p className="text-xs text-luxury-text/50 mt-2 font-medium bg-luxury-surface/50 inline-block px-2 py-0.5 rounded-full border border-white/5">
                Premium Member
              </p>
            </div>
          </div>
          <div className="flex bg-luxury-surface border border-luxury-border rounded-full p-1 shadow-neo-dark-sm">
            <button onClick={onSettingsClick} className="p-2 text-luxury-text hover:text-luxury-citrus transition-colors rounded-full hover:bg-luxury-bg">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="flex justify-around items-center bg-luxury-surface/60 backdrop-blur-md rounded-[24px] p-4 shadow-neo-dark border border-luxury-border/30 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-luxury-cream drop-shadow-[0_0_4px_rgba(255,182,39,0.3)]">{myProperties.length}</span>
            <span className="text-[10px] text-luxury-text/60 uppercase tracking-wider font-semibold mt-1">Posted</span>
          </div>
          <div className="w-[1px] h-8 bg-luxury-border/50"></div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-luxury-cream drop-shadow-[0_0_4px_rgba(255,182,39,0.3)]">0</span>
            <span className="text-[10px] text-luxury-text/60 uppercase tracking-wider font-semibold mt-1">Saved</span>
          </div>
          <div className="w-[1px] h-8 bg-luxury-border/50"></div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-luxury-cream drop-shadow-[0_0_4px_rgba(255,182,39,0.3)]">{viewedProperties.length}</span>
            <span className="text-[10px] text-luxury-text/60 uppercase tracking-wider font-semibold mt-1">Viewed</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button 
            onClick={() => setCurrentView?.('edit-profile')}
            className="flex-1 bg-luxury-surface hover:bg-luxury-surface/80 text-luxury-cream font-semibold py-2.5 rounded-xl shadow-neo-dark-sm hover:shadow-neo-dark transition-all active:shadow-neo-dark-inset border border-luxury-border/40 text-xs"
          >
            Edit Profile
          </button>
          <button className="flex-1 bg-gradient-to-r from-luxury-citrus to-luxury-citrus-light text-[#121212] font-semibold py-2.5 rounded-xl shadow-glow-sm hover:shadow-glow transition-all text-xs border border-luxury-citrus/50">
            My Properties
          </button>
          <button className="flex-1 bg-luxury-surface hover:bg-luxury-surface/80 text-luxury-cream font-semibold py-2.5 rounded-xl shadow-neo-dark-sm hover:shadow-neo-dark transition-all active:shadow-neo-dark-inset border border-luxury-border/40 text-xs">
            Saved Listings
          </button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-2">
        <div className="flex border-b border-luxury-border/30 mb-4 px-2">
          <button
            onClick={() => setActiveTab('posted')}
            className={`flex-1 flex justify-center pb-3 transition-colors ${
              activeTab === 'posted'
                ? 'border-b-2 border-luxury-citrus text-luxury-citrus drop-shadow-[0_0_8px_rgba(255,182,39,0.5)]'
                : 'text-luxury-text/50 hover:text-luxury-cream'
            }`}
          >
            <Grid size={22} />
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex justify-center pb-3 transition-colors ${
              activeTab === 'saved'
                ? 'border-b-2 border-luxury-citrus text-luxury-citrus drop-shadow-[0_0_8px_rgba(255,182,39,0.5)]'
                : 'text-luxury-text/50 hover:text-luxury-cream'
            }`}
          >
            <Bookmark size={22} />
          </button>
          <button
            onClick={() => setActiveTab('searches')}
            className={`flex-1 flex justify-center pb-3 transition-colors ${
              activeTab === 'searches'
                ? 'border-b-2 border-luxury-citrus text-luxury-citrus drop-shadow-[0_0_8px_rgba(255,182,39,0.5)]'
                : 'text-luxury-text/50 hover:text-luxury-cream'
            }`}
          >
            <Clock size={22} />
          </button>
          <button
            onClick={() => setActiveTab('viewed')}
            className={`flex-1 flex justify-center pb-3 transition-colors ${
              activeTab === 'viewed'
                ? 'border-b-2 border-luxury-citrus text-luxury-citrus drop-shadow-[0_0_8px_rgba(255,182,39,0.5)]'
                : 'text-luxury-text/50 hover:text-luxury-cream'
            }`}
          >
            <Clock size={22} />
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 flex justify-center pb-3 transition-colors ${
              activeTab === 'activity'
                ? 'border-b-2 border-luxury-citrus text-luxury-citrus drop-shadow-[0_0_8px_rgba(255,182,39,0.5)]'
                : 'text-luxury-text/50 hover:text-luxury-cream'
            }`}
          >
            <Clock size={22} />
          </button>
        </div>

        {/* Tab Content */}
        <div className="px-2 space-y-4">
          {activeTab === 'posted' && (
            <div className="pb-8">
              {myProperties.length > 0 ? (
                <>
                  {myProperties.map((property) => (
                    <ManagePropertyCard 
                        key={property.id} 
                        property={property} 
                        onEdit={onEditProperty!} 
                        onVisibilityChange={onVisibilityChange!} 
                        onSaleStatusChange={onSaleStatusChange!} 
                        onShareQR={onShareQR!} 
                        onViewStats={onViewStats!} 
                        onDelete={onDeleteProperty!}
                        isMenuOpen={activeMenuCardId === property.id}
                        onToggleMenu={() => setActiveMenuCardId(activeMenuCardId === property.id ? null : property.id)}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center py-10">
                    <p className="text-luxury-cream text-lg font-semibold">No properties posted yet</p>
                    <p className="text-sm opacity-60">Your luxury listings will appear here</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'saved' && (
            <div className="flex flex-col gap-4 text-center py-10 opacity-60">
                <Bookmark size={32} className="mx-auto text-luxury-citrus mb-2" />
                <p className="text-luxury-cream text-lg font-semibold">No saved listings yet</p>
                <p className="text-sm">Save properties you like to see them here.</p>
            </div>
          )}

          {activeTab === 'searches' && (
            <div className="flex flex-col gap-4 py-4 text-center">
                <p className="text-luxury-cream font-semibold">Saved Searches</p>
                <div className="bg-luxury-surface p-4 rounded-2xl border border-luxury-border">
                    <p className="text-sm text-luxury-text">You have 0 active saved searches.</p>
                    <p className="text-xs mt-2">Set filters in the main search and click "Save" to be notified of new listings!</p>
                </div>
            </div>
          )}

          {activeTab === 'viewed' && (
            <div className="grid grid-cols-2 gap-3 pb-8">
              {viewedProperties.map((property) => (
                <div key={property.id} className="relative group">
                  <SmallPropertyCard property={property} onClick={() => onPropertyClick?.(property)} />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = viewedProperties.filter(p => p.id !== property.id);
                      setViewedProperties(updated);
                      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
                    }}
                    className="absolute -top-1 -right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {viewedProperties.length === 0 && (
                <p className="col-span-2 text-center text-sm py-4 opacity-60">No recently viewed properties.</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="flex flex-col gap-4 text-center py-10 opacity-60">
                <Clock size={32} className="mx-auto text-luxury-citrus mb-2" />
                <p className="text-luxury-cream text-lg font-semibold">No recent activity</p>
                <p className="text-sm">Properties you view will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <ProfilePhotoEditModal 
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentImage={profileImage}
        onUpdateImage={onUpdateImage}
      />
    </div>
  );
}
