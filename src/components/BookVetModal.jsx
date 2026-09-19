'use client';

import { X, ArrowLeft, CheckCircle, Stethoscope } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function BookVetModal({ isOpen, onClose, petName, petEmoji, vetId, vetName }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedVet, setSelectedVet] = useState(vetId ? { id: vetId, name: vetName || 'Selected Vet' } : null);
  const [vets, setVets] = useState([]);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);

  const services = ['General Checkup', 'Vaccination', 'Follow-up', 'Emergency', 'Surgery Consultation', 'Dental Care'];

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }), full: d.toISOString().split('T')[0] };
  });

  const times = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'];

  useEffect(() => {
    if (isOpen && user) {
      fetchVets();
      fetchUserPets();
    }
  }, [isOpen, user]);

  const fetchVets = async () => {
    if (vetId) return;
    const { data } = await supabase
      .from('vet_profiles')
      .select('id, specialization, rating, consultation_fee, user:profiles(full_name), clinic:clinic_vets(clinic:clinics(name))')
      .eq('is_available', true)
      .limit(10);
    setVets(data || []);
  };

  const fetchUserPets = async () => {
    if (!user) return;
    const { data } = await supabase.from('pets').select('id, name, species').eq('owner_id', user.id).limit(10);
    setPets(data || []);
  };

  const handleConfirmBooking = async () => {
    if (!user || !service || !selectedDate || !selectedTime) return;
    const vetToBook = selectedVet || (vetId ? { id: vetId } : null);
    if (!vetToBook) return;

    setBooking(true);
    try {
      const timeStr = selectedTime.replace(' AM', '').replace(' PM', '');
      const [h, m] = timeStr.split(':');
      let hour = parseInt(h);
      if (selectedTime.includes('PM') && hour !== 12) hour += 12;
      if (selectedTime.includes('AM') && hour === 12) hour = 0;
      const formattedTime = `${String(hour).padStart(2, '0')}:${m}:00`;

      await supabase.from('appointments').insert({
        pet_owner_id: user.id,
        vet_id: vetToBook.id,
        pet_id: selectedPetId || null,
        appointment_date: selectedDate,
        appointment_time: formattedTime,
        reason: service,
        status: 'pending',
      });
      setBooked(true);
    } catch {}
    setBooking(false);
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setService('');
    setSelectedDate('');
    setSelectedTime('');
    if (!vetId) setSelectedVet(null);
    setBooked(false);
    setSelectedPetId(null);
  };

  if (!isOpen) return null;

  const totalSteps = vetId ? 3 : 4;

  if (booked) return (
    <>
      <div className="fixed inset-0 bg-foreground/40 z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl w-full max-w-md shadow-elevated p-8 text-center">
          <div className="w-16 h-16 bg-vitality/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-vitality" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Appointment Booked!</h2>
          <p className="text-muted-foreground text-sm mb-1">{service} on <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong></p>
          {(selectedVet?.name || vetName) && <p className="text-muted-foreground text-sm mb-6">with {selectedVet?.name || vetName}</p>}
          <button onClick={handleClose} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors text-sm">Done</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-0 bg-foreground/40 z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl w-full max-w-md shadow-elevated max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                  <ArrowLeft size={18} className="text-foreground" />
                </button>
              )}
              <h2 className="text-lg font-bold text-foreground">
                {step === 1 && 'Select Service'}
                {step === 2 && 'Pick Date & Time'}
                {step === 3 && (vetId ? 'Confirm Booking' : 'Select Vet')}
                {step === 4 && 'Confirm Booking'}
              </h2>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-muted rounded-lg transition-colors"><X size={20} className="text-foreground" /></button>
          </div>

          <div className="flex gap-1 px-5 sm:px-6 pt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>

          <div className="p-5 sm:p-6">
            {step === 1 && (
              <div className="space-y-2">
                {services.map((s) => (
                  <button key={s} onClick={() => { setService(s); setStep(2); }}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all text-sm font-medium ${service === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:border-border hover:bg-muted'}`}
                  >{s}</button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select Date</h3>
                <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
                  {dates.map((d) => (
                    <button key={d.full} onClick={() => setSelectedDate(d.full)}
                      className={`flex flex-col items-center px-3 py-2.5 rounded-xl border min-w-[60px] transition-all ${selectedDate === d.full ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:border-border'}`}
                    >
                      <span className="text-[10px] font-medium">{d.day}</span>
                      <span className="text-lg font-bold">{d.date}</span>
                      <span className="text-[10px]">{d.month}</span>
                    </button>
                  ))}
                </div>

                {selectedDate && (
                  <>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select Time</h3>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {times.map((t) => (
                        <button key={t} onClick={() => setSelectedTime(t)}
                          className={`px-3 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ${selectedTime === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:border-border'}`}
                        >{t}</button>
                      ))}
                    </div>
                  </>
                )}

                <button onClick={() => setStep(vetId ? 3 : 3)} disabled={!selectedDate || !selectedTime}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted-foreground/30 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm"
                >Continue</button>
              </div>
            )}

            {step === 3 && !vetId && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Select a veterinarian for your appointment:</p>
                {vets.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {vets.map((vet) => (
                      <button key={vet.id} onClick={() => { setSelectedVet({ id: vet.id, name: vet.user?.full_name || 'Dr. Vet' }); setStep(4); }}
                        className="w-full text-left px-4 py-3.5 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <Stethoscope size={16} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{vet.user?.full_name || 'Dr. Vet'}</p>
                            <p className="text-xs text-muted-foreground">
                              {vet.specialization || 'General Practice'}
                              {vet.consultation_fee ? ` · Rs. ${Number(vet.consultation_fee).toLocaleString()}` : ''}
                              {vet.rating > 0 ? ` · ⭐ ${Number(vet.rating).toFixed(1)}` : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No vets available right now.</p>
                )}
              </div>
            )}

            {(step === 3 && vetId) || step === 4 ? (
              <div>
                {pets.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Pet (optional)</label>
                    <div className="space-y-2">
                      {pets.map(pet => (
                        <button key={pet.id} type="button" onClick={() => setSelectedPetId(pet.id === selectedPetId ? null : pet.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${selectedPetId === pet.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-border'}`}>
                          {pet.name} <span className="text-xs capitalize text-muted-foreground">({pet.species})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-muted rounded-xl p-4 mb-5 border border-border space-y-3">
                  {[
                    { label: 'Provider', value: selectedVet?.name || vetName || 'Vet' },
                    { label: 'Service', value: service },
                    { label: 'Date', value: selectedDate },
                    { label: 'Time', value: selectedTime },
                    ...(petName ? [{ label: 'Pet', value: petName, emoji: petEmoji }] : []),
                  ].map(({ label, value, emoji }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {emoji && <span>{emoji}</span>}
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {!user && <p className="text-sm text-emergency mb-3 text-center">Please log in to book an appointment.</p>}

                <button onClick={handleConfirmBooking} disabled={booking || !user}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-card flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle size={16} />
                  {booking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
