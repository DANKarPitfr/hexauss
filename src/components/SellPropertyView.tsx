import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MapPin, UploadCloud, Info, DollarSign, Home, BedDouble, Bath, Shield, Zap, CheckCircle2, Loader2, Phone, User, MessageCircle, Building, AlertCircle, Search, Calendar, Award } from 'lucide-react';
import { Property } from '../constants';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function LocationPicker({ position, setPosition, setLocation, setCity }: any) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
             const addressStr = data.address.road || data.address.suburb || data.display_name.split(',')[0] || '';
             const cityStr = data.address.city || data.address.town || data.address.village || data.address.county || '';
             if (addressStr) setLocation(addressStr);
             if (cityStr) setCity(cityStr);
          }
        }).catch(err => console.error("Geocoding failed", err));
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  )
}

function MapUpdater({ position }: { position: any }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [position, map]);
  return null;
}

interface SellPropertyViewProps {
  onBack: () => void;
  onPublish: (property: Property) => void;
  userProfile: any;
}

export default function SellPropertyView({ onBack, onPublish, userProfile }: SellPropertyViewProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  
  // State for form fields
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('Flat');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePublishClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    setIsPublishing(true);
    
    setTimeout(() => {
      const newProperty: Property = {
        id: `prop-${Date.now()}`,
        title,
        price: price.startsWith('₹') ? price : `₹${price}`,
        location: `${location}, ${city}`,
        image: images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
        bhk: '2 BHK',
        area: '1200 sqft',
        rating: 0,
        reviewCount: 0,
      };
      
      onPublish(newProperty);
      setIsPublishing(false);
      onBack();
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 font-sans text-luxury-text bg-luxury-bg z-50 fixed inset-0 flex flex-col pt-safe">
      <header className="sticky top-0 z-50 bg-luxury-bg/80 backdrop-blur-xl p-4 flex items-center justify-between border-b border-luxury-border/20">
        <button onClick={onBack} className="p-2 bg-luxury-surface rounded-full text-luxury-text border border-luxury-border/30">
          <ChevronLeft size={22} />
        </button>
        <div className="text-center">
            <h1 className="text-lg font-bold text-luxury-cream">Sell Property</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-4 space-y-8 pt-6 pb-20">
        <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-luxury-cream tracking-tight italic">List your property.</h2>
            <p className="text-sm text-luxury-text/70">Connect with serious buyers across India</p>
        </div>

        <section className="bg-luxury-surface/40 backdrop-blur-md rounded-3xl p-6 border border-luxury-border/30 shadow-neo-dark-sm space-y-6">
            <div className="space-y-4">
              <input type="text" placeholder="Property Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-2xl px-5 py-4 text-sm text-luxury-cream focus:border-luxury-citrus shadow-neo-dark-inset" />
              
              <div className="grid grid-cols-2 gap-4">
                  <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-2xl px-5 py-4 text-sm text-luxury-cream focus:border-luxury-citrus shadow-neo-dark-inset">
                    {['Flat', 'Villa', 'Plot', 'Commercial', 'House'].map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </select>
                  <input type="text" placeholder="Price (₹)" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-2xl px-5 py-4 text-sm text-luxury-cream focus:border-luxury-citrus shadow-neo-dark-inset" />
              </div>
            </div>
        </section>
        
        <div className="pt-4">
            <button 
                onClick={handlePublishClick}
                disabled={isPublishing}
                className="w-full bg-luxury-citrus text-[#121212] font-black py-4 rounded-2xl text-lg shadow-[0_0_20px_rgba(255,182,39,0.3)] active:scale-95 transition-all"
            >
                {isPublishing ? 'Publishing...' : 'Publish For Sale'}
            </button>
        </div>
      </main>
    </div>
  );
}
