import React, { useState } from 'react';
/// <reference types="vite/client" />
import { ChevronLeft, Star, CheckCircle } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';

export function ShareFeedback({ onClose }: { onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (file) {
        imageUrl = await uploadToCloudinary(file, 'image', (p) => console.log(`Progress: ${p}%`));
      }
      
      await addDoc(collection(db, 'feedback'), {
        uid: auth.currentUser?.uid || null,
        rating,
        feedback,
        imageUrl,
        createdAt: serverTimestamp()
      });
      
      setSuccess(true);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
        <div className="fixed inset-0 z-[100] bg-luxury-bg p-4 flex items-center justify-center">
            <div className="bg-luxury-surface p-8 rounded-3xl border border-luxury-border text-center shadow-neo-dark-lg">
                <CheckCircle size={64} className="text-luxury-citrus mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-luxury-cream mb-2">Thank you!</h2>
                <p className="text-luxury-text mb-6">Your feedback has been submitted successfully.</p>
                <button onClick={onClose} className="w-full bg-luxury-citrus text-luxury-bg font-bold py-3 rounded-xl">Close</button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-luxury-bg p-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8">
        <button onClick={onClose} className="flex items-center gap-2 text-luxury-text mb-8 hover:text-luxury-citrus transition-colors">
          <ChevronLeft size={20} /> Back
        </button>
        <div className="bg-luxury-surface/60 backdrop-blur-sm p-8 rounded-3xl border border-luxury-border shadow-neo-dark text-luxury-text">
          <h1 className="text-3xl font-bold text-luxury-cream mb-6">Share Feedback</h1>
          <p className="mb-6">We value your input. Let us know how we can improve.</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-luxury-cream mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className={`p-2 rounded-lg transition-colors ${rating >= s ? 'text-luxury-citrus' : 'text-luxury-text/50'}`}>
                  <Star size={32} fill={rating >= s ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <textarea className="w-full bg-luxury-bg p-4 rounded-xl border border-luxury-border text-luxury-cream mb-4 focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" rows={5} placeholder="Your feedback..." value={feedback} onChange={e => setFeedback(e.target.value)}></textarea>
          
          <div className="mb-6">
              <label className="block text-sm font-medium text-luxury-cream mb-2">Screenshot (Optional)</label>
              <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-luxury-text file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-luxury-surface file:text-luxury-cream hover:file:bg-luxury-surface/80" />
          </div>

          <button disabled={isSubmitting || rating === 0} className="w-full bg-luxury-citrus text-luxury-bg font-bold py-3 rounded-xl hover:bg-luxury-citrus-light transition-colors disabled:opacity-50" onClick={handleSubmit}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}
