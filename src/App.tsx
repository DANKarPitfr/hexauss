/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Search, SlidersHorizontal, Home, User, Plus, X, MessageCircle, ShieldCheck } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import PropertyCard from './components/PropertyCard';
import SmallPropertyCard from './components/SmallPropertyCard';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import EditProfileView from './components/EditProfileView';
import ActionMenuModal from './components/ActionMenuModal';
import FilterModal from './components/FilterModal';
import PostPropertyView from './components/PostPropertyView';
import SellPropertyView from './components/SellPropertyView';
import AuthOnboarding from './components/AuthOnboarding';
import { Property } from './constants';
import { NotificationCenter } from './components/NotificationCenter';
import { AdminPanelView } from './components/AdminPanelView';

import { ContactSupport } from './components/ContactSupport';
import { FAQs } from './components/FAQs';
import { ShareFeedback } from './components/ShareFeedback';
import { AboutUs } from './components/AboutUs';
// Removed PremiumListingScreen import

import PropertyDetailsView from './components/PropertyDetailsView';
import CommunicationPanel from './components/CommunicationPanel';
import SearchModal from './components/SearchModal';

function parsePrice(price: string): number {
  let p = price.replace(/[₹,/mo ]/g, '').toLowerCase();
  if (p.includes('cr')) {
    return parseFloat(p.replace('cr', '')) * 10000000;
  }
  if (p.includes('lac') || p.includes('lakh')) {
    return parseFloat(p.replace(/lac|lakh/, '')) * 100000;
  }
  return parseFloat(p);
}

