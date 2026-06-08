import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, MessageCircle, QrCode } from 'lucide-react';
import { Property } from '../constants';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export default function ShareModal({ isOpen, onClose, property }: ShareModalProps) {
  const shareUrl = window.location.href;
  const shareText = `Check out this property: ${property.title} in ${property.location}. Price: ${property.price}`;
  const [showQr, setShowQr] = useState(false);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    if (showQr) {
      QRCode.toDataURL(shareUrl).then(setQrCode);
    }
  }, [showQr, shareUrl]);

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        onClose();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[110] bg-luxury-bg rounded-t-[32px] p-6 border-t border-luxury-border"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-luxury-cream">{showQr ? 'Property QR Code' : 'Share Property'}</h2>
              <button onClick={onClose} className="p-2 bg-luxury-surface rounded-full text-luxury-text hover:text-luxury-citrus">
                <X size={20} />
              </button
              >
            </div>

            {showQr ? (
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl">
                 <img src={qrCode} alt="Property QR Code" className="w-48 h-48" />
                 <p className="text-luxury-bg mt-4 text-sm font-semibold">Scan to view property</p>
              </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={handleWhatsApp}
                    className="flex flex-col items-center justify-center gap-3 p-4 bg-luxury-surface rounded-2xl text-luxury-cream hover:bg-luxury-surface/80 transition-all border border-luxury-border"
                  >
                    <div className="p-3 bg-green-500 rounded-full text-white">
                      <MessageCircle size={24} />
                    </div>
                    <span className="text-sm font-semibold">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert('Link copied!');
                      onClose();
                    }}
                    className="flex flex-col items-center justify-center gap-3 p-4 bg-luxury-surface rounded-2xl text-luxury-cream hover:bg-luxury-surface/80 transition-all border border-luxury-border"
                  >
                      <div className="p-3 bg-gray-500 rounded-full text-white">
                        <Copy size={24} />
                      </div>
                      <span className="text-sm font-semibold">Copy Link</span>
                  </button>

                    <button
                   onClick={() => setShowQr(true)}
                   className="flex flex-col items-center justify-center gap-3 p-4 bg-luxury-surface rounded-2xl text-luxury-cream hover:bg-luxury-surface/80 transition-all border border-luxury-border"
                 >
                   <div className="p-3 bg-luxury-citrus rounded-full text-[#121212]">
                     <QrCode size={24} />
                   </div>
                   <span className="text-sm font-semibold">QR Code</span>
                 </button>
                </div>
            )}

            {!showQr && (
              <button
                onClick={handleNativeShare}
                className="w-full mt-6 bg-luxury-citrus text-[#121212] font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                <Share2 size={20} /> More Options
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
