import React from 'react';
import { ChevronLeft } from 'lucide-react';

export function AboutUs({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] bg-luxury-bg p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8">
                <button onClick={onClose} className="flex items-center gap-2 text-luxury-text mb-8 hover:text-luxury-citrus">
                    <ChevronLeft size={20} /> Back
                </button>
                <div className="bg-luxury-surface/60 backdrop-blur-sm p-8 rounded-3xl border border-luxury-border shadow-neo-dark text-luxury-text">
                    <h1 className="text-3xl font-bold text-luxury-cream mb-6">About Us</h1>
                    <p>HexaEstates is a premium real estate platform dedicated to connecting property seekers with high-quality listings through a modern, seamless, and luxury digital experience.</p>
                </div>
            </div>
        </div>
    );
}
