import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Share2,
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Car,
  Wifi,
  Shield,
  Zap,
  Phone,
  MessageCircle,
  Map as MapIcon,
  Expand,
  X,
} from "lucide-react";
import { Property } from "../constants";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../firebase";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import SmallPropertyCard from "./SmallPropertyCard";
import StarRating from "./StarRating";
import MapModal from "./MapModal";
import ShareModal from "./ShareModal";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 14);
  }, [position, map]);
  return null;
}

interface PropertyDetailsViewProps {
  property: Property;
  onBack: () => void;
  onPropertyClick: (property: Property) => void;
  onOwnerClick?: (ownerId: string) => void;
}

export default function PropertyDetailsView({
  property,
  onBack,
  onPropertyClick,
  onOwnerClick,
}: PropertyDetailsViewProps) {
  const handleShare = () => {
    setIsShareOpen(true);
  };

  const images =
    property.images && property.images.length > 0
      ? property.images
      : [
          property.image,
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        ];

  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showWaError, setShowWaError] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [isWaLoading, setIsWaLoading] = useState(false);

  useEffect(() => {
    if (!property.id || (auth.currentUser && property.ownerId === auth.currentUser.uid)) return;

    const viewed = JSON.parse(localStorage.getItem('viewedProperties') || '{}');
    const lastViewed = viewed[property.id];
    const now = Date.now();

    // Only increment if not viewed in the last 24 hours
    if (!lastViewed || (now - lastViewed) > 24 * 60 * 60 * 1000) {
      const propertyRef = doc(db, 'properties', property.id);
      updateDoc(propertyRef, {
        views: increment(1)
      });
      
      viewed[property.id] = now;
      localStorage.setItem('viewedProperties', JSON.stringify(viewed));
    }
  }, [property.id, property.ownerId]);

  const handleWhatsAppClick = () => {
    if (!property.phoneNumber) {
      setShowWaError(true);
      setTimeout(() => setShowWaError(false), 3000);
      return;
    }

    setIsWaLoading(true);
    setTimeout(() => {
      const message = "Hello, I saw your property listing on HexaEstates and I’m interested. Please share more details.";
      window.open(`https://wa.me/${property.phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
      setIsWaLoading(false);
    }, 800);
  };

  const handleCallOwnerClick = () => {
    if (!property.phoneNumber) {
      setShowPhoneError(true);
      setTimeout(() => setShowPhoneError(false), 3000);
      return;
    }
    window.location.href = `tel:${property.phoneNumber}`;
  };

  const lat =
    property.lat ||
    (property.location.toLowerCase().includes("bangalore")
      ? 12.9716
      : property.location.toLowerCase().includes("mumbai")
        ? 19.076
        : property.location.toLowerCase().includes("delhi")
          ? 28.7041
          : 19.076);
  const lng =
    property.lng ||
    (property.location.toLowerCase().includes("bangalore")
      ? 77.5946
      : property.location.toLowerCase().includes("mumbai")
        ? 72.8777
        : property.location.toLowerCase().includes("delhi")
          ? 77.1025
          : 72.8777);
  const mapCenter: [number, number] = [lat, lng];

  const amenityIcons: Record<string, React.ElementType> = {
    Parking: Car,
    WiFi: Wifi,
    AC: Zap,
    Balcony: Square,
    Security: Shield,
    "Power Backup": Zap,
    Lift: Zap,
  };

  const propertyAmenities = property.amenities || [
    "Parking",
    "WiFi",
    "AC",
    "Balcony",
    "Security",
    "Power Backup",
  ];
  const description =
    property.description ||
    `Welcome to this exquisite ${property.bhk} residence located in the heart of ${property.location}. This property features ultra-modern architecture, premium vitrified flooring, and state-of-the-art modular kitchen. Experience a lifestyle of unmatched luxury and convenience with 24x7 security, panoramic views, and close proximity to top schools, hospitals, and malls. Perfect for families looking for a premium lifestyle in India.`;
  const ownerName = property.ownerName || "Rajesh";

  const relatedProperties: Property[] = [];

  return (
    <div className="flex-1 overflow-y-auto bg-luxury-bg font-sans text-luxury-text z-40 fixed inset-0 flex flex-col pb-6 scroll-smooth">
      {/* Top Image Section */}
      <div className="relative h-[45vh] w-full shrink-0">
        <div
          className="absolute inset-0 bg-black cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        >
          <img
            src={images[activeImage]}
            alt={property.title}
            className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-bg via-transparent to-black/30 pointer-events-none"></div>
        </div>

        {/* Header overlays */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 pt-safe">
          <button
            onClick={onBack}
            className="p-2.5 bg-black/30 backdrop-blur-md rounded-full shadow-glass border border-white/10 text-white hover:bg-black/50 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="p-2.5 bg-black/30 backdrop-blur-md rounded-full shadow-glass border border-white/10 text-white hover:bg-black/50 transition-colors"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="p-2.5 bg-black/30 backdrop-blur-md rounded-full shadow-glass border border-white/10 text-white hover:bg-black/50 transition-colors"
            >
              <Heart
                size={20}
                className={
                  isSaved ? "fill-luxury-citrus text-luxury-citrus" : ""
                }
              />
            </button>
          </div>
        </div>

        {/* View Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-6 right-4 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full shadow-glass border border-white/10 text-white hover:bg-black/60 transition-colors"
        >
          <Expand size={16} />
        </button>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? "w-6 bg-luxury-citrus" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-luxury-bg relative -mt-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 pb-28">
        <div className="w-12 h-1.5 bg-luxury-border/50 rounded-full mx-auto mt-3 mb-4"></div>

        <div className="px-5 space-y-6">
          {/* Main Info */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-luxury-cream tracking-tight leading-tight flex-1">
                {property.title}
              </h1>
              {(property.saleStatus === 'rented' || property.saleStatus === 'sold') && (
                  <span className={`ml-2 px-3 py-1 rounded-lg text-xs font-bold text-luxury-cream shadow-glass border border-white/10 ${property.saleStatus === 'rented' ? 'bg-blue-500/80' : 'bg-red-500/80'}`}>
                      {property.saleStatus.toUpperCase()}
                  </span>
              )}
            </div>
            <div onClick={() => setIsMapOpen(true)} className="flex items-center gap-2 text-luxury-text/70 mb-2 cursor-pointer hover:text-luxury-citrus">
              <MapPin size={14} className="text-luxury-citrus" />
              <span className="text-sm font-medium">{property.location}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <StarRating rating={property.rating} reviewCount={property.reviewCount} />
              <button 
                onClick={() => setIsMapOpen(true)} 
                className="p-2 bg-luxury-surface/60 rounded-full border border-luxury-border/30 text-luxury-citrus hover:bg-luxury-surface transition-colors"
                aria-label="View on map"
              >
                <MapIcon size={18} />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <span className="px-2 py-1 bg-luxury-surface/60 border border-luxury-border/30 rounded text-[10px] uppercase tracking-wider font-bold text-luxury-cream">
                Flat
              </span>
              <span className="px-2 py-1 bg-luxury-surface/60 border border-luxury-border/30 rounded text-[10px] uppercase tracking-wider font-bold text-luxury-cream">
                Semi-Furnished
              </span>
            </div>
            
            {property.videoUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-luxury-border shadow-neo-dark-sm">
                    <video src={property.videoUrl} className="w-full aspect-video object-cover" controls />
                </div>
            )}

            <div className="flex items-end gap-3 mb-1">
              <span className="text-3xl font-black text-luxury-citrus tracking-tight drop-shadow-[0_0_8px_rgba(255,182,39,0.2)]">
                {property.price}
              </span>
            </div>
          </div>


          {/* Key Features Line */}
          <div className="flex justify-between items-center py-4 border-y border-luxury-border/30 px-2">
            <div className="flex flex-col items-center gap-1">
              <BedDouble size={20} className="text-luxury-citrus/80" />
              <span className="text-xs font-bold text-luxury-cream">
                {property.bhk}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-luxury-border/50" />
            <div className="flex flex-col items-center gap-1">
              <Bath size={20} className="text-luxury-citrus/80" />
              <span className="text-xs font-bold text-luxury-cream">
                2 Baths
              </span>
            </div>
            <div className="w-[1px] h-8 bg-luxury-border/50" />
            <div className="flex flex-col items-center gap-1">
              <Square size={20} className="text-luxury-citrus/80" />
              <span className="text-xs font-bold text-luxury-cream">
                {property.area}
              </span>
            </div>
          </div>

          {/* Description */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-luxury-text/60 mb-3">
              Description
            </h3>
            <div className="bg-luxury-surface/40 p-4 rounded-2xl border border-luxury-border/30 shadow-neo-dark-sm">
              <p
                className={`text-sm text-luxury-cream/80 leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}
              >
                {description}
              </p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-luxury-citrus text-xs font-bold mt-2 hover:underline"
              >
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-luxury-text/60 mb-3">
              Amenities
            </h3>
            <div className="flex flex-wrap gap-3">
              {propertyAmenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Zap;
                return (
                  <div
                    key={amenity}
                    className="flex flex-col items-center justify-center p-3 w-[72px] h-[72px] bg-luxury-surface/50 border border-luxury-border/30 rounded-2xl shadow-neo-dark-sm"
                  >
                    <Icon size={20} className="text-luxury-citrus mb-2" />
                    <span className="text-[9px] font-bold text-luxury-cream text-center leading-tight">
                      {amenity}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Map Location */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-luxury-text/60 mb-3">
              Location
            </h3>
            <div className="bg-luxury-surface/40 p-2 rounded-[24px] border border-luxury-border/30 shadow-neo-dark-sm space-y-3">
              <div onClick={() => setIsMapOpen(true)} className="w-full h-40 bg-luxury-bg rounded-2xl overflow-hidden relative z-0 cursor-pointer">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  className="w-full h-full z-0"
                  zoomControl={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution="&copy; CARTO"
                  />
                  <Marker position={mapCenter} icon={customIcon} />
                  <MapUpdater position={mapCenter} />
                </MapContainer>
              </div>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${mapCenter[0]},${mapCenter[1]}`,
                    "_blank",
                  )
                }
                className="w-full py-3 bg-luxury-bg border border-luxury-border/40 rounded-xl flex justify-center items-center gap-2 text-luxury-citrus text-sm font-bold shadow-neo-dark-inset"
              >
                <MapIcon size={16} /> Open in Maps
              </button>
            </div>
          </section>

          {/* Related Properties */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-luxury-text/60 mb-3">
              Listed By
            </h3>
            <div onClick={() => onOwnerClick?.(property.ownerId || '')} className="flex items-center gap-4 bg-luxury-surface/40 p-4 rounded-2xl border border-luxury-border/30 shadow-neo-dark-sm mb-6 cursor-pointer hover:bg-luxury-surface/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-luxury-citrus/20 border border-luxury-citrus/50 flex flex-col items-center justify-center text-luxury-citrus shadow-glow-sm shrink-0">
                <span className="font-bold text-lg leading-none">
                  {ownerName.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-luxury-cream">{ownerName}</h4>
                <p className="text-[10px] uppercase tracking-widest text-luxury-text/60">
                  Verified Owner
                </p>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-widest text-luxury-text/60 mb-3">
              Similar Properties
            </h3>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar">
              {relatedProperties.map((p) => (
                <div key={p.id} className="min-w-[240px] snap-start">
                  <SmallPropertyCard
                    property={p}
                    onClick={() => {
                      // Scroll to top and switch property
                      onPropertyClick(p);
                      window.scrollTo(0, 0);
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-luxury-surface/90 backdrop-blur-xl border-t border-luxury-border/50 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] z-50">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <motion.button 
            whileTap={{scale: 0.95}}                
            onClick={handleWhatsAppClick}
            className={`w-12 h-12 border border-green-500/30 rounded-2xl flex items-center justify-center shrink-0 shadow-neo-dark-sm cursor-pointer transition-colors ${isWaLoading ? 'bg-green-500/20' : 'bg-green-500/10 hover:bg-green-500/20'}`}
          >
            {isWaLoading ? (
              <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <MessageCircle className="text-green-400" size={24} />
            )}
          </motion.button>
          <button 
            onClick={handleCallOwnerClick}
            className="flex-1 bg-luxury-citrus hover:bg-luxury-citrus-light text-[#121212] py-3.5 rounded-2xl font-bold shadow-[0_0_15px_rgba(255,182,39,0.3)] hover:shadow-[0_0_25px_rgba(255,182,39,0.5)] transition-all flex justify-center items-center gap-2 active:scale-95"
          >
            <Phone size={18} /> Call Owner
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showWaError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-20 left-4 right-4 z-[100] bg-red-500/90 text-white p-4 rounded-2xl text-center font-bold shadow-lg"
          >
            Owner WhatsApp not available
          </motion.div>
        )}
        {showPhoneError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-20 left-4 right-4 z-[100] bg-red-500/90 text-white p-4 rounded-2xl text-center font-bold shadow-lg"
          >
            Owner phone number not available
          </motion.div>
        )}
      </AnimatePresence>

      <MapModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        center={mapCenter}
        title={property.title}
      />
      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        property={property}
      />
      {/* Fullscreen Image Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col touch-none">
          <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10">
            <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white tracking-widest">
              {activeImage + 1} / {images.length}
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2.5 bg-black/50 backdrop-blur-md rounded-full shadow-glass border border-white/10 text-white hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.img
                key={activeImage}
                src={images[activeImage]}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="max-h-full max-w-full object-contain cursor-grab"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = -offset.x;
                  if (swipe > 100) {
                     setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                  } else if (swipe < -100) {
                     setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                  }
                }}
              />
            </AnimatePresence>
          </div>
          
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`transition-all duration-300 rounded-full ${activeImage === idx ? "w-8 h-2 bg-luxury-citrus" : "w-2 h-2 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
