import React from 'react';
import { ChevronLeft, Mail, Phone } from 'lucide-react';

export function ContactSupport({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] bg-luxury-bg p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8">
                <button onClick={onClose} className="flex items-center gap-2 text-luxury-text mb-8 hover:text-luxury-citrus">
                    <ChevronLeft size={20} /> Back
                </button>
                <div className="bg-luxury-surface/60 backdrop-blur-sm p-8 rounded-3xl border border-luxury-border shadow-neo-dark text-luxury-text">
                    <h1 className="text-3xl font-bold text-luxury-cream mb-6">Contact Support</h1>
                    <p className="mb-8">Need help? Our support team is here for you.</p>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-luxury-bg p-4 rounded-xl border border-luxury-border">
                            <Mail className="text-luxury-citrus" size={24} />
                            <div>
                                <h3 className="font-bold text-luxury-cream">Email</h3>
                                <a href="mailto:supportbyhexaus@gmail.com" className="text-luxury-citrus hover:underline">supportbyhexaus@gmail.com</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-luxury-bg p-4 rounded-xl border border-luxury-border">
                            <Phone className="text-luxury-citrus" size={24} />
                            <div>
                                <h3 className="font-bold text-luxury-cream">Phone</h3>
                                <p>+91 99999 99999</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
