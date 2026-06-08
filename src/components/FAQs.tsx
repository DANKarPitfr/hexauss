import React, { useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';

const faqCategories = [
  {
    title: 'Account',
    questions: [
      { q: 'How do I update my profile?', a: 'Go to Settings > Profile, make your changes, and click Save.' },
      { q: 'Can I delete my account?', a: 'Yes, you can request account deletion in Settings > Security, but this action is permanent.' }
    ]
  },
  {
    title: 'Property Listing',
    questions: [
      { q: 'How do I list a property?', a: 'Go to the Sell tab, click Post Property, and fill in the details.' },
      { q: 'Is listing free?', a: 'Yes, standard listing is free, but featured listings have premium options.' }
    ]
  },
  {
    title: 'Verification',
    questions: [
      { q: 'Why is property verification important?', a: 'It ensures safety and builds trust with potential renters or buyers.' }
    ]
  },
  {
    title: 'Bookings',
    questions: [
      { q: 'How do I book a viewing?', a: 'On the property details page, click Schedule Viewing and pick a time.' }
    ]
  },
  {
    title: 'Payments',
    questions: [
      { q: 'Are transactions secure?', a: 'Yes, we use encrypted gateways to ensure all payments are safe.' }
    ]
  },
  {
    title: 'Safety',
    questions: [
      { q: 'How do I report a suspicious user?', a: 'Visit the user profile and select "Report User" from the options.' }
    ]
  }
];

export function FAQs({ onClose }: { onClose: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[100] bg-luxury-bg p-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8">
        <button onClick={onClose} className="flex items-center gap-2 text-luxury-text mb-8 hover:text-luxury-citrus transition-colors">
          <ChevronLeft size={20} /> Back
        </button>

        <h1 className="text-4xl font-bold text-luxury-cream mb-8">Frequently Asked Questions</h1>

        <div className="space-y-4">
          {faqCategories.map((category) => (
            <div key={category.title} className="bg-luxury-surface/50 border border-luxury-border/30 rounded-2xl overflow-hidden">
              <button
                className="w-full p-6 flex justify-between items-center text-left"
                onClick={() => setOpenSection(openSection === category.title ? null : category.title)}
              >
                <h2 className="text-xl font-bold text-luxury-cream">{category.title}</h2>
                <ChevronDown className={`text-luxury-text transition-transform ${openSection === category.title ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openSection === category.title && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-4">
                      {category.questions.map((faq) => (
                        <div key={faq.q} className="border-t border-luxury-border/30 pt-4">
                          <button
                            className="w-full flex justify-between items-center text-left"
                            onClick={() => setOpenQuestion(openQuestion === faq.q ? null : faq.q)}
                          >
                            <span className="font-medium text-luxury-cream">{faq.q}</span>
                            <ChevronDown className={`text-luxury-text transition-transform ${openQuestion === faq.q ? 'rotate-180' : ''}`} size={16} />
                          </button>
                          <AnimatePresence>
                            {openQuestion === faq.q && (
                              <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="text-sm text-luxury-text pt-2"
                              >
                                {faq.a}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
