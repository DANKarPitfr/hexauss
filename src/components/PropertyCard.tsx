import React from 'react';
import { Heart, CheckCircle2, Eye } from 'lucide-react';
import { Property } from '../constants';
import StarRating from './StarRating';

export function PropertyCardSkeleton() {
  return (
    <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-3xl p-3 border border-luxury-border shadow-neo-dark mb-1 animate-pulse">
      <div className="relative h-60 rounded-2xl overflow-hidden mb-4 bg-luxury-surface/50"></div>
      <div className="px-2">
        <div className="h-6 w-1/3 bg-luxury-surface/60 rounded-lg mb-2"></div>
        <div className="h-5 w-full bg-luxury-surface/60 rounded-lg mb-2"></div>
        <div className="h-4 w-2/3 bg-luxury-surface/60 rounded-lg mb-5"></div>
        <div className="flex gap-4">
          <div className="h-8 w-20 bg-luxury-surface/60 rounded-xl"></div>
          <div className="h-8 w-20 bg-luxury-surface/60 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

const PropertyCard = React.memo(({ 
  property,
  onClick,
}: { 
  property: Property;
  onClick?: () => void;
  key?: string | number;
}) => {
  return (
    <div onClick={onClick} className="bg-luxury-surface/60 backdrop-blur-sm rounded-3xl p-3 border border-luxury-border shadow-neo-dark transition-all hover:shadow-glow-sm cursor-pointer group mb-1">
      <div className="relative h-60 rounded-2xl overflow-hidden mb-4 shadow-neo-dark-inset">
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-transparent z-10 pointer-events-none"></div>
        <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            <div className="flex items-center gap-1.5 bg-luxury-bg/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-luxury-cream shadow-glass border border-white/10">
                <CheckCircle2 size={14} fill="currentColor" strokeWidth={1} className="text-luxury-citrus drop-shadow-[0_0_5px_rgba(255,182,39,0.8)]" />
                Verified
            </div>
            {(property.saleStatus === 'rented' || property.saleStatus === 'sold') && (
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold text-luxury-cream shadow-glass border border-white/10 ${property.saleStatus === 'rented' ? 'bg-blue-500/80' : 'bg-red-500/80'}`}>
                    {property.saleStatus.toUpperCase()}
                </div>
            )}
        </div>
        <button className="absolute top-3 right-3 p-2.5 bg-luxury-bg/60 rounded-full backdrop-blur-md shadow-glass hover:shadow-glow-sm transition-shadow text-luxury-text border border-white/10 z-20">
          <Heart size={18} className="text-luxury-text hover:fill-luxury-citrus hover:text-luxury-citrus transition-colors" />
        </button>
      </div>
      <div className="px-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-2xl font-bold text-luxury-citrus tracking-tight drop-shadow-[0_0_8px_rgba(255,182,39,0.3)]">{property.price}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-luxury-text/60">
                <Eye size={14} className="text-luxury-citrus" />
                <span>{property.views || 0}</span>
            </div>
            <StarRating rating={property.rating} />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-luxury-cream mb-1 truncate">{property.title}</h3>
        <p className="text-sm text-luxury-text/60 mb-5">{property.location}</p>
        <div className="flex gap-4 text-xs font-bold text-luxury-cream">
          <span className="bg-luxury-bg shadow-neo-dark-sm px-3 py-1.5 rounded-xl border border-luxury-border/30">{typeof property.bhk === 'number' ? `${property.bhk} Bedroom` : property.bhk}</span>
          <span className="bg-luxury-bg shadow-neo-dark-sm px-3 py-1.5 rounded-xl border border-luxury-border/30">{property.area}</span>
        </div>
      </div>
    </div>
  );
});

export default PropertyCard;