export interface UserProfile {
  name: string;
  username: string;
  bio: string;
  city: string;
  phone: string;
  email: string;
  propertyType: string;
  budget: number;
  favoriteAreas: string;
  bhk: string;
  moodEmoji: string;
  homeStyle: string;
  accentColor: string;
  hideContact: boolean;
  privateProfile: boolean;
  role?: string;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'settings' | 'edit-profile' | 'post-property' | 'sell-property' | 'rent-property' | 'pg-property' | 'commercial-property' | 'owner-profile'>('home');
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256');
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'auto'>('dark');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [activeOwnerProfile, setActiveOwnerProfile] = useState<UserProfile | null>(null);
  const [activeOwnerId, setActiveOwnerId] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Limited initial load for performance
    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const propertiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      setAllProperties(propertiesData);
      if (auth.currentUser) {
        setMyProperties(propertiesData.filter(p => p.ownerId === auth.currentUser?.uid));
      } else {
        setMyProperties([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleViewProperty = (p: Property) => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updatedViewed = [
      p,
      ...viewed.filter((item: Property) => item.id !== p.id)
    ].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));
    setActiveProperty(p);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        console.log("Attempting to delete property:", propertyId);
        await deleteDoc(doc(db, 'properties', propertyId));
        setMyProperties(prev => prev.filter(p => p.id !== propertyId));
        console.log("Successfully deleted property:", propertyId);
      } catch (e) {
        console.error("Error deleting property:", e);
        alert(`Failed to delete property: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  };

  const [filters, setFilters] = useState<{ priceMax: number; bhk: string | null; propertyType: string | null }>({
    priceMax: 10000000,
    bhk: null,
    propertyType: null,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProperties = useMemo(() => {
    const isAdmin = auth.currentUser?.email === 'arpitthakurhumein@gmail.com';
    const currentUserId = auth.currentUser?.uid;
    return allProperties.filter(p => {
      const isPending = p.status === 'pending';
      if (!isAdmin && isPending) return false;
      
      if (p.visibility === 'private' && p.ownerId !== currentUserId) return false;
      
      const priceVal = parsePrice(p.price);
      if (priceVal > filters.priceMax) return false;
      if (filters.bhk && String(p.bhk) !== filters.bhk) return false;
      if (filters.propertyType && p.type !== filters.propertyType) return false;
      if (searchQuery && 
          !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !p.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [filters, searchQuery, allProperties, auth.currentUser?.email, auth.currentUser?.uid]);

  useEffect(() => {
    // Timeout to ensure loading screen doesn't block for too long
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      clearTimeout(timeout);
      if (user) {
        setIsAuthenticated(true);
        
        // Sync user to Firestore
        const userDocRef = doc(db, 'users', user.uid);
        let userDoc;
        try {
          userDoc = await getDoc(userDocRef);
        } catch (e) {
          console.warn("Firestore error (could be offline):", e);
        }
        
        if (userDoc && !userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            fullName: user.displayName || 'New User',
            email: user.email,
            mobileNumber: user.phoneNumber || '',
            profilePhoto: user.photoURL || '',
            bio: '',
            city: 'Not set',
            role: 'user',
            isVerified: false,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            themePreference: 'dark',
            savedCount: 0,
            postedCount: 0,
            totalViews: 0
          });
        } else if (userDoc) {
            await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
        }

        setUserProfile({
          name: user.displayName || 'New User',
          username: user.email?.split('@')[0] || '@newuser',
          bio: 'Welcome to your luxury property dashboard.',
          city: userDoc?.data()?.city || 'Not set',
          phone: user.phoneNumber || 'Not set',
          email: user.email || '',
          propertyType: userDoc?.data()?.propertyType || 'Apartment',
          budget: userDoc?.data()?.budget || 0,
          favoriteAreas: userDoc?.data()?.favoriteAreas || '',
          bhk: userDoc?.data()?.bhk || '1 BHK',
          moodEmoji: userDoc?.data()?.moodEmoji || '🏠',
          homeStyle: userDoc?.data()?.homeStyle || 'Modern',
          accentColor: userDoc?.data()?.accentColor || '#FFB627',
          hideContact: userDoc?.data()?.hideContact || false,
          privateProfile: userDoc?.data()?.privateProfile || false,
          role: userDoc?.data()?.role || 'user'
        });
        if (user.photoURL) {
          setProfileImage(user.photoURL);
        }
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
      setIsLoading(false);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    function applyTheme() {
      root.classList.remove('theme-dark', 'theme-light');
      if (themeMode === 'auto') {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
           root.classList.add('theme-light');
        } else {
           root.classList.add('theme-dark');
        }
      } else if (themeMode === 'light') {
        root.classList.add('theme-light');
      } else {
        root.classList.add('theme-dark');
      }
    }

    applyTheme();

    if (themeMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const location = useLocation();
  
  return (
    <div className="flex flex-col h-screen w-full bg-luxury-bg font-sans text-luxury-text pb-16">
      {isLoading ? (
        <LoadingScreen />
      ) : !isAuthenticated ? (
        <AuthOnboarding onComplete={() => setIsAuthenticated(true)} />
      ) : (
        <>
          {/* Main Views */}
          <AnimatePresence mode="wait">
          {activeProperty ? (
            <motion.div key="details" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <PropertyDetailsView
                property={activeProperty}
                onBack={() => setActiveProperty(null)}
                onPropertyClick={setActiveProperty}
                onOwnerClick={async (uid) => {
                    setActiveOwnerId(uid);
                    // Fetch owner profile
                    const ownerDoc = await getDoc(doc(db, 'users', uid));
                    if (ownerDoc.exists()) {
                        const data = ownerDoc.data();
                        setActiveOwnerProfile({
                            name: data.fullName,
                            username: data.email?.split('@')[0] || '@user',
                            bio: data.bio || '',
                            city: data.city || 'Not set',
                            phone: data.mobileNumber || 'Not set',
                            email: data.email || '',
                            propertyType: data.propertyType || '',
                            budget: data.budget || 0,
                            favoriteAreas: data.favoriteAreas || '',
                            bhk: data.bhk || '',
                            moodEmoji: data.moodEmoji || '',
                            homeStyle: data.homeStyle || '',
                            accentColor: data.accentColor || '',
                            hideContact: data.hideContact || false,
                            privateProfile: data.privateProfile || false,
                            role: data.role || 'user'
                        });
                        setCurrentView('owner-profile');
                    }
                }}
              />
            </motion.div>
          ) : currentView === 'home' ? (
            <motion.div key="home" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              {/* Sticky Top Search Area */}
              <header className="sticky top-0 z-50 bg-luxury-bg/80 backdrop-blur-xl border-none p-4 shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsChatOpen(true)} className="p-3 bg-luxury-surface rounded-2xl border border-luxury-border text-luxury-citrus">
                    <MessageCircle size={20} />
                  </button>
                  {auth.currentUser?.email === 'arpitthakurhumein@gmail.com' && (
                    <button onClick={() => setIsAdminPanelOpen(true)} className="p-3 bg-luxury-surface rounded-2xl border border-luxury-border text-red-500 hover:text-red-400">
                      <ShieldCheck size={20} />
                    </button>
                  )}
                  <div 
                    onClick={() => setIsSearchModalOpen(true)}
                    className="flex-1 flex items-center gap-3 bg-luxury-surface shadow-neo-dark-inset rounded-2xl px-4 py-3 border border-luxury-border focus-within:shadow-glow focus-within:border-luxury-citrus transition-all cursor-pointer"
                  >
                    <Search className="w-5 h-5 text-luxury-citrus/60" />
                    <span className="flex-1 text-sm text-luxury-text/40 font-medium truncate">Search properties, cities, PGs...</span>
                  </div>
                  <button onClick={() => setIsFilterMenuOpen(true)} className="p-3 bg-gradient-to-br from-luxury-citrus to-luxury-citrus-light text-[#121212] rounded-2xl shadow-glow-sm hover:shadow-glow transition-all">
                    <SlidersHorizontal size={20} />
                  </button>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto space-y-8 pb-8 pt-2">
                {/* Horizontal Scroll Quick Options */}
                <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide shrink-0 pb-2">
                  {['Buy', 'Rent', 'New Projects', 'PG / Room', 'Commercial'].map(opt => (
                    <button key={opt} className="px-5 py-2.5 bg-luxury-surface shadow-neo-dark-sm rounded-full text-xs font-semibold whitespace-nowrap text-luxury-cream transition-all hover:text-luxury-citrus hover:shadow-glow-sm active:shadow-neo-dark-inset border border-luxury-border/50">
                      {opt}
                    </button>
                  ))}
                </div>

                {filteredProperties.length > 0 ? (
                  <>
                    {/* Recommended Properties Grid (2x2) */}
                    <section className="px-4">
                      <h2 className="text-xl font-bold mb-4 tracking-tight text-luxury-cream">Recommended</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {filteredProperties.slice(0, 4).map(p => (
                          <SmallPropertyCard key={p.id} property={p} onClick={() => handleViewProperty(p)} />
                        ))}
                      </div>
                    </section>

                    {/* Dynamic Recommendations Section (Horizontal Scroll) */}
                    <section>
                      <h2 className="text-xl font-bold px-4 mb-4 tracking-tight text-luxury-cream">Curated for You</h2>
                      <div className="flex gap-6 px-4 pb-6 overflow-x-auto scrollbar-hide">
                        {filteredProperties.map(p => (
                            <div key={p.id} className="w-[85vw] max-w-sm shrink-0">
                              <PropertyCard property={p} onClick={() => handleViewProperty(p)} />
                            </div>
                        ))}
                      </div>
                    </section>
                  </>
                ) : (
                    <div className="px-4 py-12 text-center text-luxury-text">
                      <p className="text-xl font-bold text-luxury-cream">No results found {searchQuery ? `for "${searchQuery}"` : ''}</p>
                      <p className="mt-4 text-sm opacity-70">Try searching for common types like:</p>
                      <div className="flex flex-wrap gap-3 justify-center mt-6">
                        {['Apartment', 'House', 'Villa', 'PG', 'Commercial'].map(type => (
                            <button 
                                key={type} 
                                onClick={() => {
                                    setSearchQuery(type);
                                    setFilters(prev => ({...prev, propertyType: type}));
                                }}
                                className="px-5 py-2.5 bg-luxury-surface border border-luxury-border/30 rounded-full text-xs font-semibold text-luxury-citrus transition-all hover:border-luxury-citrus"
                            >
                                {type}
                            </button>
                        ))}
                      </div>
                    </div>
                )}
                
                <Footer 
                  onContactClick={() => setIsContactOpen(true)}
                  onFeedbackClick={() => setIsFeedbackOpen(true)}
                  onAboutClick={() => setIsAboutOpen(true)}
                />
              </main>
            </motion.div>
          ) : currentView === 'profile' ? (
            <motion.div key="profile" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <ProfileView 
                onSettingsClick={() => setCurrentView('settings')} 
                setCurrentView={setCurrentView}
                profileImage={profileImage}
                onUpdateImage={setProfileImage}
                userProfile={userProfile}
                myProperties={myProperties}
                onPropertyClick={handleViewProperty}
                onDeleteProperty={handleDeleteProperty}
                onEditProperty={(p) => {
                    setEditingProperty(p);
                    setCurrentView('post-property');
                }}
                onVisibilityChange={async (id, visibility) => {
                  try {
                    await updateDoc(doc(db, 'properties', id), { visibility });
                  } catch (err) {
                    console.error("Error updating visibility:", err);
                  }
                }}
                onSaleStatusChange={async (id, saleStatus) => {
                  try {
                    await updateDoc(doc(db, 'properties', id), { saleStatus });
                  } catch (err) {
                    console.error("Error updating sale status:", err);
                  }
                }}
                onShareQR={(p) => console.log('Share QR', p.id)}
                onViewStats={(p) => console.log('Stats', p.id)}
              />
            </motion.div>
          ) : currentView === 'owner-profile' ? (
            <motion.div key="owner-profile" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <ProfileView 
                profileImage="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256" // Simple fallback
                onUpdateImage={() => {}}
                userProfile={activeOwnerProfile}
                myProperties={activeOwnerId ? allProperties.filter(p => p.ownerId === activeOwnerId) : []}
                onPropertyClick={(p) => {
                    handleViewProperty(p);
                    setCurrentView('home'); // Go to home to show the PropertyDetailsView
                }}
              />
              <button onClick={() => setCurrentView('home')} className="fixed top-4 left-4 z-50 p-3 bg-black/50 rounded-full backdrop-blur-md text-white">
                <X />
              </button>
            </motion.div>
          ) : currentView === 'settings' ? (
            <motion.div key="settings" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <SettingsView 
                onBack={() => setCurrentView('profile')} 
                profileImage={profileImage}
                onUpdateImage={setProfileImage}
                themeMode={themeMode}
                onThemeChange={setThemeMode}
                onEditProfile={() => setCurrentView('edit-profile')}
                userProfile={userProfile}
                onLogout={async () => {
                  await signOut(auth);
                  setIsAuthenticated(false);
                }}
                onContactClick={() => setIsContactOpen(true)}
                onFaqClick={() => setIsFaqOpen(true)}
                onFeedbackClick={() => setIsFeedbackOpen(true)}
                onAboutClick={() => setIsAboutOpen(true)}
              />
            </motion.div>
          ) : currentView === 'edit-profile' ? (
            <motion.div key="edit" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <EditProfileView
                onBack={() => setCurrentView('profile')}
                profileImage={profileImage}
                onUpdateImage={setProfileImage}
                userProfile={userProfile}
                onSaveProfile={(newProfile) => setUserProfile(newProfile)}
              />
            </motion.div>
          ) : currentView === 'post-property' ? (
            <motion.div key="post" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <PostPropertyView
                onBack={() => {
                    setEditingProperty(null);
                    setCurrentView('profile');
                }}
                editProperty={editingProperty || undefined}
                userProfile={userProfile}
                onContactClick={() => setIsContactOpen(true)}
                onFeedbackClick={() => setIsFeedbackOpen(true)}
                onAboutClick={() => setIsAboutOpen(true)}
              />
            </motion.div>
          ) : currentView === 'rent-property' ? (
            <motion.div key="rent" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <PostPropertyView
                onBack={() => setCurrentView('home')}
                userProfile={userProfile}
                initialPurpose="Rent"
                onContactClick={() => setIsContactOpen(true)}
                onFeedbackClick={() => setIsFeedbackOpen(true)}
                onAboutClick={() => setIsAboutOpen(true)}
              />
            </motion.div>
          ) : currentView === 'pg-property' ? (
            <motion.div key="pg" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <PostPropertyView
                onBack={() => setCurrentView('home')}
                userProfile={userProfile}
                initialPurpose="Rent"
                initialPropertyType="PG"
                onContactClick={() => setIsContactOpen(true)}
                onFeedbackClick={() => setIsFeedbackOpen(true)}
                onAboutClick={() => setIsAboutOpen(true)}
              />
            </motion.div>
          ) : currentView === 'commercial-property' ? (
            <motion.div key="commercial" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <PostPropertyView
                onBack={() => setCurrentView('home')}
                userProfile={userProfile}
                initialPurpose="Rent"
                initialPropertyType="Commercial Shop"
                onContactClick={() => setIsContactOpen(true)}
                onFeedbackClick={() => setIsFeedbackOpen(true)}
                onAboutClick={() => setIsAboutOpen(true)}
              />
            </motion.div>
          ) : currentView === 'sell-property' ? (
            <motion.div key="sell" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
              <SellPropertyView
                onBack={() => setCurrentView('home')}
                onPublish={(prop) => setMyProperties([...myProperties, prop])}
                userProfile={userProfile}
              />
            </motion.div>
          ) : null}
          </AnimatePresence>

      {/* Fixed Bottom Navigation */}
      {!activeProperty && currentView !== 'settings' && currentView !== 'edit-profile' && currentView !== 'post-property' && (
        <nav className="fixed bottom-4 left-4 right-4 h-16 bg-luxury-surface/80 backdrop-blur-xl rounded-[24px] shadow-glass border border-white/5 flex items-center justify-around z-50 px-2">
          <button 
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center gap-1.5 font-bold text-[10px] transition-colors ${currentView === 'home' ? 'text-luxury-citrus drop-shadow-[0_0_8px_rgba(255,182,39,0.5)]' : 'text-luxury-text/50 hover:text-luxury-cream'}`}
          >
            <Home size={22} strokeWidth={2.5}/>
            Rent
          </button>
          <button 
            onClick={() => setIsActionMenuOpen(true)}
            className={`-mt-8 rounded-full p-4 border-[4px] border-luxury-bg shadow-glow transition-all duration-300 ${isActionMenuOpen ? 'bg-luxury-surface text-luxury-citrus scale-110 shadow-glow' : 'bg-gradient-to-br from-luxury-citrus to-luxury-citrus-light text-[black] hover:scale-105 active:scale-95'}`}
          >
            <Plus size={28} className={`transition-transform duration-300 ${isActionMenuOpen ? 'rotate-45' : ''}`} />
          </button>
          <button 
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center gap-1.5 font-semibold text-[10px] transition-colors ${currentView === 'profile' ? 'text-luxury-citrus drop-shadow-[0_0_8px_rgba(255,182,39,0.5)]' : 'text-luxury-text/50 hover:text-luxury-cream'}`}
          >
            <User size={22} strokeWidth={2.5}/>
            Profile
          </button>
        </nav>
      )}

      <ActionMenuModal 
        isOpen={isActionMenuOpen} 
        onClose={() => setIsActionMenuOpen(false)} 
        onAction={(id) => {
          if (id === 'post') {
            setCurrentView('post-property');
          } else if (id === 'sell') {
            setCurrentView('sell-property');
          } else if (id === 'rent') {
            setCurrentView('rent-property');
          } else if (id === 'pg') {
            setCurrentView('pg-property');
          } else if (id === 'commercial') {
            setCurrentView('commercial-property');
          } else {
            console.log('Action selected:', id);
          }
        }}
      />
      <FilterModal 
        isOpen={isFilterMenuOpen} 
        onClose={() => setIsFilterMenuOpen(false)} 
        onApply={(f) => setFilters(f)}
      />
      <CommunicationPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        properties={allProperties.filter(p => !(p.visibility === 'private' && p.ownerId !== auth.currentUser?.uid))}
        onPropertyClick={handleViewProperty}
        setSearchQuery={setSearchQuery}
      />
      {isAdminPanelOpen && <AdminPanelView onClose={() => setIsAdminPanelOpen(false)} />}
      {isContactOpen && <ContactSupport onClose={() => setIsContactOpen(false)} />}
      {isFaqOpen && <FAQs onClose={() => setIsFaqOpen(false)} />}
      {isFeedbackOpen && <ShareFeedback onClose={() => setIsFeedbackOpen(false)} />}
      {isAboutOpen && <AboutUs onClose={() => setIsAboutOpen(false)} />}
        </>
      )}
    </div>
  );
}
