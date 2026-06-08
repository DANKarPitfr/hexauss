import React, { useState } from 'react';
import { ChevronRight, Building } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface AuthOnboardingProps {
    onComplete: () => void;
}

const slides = [
    { title: "Discover Premium Properties", subtitle: "Find your dream home with our curated luxury listings.", color: "text-luxury-citrus" },
    { title: "Sell or Rent Easily", subtitle: "Connect with verified buyers and tenants seamlessly.", color: "text-luxury-cream" },
    { title: "Connect With Trusted Buyers", subtitle: "Your real estate journey, empowered by a modern experience.", color: "text-luxury-citrus" },
];

export default function AuthOnboarding({ onComplete }: AuthOnboardingProps) {
    const [view, setView] = useState<'onboarding' | 'welcome'>('onboarding');
    const [slide, setSlide] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
            alert('Login Successful!');
            onComplete();
        } catch (err: any) {
            setError(err.message || 'Google authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    if (view === 'onboarding') {
        return (
            <div className="fixed inset-0 bg-[#121212] z-[100] flex flex-col p-6 items-center justify-between text-center overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 bg-luxury-surface rounded-3xl flex items-center justify-center shadow-neo-dark mb-4">
                        <Building size={40} className="text-luxury-citrus" />
                    </div>
                    <h1 className={`text-3xl font-black ${slides[slide].color} tracking-tight`}>{slides[slide].title}</h1>
                    <p className="text-luxury-text text-lg px-4">{slides[slide].subtitle}</p>
                </div>
                
                <div className="w-full space-y-6">
                    <div className="flex justify-center gap-2">
                        {slides.map((_, i) => (
                            <div key={i} className={`h-2 rounded-full transition-all ${i === slide ? 'w-8 bg-luxury-citrus' : 'w-2 bg-luxury-text/30'}`} />
                        ))}
                    </div>
                    <button 
                        onClick={() => slide < slides.length - 1 ? setSlide(slide + 1) : setView('welcome')}
                        className="w-full bg-luxury-citrus text-[#121212] font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2 shadow-glow active:scale-95 transition-all"
                    >
                        {slide < slides.length - 1 ? 'Next' : 'Get Started'} <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#121212] z-[100] flex flex-col p-6 space-y-8 justify-center">
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-black text-luxury-cream tracking-tight">Find, Sell & Grow</h1>
                <p className="text-luxury-text">Your Real Estate Journey in India.</p>
            </div>

            <div className="space-y-4">
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button onClick={handleGoogleSignIn} disabled={loading} className="w-full bg-[#1A1A1A] border border-luxury-border/50 text-luxury-cream py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold shadow-neo-dark-sm active:scale-95 transition-all">
                    {loading ? 'Authenticating...' : 'Continue with Google'}
                </button>
            </div>

            <div className="text-center text-xs text-luxury-text/60">
                By continuing, you agree to our <button onClick={() => navigate('/terms-of-service')} className="underline text-luxury-citrus">Terms of Service</button> and <button onClick={() => navigate('/privacy-policy')} className="underline text-luxury-citrus">Privacy Policy</button>
            </div>
        </div>
    );
}
