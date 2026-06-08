import { motion, AnimatePresence } from 'motion/react';
import { Home, Tag, Key, BedDouble, Building, X } from 'lucide-react';

interface ActionMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (id: string) => void;
}

export default function ActionMenuModal({ isOpen, onClose, onAction }: ActionMenuModalProps) {
  const options = [
    { id: 'post', label: 'Post Property', icon: Home, color: 'text-luxury-citrus' },
    { id: 'rent', label: 'Rent Out Property', icon: Key, color: 'text-green-400' },
    { id: 'pg', label: 'Add PG / Room', icon: BedDouble, color: 'text-purple-400' },
    { id: 'commercial', label: 'Commercial Listing', icon: Building, color: 'text-orange-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glassmorphism Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />
          
          {/* Floating Action Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
            className="fixed bottom-28 left-4 right-4 z-[70] flex flex-col gap-3 pointer-events-none"
          >
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: 0, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                className="w-full bg-luxury-surface/80 backdrop-blur-md border border-luxury-border/30 rounded-2xl p-4 flex items-center gap-4 shadow-glass hover:shadow-glow-sm hover:border-luxury-citrus/50 hover:bg-luxury-surface active:scale-[0.98] transition-all group pointer-events-auto"
                onClick={() => {
                  onAction(option.id);
                  onClose();
                }}
              >
                <div className="w-12 h-12 bg-luxury-bg/80 rounded-full shadow-neo-dark-inset flex items-center justify-center border border-luxury-border/20 group-hover:border-luxury-citrus/40 transition-colors">
                  <option.icon size={22} className={`${option.color}`} />
                </div>
                <span className="font-semibold text-lg text-luxury-cream group-hover:text-luxury-citrus-light transition-colors">
                  {option.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
