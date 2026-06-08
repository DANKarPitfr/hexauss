import { MessageCircle, FileText, Shield, Smile, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  onContactClick: () => void;
  onFeedbackClick: () => void;
  onAboutClick: () => void;
}

export default function Footer({ onContactClick, onFeedbackClick, onAboutClick }: FooterProps) {
  const navigate = useNavigate();
  const links = [
    { icon: MessageCircle, label: 'Contact Support', action: onContactClick },
    { icon: FileText, label: 'Terms of Use', action: () => navigate('/terms-of-service') },
    { icon: Shield, label: 'Privacy Policy', action: () => navigate('/privacy-policy') },
    { icon: Smile, label: 'Share Feedback', action: onFeedbackClick },
    { icon: Info, label: 'About Us', action: onAboutClick },
  ];

  return (
    <footer className="bg-luxury-surface/50 p-6 pb-32 border-t border-luxury-border mt-4">
      <div className="grid grid-cols-2 gap-5">
        {links.map((link) => (
          <button 
            key={link.label} 
            onClick={link.action}
            className="flex flex-col items-center justify-center gap-3 p-5 bg-luxury-surface rounded-[24px] shadow-neo-dark-sm hover:shadow-neo-dark transition-all active:shadow-neo-dark-inset border border-luxury-border/30"
          >
            <div className="p-3 shadow-neo-dark-inset rounded-full bg-luxury-bg">
                <link.icon size={22} className="text-luxury-citrus drop-shadow-[0_0_5px_rgba(255,182,39,0.4)]" />
            </div>
            <span className="text-[10px] font-bold text-luxury-text tracking-wide text-center uppercase">{link.label}</span>
          </button>
        ))}
      </div>
    </footer>
  );
}
