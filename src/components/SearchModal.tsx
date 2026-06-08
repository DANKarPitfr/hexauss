import React, { useState, useEffect } from 'react';
import { X, Search, Clock, TrendingUp } from 'lucide-react';
import { Property } from '../constants';
import SmallPropertyCard from './SmallPropertyCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onPropertyClick: (p: Property) => void;
  setSearchQuery: (query: string) => void;
}

const TRENDING_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Indore'];

export default function SearchModal({ isOpen, onClose, properties, onPropertyClick, setSearchQuery }: SearchModalProps) {
  const [localQuery, setLocalQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(localQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(localQuery.toLowerCase()) ||
    (p.type && p.type.toLowerCase().includes(localQuery.toLowerCase())) ||
    (p.description && p.description.toLowerCase().includes(localQuery.toLowerCase()))
  );

  const handleSearch = (query: string) => {
    if (!query) return;
    setSearchQuery(query);
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-luxury-surface/95 backdrop-blur-xl border border-luxury-citrus/20 rounded-[32px] overflow-hidden shadow-neo-dark animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-luxury-border flex items-center gap-3">
          <Search className="text-luxury-citrus" size={20} />
          <input
            type="text"
            placeholder="Search properties, cities, PGs..."
            className="flex-1 bg-transparent text-luxury-cream outline-none placeholder:text-luxury-text/40"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(localQuery)}
            autoFocus
          />
          <button onClick={onClose} className="text-luxury-text/60 hover:text-luxury-cream">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
          {localQuery ? (
            <div className="space-y-3">
               <h3 className="text-sm font-semibold text-luxury-text/60">Results</h3>
                {filteredProperties.length > 0 ? (
                    filteredProperties.map(p => (
                        <div key={p.id} onClick={() => { handleSearch(localQuery); onPropertyClick(p); }}>
                            <SmallPropertyCard property={p} />
                        </div>
                    ))
                ) : (
                    <p className="text-center py-4 text-luxury-text/50">No properties found.</p>
                )}
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold text-luxury-text/60 mb-3 flex items-center gap-2"><Clock size={16}/> Recent</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.length > 0 ? recentSearches.map(s => (
                    <button key={s} onClick={() => { setLocalQuery(s); handleSearch(s); }} className="px-3 py-1 bg-luxury-bg rounded-lg text-xs hover:bg-luxury-surface border border-white/5">{s}</button>
                  )) : <p className="text-xs text-luxury-text/40">No recent searches</p>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-luxury-text/60 mb-3 flex items-center gap-2"><TrendingUp size={16}/> Trending</h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_CITIES.map(c => (
                    <button key={c} onClick={() => { setLocalQuery(c); handleSearch(c); }} className="px-3 py-1 bg-luxury-bg rounded-lg text-xs hover:bg-luxury-surface border border-white/5 text-luxury-citrus">{c}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
