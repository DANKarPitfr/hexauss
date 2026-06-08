import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal, Save } from 'lucide-react';
import { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { priceMax: number; bhk: string | null; propertyType: string | null }) => void;
}

export default function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const [priceMax, setPriceMax] = useState<number>(10000000);
  const [bhk, setBhk] = useState<string | null>(null);
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const propertyTypes = ['Apartment', 'Villa', 'PG', 'Commercial Shop'];
  const bhks = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];

  const handleSaveSearch = async () => {
    if (!auth.currentUser) {
      alert("Please log in to save searches.");
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'saved_searches'), {
        userId: auth.currentUser.uid,
        priceMax,
        bhk,
        propertyType,
        createdAt: new Date().toISOString()
      });
      alert("Search saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save search.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-luxury-bg rounded-t-[32px] p-6 pb-12 border-t border-luxury-border"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-luxury-cream">Filters</h2>
              <button onClick={onClose} className="p-2 bg-luxury-surface rounded-full text-luxury-text hover:text-luxury-citrus">
                <X size={20} />
              </button>
            </div>
            {/* ... rest of the code ... */}

            <div className="space-y-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-luxury-text mb-2">Max Price: ₹{priceMax.toLocaleString()}</label>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full h-2 bg-luxury-surface rounded-lg appearance-none cursor-pointer accent-luxury-citrus"
                />
              </div>

              {/* BHK */}
              <div>
                <label className="block text-sm font-semibold text-luxury-text mb-2">BHK</label>
                <div className="flex gap-2 flex-wrap">
                  {bhks.map(b => (
                    <button key={b} onClick={() => setBhk(bhk === b ? null : b)} className={`px-4 py-2 rounded-full text-sm font-medium border ${bhk === b ? 'bg-luxury-citrus text-[#121212] border-luxury-citrus' : 'bg-luxury-surface text-luxury-cream border-luxury-border'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-semibold text-luxury-text mb-2">Property Type</label>
                <div className="flex gap-2 flex-wrap">
                  {propertyTypes.map(t => (
                    <button key={t} onClick={() => setPropertyType(propertyType === t ? null : t)} className={`px-4 py-2 rounded-full text-sm font-medium border ${propertyType === t ? 'bg-luxury-citrus text-[#121212] border-luxury-citrus' : 'bg-luxury-surface text-luxury-cream border-luxury-border'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onApply({ priceMax, bhk, propertyType });
                  onClose();
                }}
                className="flex-1 mt-8 bg-luxury-citrus text-[#121212] font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                Apply Filters
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={isSaving}
                className="mt-8 bg-luxury-surface text-luxury-cream border border-luxury-border font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
