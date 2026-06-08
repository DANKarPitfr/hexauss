import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for leaflet markers
L.Marker.prototype.options.icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  center: [number, number];
  title: string;
}

export default function MapModal({ isOpen, onClose, center, title }: MapModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-4 z-[110] bg-luxury-bg rounded-3xl overflow-hidden flex flex-col border border-luxury-border shadow-2xl"
          >
            <div className="flex justify-between items-center p-4 border-b border-luxury-border">
              <h2 className="text-lg font-bold text-luxury-cream">{title}</h2>
              <button onClick={onClose} className="p-2 bg-luxury-surface rounded-full text-luxury-text hover:text-luxury-citrus">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 w-full h-full relative">
              <MapContainer
                center={center}
                zoom={16}
                zoomControl={true}
                className="w-full h-full"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution="&copy; CARTO"
                />
                <Marker position={center} />
              </MapContainer>
            </div>

            <div className="p-4 border-t border-luxury-border">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${center[0]},${center[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-luxury-citrus rounded-xl flex justify-center items-center gap-2 text-[#121212] text-sm font-bold shadow-glow-sm"
              >
                <MapPin size={16} /> Get Directions
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
