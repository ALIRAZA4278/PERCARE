'use client';

import { Check, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const inputClass =
  'w-full h-11 px-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';

const labelClass =
  'text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block';

export default function RescueRequestModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    animalType: '',
    breed: '',
    location: '',
    situation: '',
    contact: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('lost_found_pets').insert({
        reporter_id: user?.id || null,
        type: 'found',
        species: formData.animalType.toLowerCase(),
        breed: formData.breed || null,
        last_seen_location: formData.location,
        description: formData.situation,
        contact_phone: formData.contact || null,
        city: formData.location,
        pet_name: 'Unknown',
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setFormData({ animalType: '', breed: '', location: '', situation: '', contact: '' });
    setSubmitted(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-elevated">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-vitality/10 flex items-center justify-center mx-auto mb-3">
              <Check className="h-5 w-5 text-vitality" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Rescue Request Submitted!</h2>
            <p className="text-sm text-muted-foreground mb-5">
              A rescue team will be notified. Thank you for caring!
            </p>
            <button
              onClick={handleClose}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-press hover:opacity-90"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-card z-10 p-4 border-b border-border flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-emergency" /> Report Rescue Request
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center btn-press"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label htmlFor="rescue-type" className={labelClass}>
                  Animal Type *
                </label>
                <select
                  id="rescue-type"
                  name="animalType"
                  value={formData.animalType}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select type</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="rescue-breed" className={labelClass}>
                  Breed (if known)
                </label>
                <input
                  id="rescue-breed"
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="e.g. German Shepherd, Tabby"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="rescue-location" className={labelClass}>
                  Location *
                </label>
                <input
                  id="rescue-location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Where is the animal?"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="rescue-situation" className={labelClass}>
                  Situation *
                </label>
                <textarea
                  id="rescue-situation"
                  name="situation"
                  value={formData.situation}
                  onChange={handleChange}
                  placeholder="Describe the animal's condition and situation..."
                  rows={4}
                  required
                  className="w-full p-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label htmlFor="rescue-contact" className={labelClass}>
                  Your Contact
                </label>
                <input
                  id="rescue-contact"
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Phone number or email"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-emergency text-emergency-foreground text-sm font-semibold btn-press transition-expo hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Rescue Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
