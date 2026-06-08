import React, { useState } from 'react';
import { ChevronLeft, Mail, Phone, Home, User, Shield, Key, AlertTriangle } from 'lucide-react';
import { FAQs } from './FAQs';

export function HelpSupport({ onClose }: { onClose: () => void }) {
  const [showFAQs, setShowFAQs] = useState(false);

  const supportCategories = [
    { title: "Property Issue", icon: Home, description: "Report issues with a listing" },
    { title: "Report User", icon: User, description: "Flag misconduct" },
    { title: "Account & Login", icon: Shield, description: "Access issues" },
    { title: "Rental & Booking", icon: Key, description: "Payments & agreements" },
  ];

  if (showFAQs) {
    return <FAQs onClose={() => setShowFAQs(false)} />;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-luxury-bg p-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8">
        <button onClick={onClose} className="flex items-center gap-2 text-luxury-text mb-8 hover:text-luxury-citrus transition-colors">
          <ChevronLeft size={20} /> Back
        </button>

        <div className="space-y-8">
          {/* Header */}
          <div className="bg-luxury-surface/60 backdrop-blur-sm p-8 rounded-3xl border border-luxury-border shadow-neo-dark">
            <h1 className="text-3xl font-bold text-luxury-cream mb-2">Help & Support</h1>
            <p className="text-luxury-text/80">How can we assist you today?</p>
          </div>

          {/* Contact Support CTA */}
          <div className="bg-luxury-surface p-6 rounded-2xl border border-luxury-border flex items-center justify-between shadow-neo-dark-sm">
            <div>
              <h2 className="font-bold text-luxury-cream text-lg">Still need help?</h2>
              <p className="text-luxury-text">Talk to our customer success team</p>
            </div>
            <a 
              href="mailto:supportbyhexaus@gmail.com?subject=HexaEstates Support Request" 
               className="bg-luxury-citrus text-luxury-bg px-6 py-3 rounded-xl font-bold hover:bg-luxury-citrus-light transition-colors"
            >
              Email Support
            </a>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportCategories.map((cat, idx) => (
              <div key={idx} className="bg-luxury-surface p-6 rounded-2xl border border-luxury-border shadow-neo-dark-sm hover:border-luxury-citrus transition-colors cursor-pointer flex gap-4">
                <div className="bg-luxury-bg p-3 rounded-xl text-luxury-citrus">
                  <cat.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-luxury-cream">{cat.title}</h3>
                  <p className="text-sm text-luxury-text">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Email Support Section */}
          <div className="bg-luxury-surface/40 p-6 rounded-2xl border border-luxury-border">
            <h3 className="font-bold text-luxury-cream mb-4 flex items-center gap-2">
              <Mail size={20} className="text-luxury-citrus" />
              Direct Email Support
            </h3>
            <p className="text-luxury-text mb-2">For account issues, property issues, verification problems, booking concerns, or general assistance, contact us at:</p>
            <a href="mailto:supportbyhexaus@gmail.com" className="text-luxury-citrus hover:underline text-lg font-bold">supportbyhexaus@gmail.com</a>
          </div>

          {/* FAQs Footer */}
          <div className="pt-8 border-t border-luxury-border/30">
            <h2 className="text-xl font-bold text-luxury-cream mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <button onClick={() => setShowFAQs(true)} className="w-full flex justify-between items-center text-luxury-text hover:text-luxury-citrus transition-colors">
                <span>How do I list a property?</span>
                <ChevronLeft className="rotate-180" size={16} />
              </button>
              <button onClick={() => setShowFAQs(true)} className="w-full flex justify-between items-center text-luxury-text hover:text-luxury-citrus transition-colors">
                <span>Is HexaEstates free?</span>
                <ChevronLeft className="rotate-180" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
