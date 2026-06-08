import React from 'react';
import { Eye } from 'lucide-react';
import { Property } from '../constants';

const SmallPropertyCard = React.memo(({ property, onClick }: { property: Property; onClick?: () => void; key?: string | number }) => {
  return (
    <div onClick={onClick} className="bg-luxury-surface/60 backdrop-blur-sm rounded-[20px] p-2 border border-luxury-border shadow-neo-dark-sm hover:shadow-glow-sm transition-shadow cursor-pointer mb-2">
      <div className="relative overflow-hidden rounded-[14px] mb-2 shadow-neo-dark-inset border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/60 via-transparent to-transparent z-10 pointer-events-none"></div>
          <img src={property.image} alt={property.title} className="w-full h-24 object-cover" loading="lazy" />
      </div>
      <div className="px-1 relative">
        <h4 className="text-sm font-bold text-luxury-cream truncate">{property.title}</h4>
        <p className="text-[10px] text-luxury-text/60 mb-1">{property.location}</p>
        <div className="flex justify-between items-center">
            <span className="text-sm font-black text-luxury-citrus block drop-shadow-[0_0_4px_rgba(255,182,39,0.3)]">{property.price}</span>
            <div className="flex items-center gap-1 text-[10px] text-luxury-text/60">
                <Eye size={10} className="text-luxury-citrus" />
                <span>{property.views || 0}</span>
            </div>
        </div>
      </div>
    </div>
  );
});

export default SmallPropertyCard;
