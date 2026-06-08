import React from 'react';
import { Megaphone, TrendingUp, Star, Mail } from 'lucide-react';

export default function AdvertiseWithUsSection() {
    const options = [
        {
            title: 'Advertise With Us',
            description: 'Promote your business, brand, service, project, or partnership opportunity on HexaEstates and reach genuine property seekers.',
            icon: Megaphone,
        },
        {
            title: 'Promote Property',
            description: 'Boost a specific property listing for higher visibility and increased engagement.',
            price: '₹99/week',
            icon: TrendingUp,
        },
        {
            title: 'Featured Listings',
            description: 'Get your property highlighted in premium sections of the app for maximum exposure.',
            price: '₹99/week',
            icon: Star,
        },
    ];

    return (
        <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-citrus/80 mb-3 px-2">Advertisement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option, idx) => (
                    <div key={idx} className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] p-5 border border-luxury-citrus/40 shadow-neo-dark flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-luxury-bg rounded-xl border border-luxury-citrus/30">
                                <option.icon size={18} className="text-luxury-citrus" />
                            </div>
                            <h4 className="text-sm font-black text-luxury-cream">{option.title}</h4>
                        </div>
                        <p className="text-xs text-luxury-text flex-1 leading-relaxed">{option.description}</p>
                        {option.price && (
                            <div className="bg-luxury-citrus text-luxury-bg text-[10px] font-black py-0.5 px-2.5 rounded-full self-start">
                                {option.price}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] p-5 border border-luxury-border/40 shadow-neo-dark text-center space-y-3">
                <p className="text-xs text-luxury-text">For all advertising inquiries, partnerships, and activations:</p>
                <a href="mailto:supportbyhexaus@gmail.com?subject=Advertising Inquiry" className="flex items-center justify-center gap-2 text-luxury-citrus font-bold hover:underline py-1">
                    <Mail size={16} />
                    supportbyhexaus@gmail.com
                </a>
                <a href="mailto:supportbyhexaus@gmail.com?subject=Advertising Inquiry" className="w-full block bg-luxury-citrus text-luxury-bg font-black py-2.5 rounded-xl text-sm hover:bg-luxury-citrus-light transition-all">
                    Contact Us
                </a>
            </div>
        </section>
    );
}
