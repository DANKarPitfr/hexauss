import React from 'react';
import { Eye, MoreVertical, Edit, Globe, Lock, CheckCircle, DollarSign, QrCode, BarChart, Trash } from 'lucide-react';
import { Property } from '../constants';

interface ManagePropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onVisibilityChange: (propertyId: string, visibility: 'public' | 'private') => void;
  onSaleStatusChange: (propertyId: string, saleStatus: 'rented' | 'sold' | null) => void;
  onShareQR: (property: Property) => void;
  onViewStats: (property: Property) => void;
  onDelete: (propertyId: string) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export const ManagePropertyCard = React.memo(({ property, onEdit, onVisibilityChange, onSaleStatusChange, onShareQR, onViewStats, onDelete, isMenuOpen, onToggleMenu }: ManagePropertyCardProps) => {
  return (
    <div className={`bg-luxury-surface/60 backdrop-blur-sm rounded-[20px] p-3 border border-luxury-border shadow-neo-dark-sm mb-4 relative ${isMenuOpen ? 'z-50' : 'z-auto'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
           <img src={property.image} alt={property.title} className="w-16 h-16 rounded-xl object-cover shadow-neo-dark-inset" loading="lazy" />
           <div>
             <h4 className="text-sm font-bold text-luxury-cream truncate max-w-[150px]">{property.title}</h4>
             <div className="flex gap-1 mt-1">
                 {property.visibility && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        property.visibility === 'public' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>{property.visibility}</span>
                 )}
                 {property.saleStatus && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        property.saleStatus === 'rented' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                    }`}>{property.saleStatus}</span>
                 )}
             </div>
           </div>
        </div>
        <button onClick={onToggleMenu} className="text-luxury-text hover:text-luxury-citrus">
          <MoreVertical size={20} />
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-12 right-3 w-48 bg-luxury-surface border border-luxury-border rounded-xl shadow-xl z-[60] p-2 text-xs">
          <button onClick={() => {onEdit(property); onToggleMenu();}} className="w-full text-left p-2 hover:bg-luxury-bg flex items-center gap-2"><Edit size={14} /> Edit</button>
          <button onClick={() => {onVisibilityChange(property.id, 'public'); onToggleMenu();}} className="w-full text-left p-2 hover:bg-luxury-bg flex items-center gap-2"><Globe size={14} /> Make Public</button>
          <button onClick={() => {onVisibilityChange(property.id, 'private'); onToggleMenu();}} className="w-full text-left p-2 hover:bg-luxury-bg flex items-center gap-2"><Lock size={14} /> Make Private</button>
          <button onClick={() => {onSaleStatusChange(property.id, 'rented'); onToggleMenu();}} className="w-full text-left p-2 hover:bg-luxury-bg flex items-center gap-2"><CheckCircle size={14} /> Mark Rented</button>
          <button onClick={() => {onSaleStatusChange(property.id, 'sold'); onToggleMenu();}} className="w-full text-left p-2 hover:bg-luxury-bg flex items-center gap-2"><DollarSign size={14} /> Mark Sold</button>
          <button onClick={() => {onSaleStatusChange(property.id, null); onToggleMenu();}} className="w-full text-left p-2 hover:bg-luxury-bg flex items-center gap-2"><CheckCircle size={14} /> Reset Sale</button>
          <button onClick={() => {onShareQR(property); onToggleMenu();}} className="w-full text-left p-2 hover:bg-luxury-bg flex items-center gap-2"><QrCode size={14} /> Share QR</button>
          <button onClick={() => {onViewStats(property); onToggleMenu();}} className="w-full text-left p-2 hover:bg-luxury-bg flex items-center gap-2"><BarChart size={14} /> Statistics</button>
          <button onClick={() => { 
            console.log("Delete button clicked for:", property.id);
            if (window.confirm('Are you sure you want to delete this property?')) { 
              onDelete(property.id); 
            } 
            onToggleMenu(); 
          }} className="w-full text-left p-2 hover:bg-luxury-bg flex items-center gap-2 text-red-400"><Trash size={14} /> Delete</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-luxury-border/30 text-center">
          <div>
              <p className="text-[10px] text-luxury-text/60">Views</p>
              <p className="text-sm font-bold text-luxury-cream">{property.views || 0}</p>
          </div>
          <div>
              <p className="text-[10px] text-luxury-text/60">QR</p>
              <p className="text-sm font-bold text-luxury-cream">{property.qrScans || 0}</p>
          </div>
          <div>
              <p className="text-[10px] text-luxury-text/60">Profile</p>
              <p className="text-sm font-bold text-luxury-cream">{property.profileVisits || 0}</p>
          </div>
          <div>
              <p className="text-[10px] text-luxury-text/60">Chat</p>
              <p className="text-sm font-bold text-luxury-cream">{property.chatRequests || 0}</p>
          </div>
      </div>
    </div>
  );
});
