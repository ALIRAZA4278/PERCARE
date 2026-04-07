'use client';

import { X, ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function BookVetModal({ isOpen, onClose, petName, petEmoji }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const services = ['General Checkup', 'Vaccination', 'Follow-up', 'Emergency', 'Surgery Consultation', 'Dental Care'];

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }), full: d.toISOString().split('T')[0] };
  });

  const times = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'];

  const handleClose = () => { onClose(); setStep(1); setService(''); setSelectedDate(''); setSelectedTime(''); };

  if (!isOpen) return null;

  const totalSteps = 4;
  const progressWidth = `${(step / totalSteps) * 100}%`;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft size={18} className="text-gray-700" />
                </button>
              )}
              <h2 className="text-lg font-bold text-gray-900">
                {step === 1 && 'Select Service'}
                {step === 2 && 'Pick Date & Time'}
                {step === 3 && 'Select Provider'}
                {step === 4 && 'Confirm Booking'}
              </h2>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-1 px-5 sm:px-6 pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>

          <div className="p-5 sm:p-6">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="space-y-2">
                {services.map((s) => (
                  <button key={s} onClick={() => { setService(s); setStep(2); }}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all text-sm font-medium ${service === s ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`}
                  >{s}</button>
                ))}
              </div>
            )}

            {/* Step 2: Pick Date & Time */}
            {step === 2 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Date</h3>
                <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
                  {dates.map((d) => (
                    <button key={d.full} onClick={() => setSelectedDate(d.full)}
                      className={`flex flex-col items-center px-3 py-2.5 rounded-xl border min-w-[60px] transition-all ${selectedDate === d.full ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      <span className="text-[10px] font-medium">{d.day}</span>
                      <span className="text-lg font-bold">{d.date}</span>
                      <span className="text-[10px]">{d.month}</span>
                    </button>
                  ))}
                </div>

                {selectedDate && (
                  <>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Time</h3>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {times.map((t) => (
                        <button key={t} onClick={() => setSelectedTime(t)}
                          className={`px-3 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ${selectedTime === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                        >{t}</button>
                      ))}
                    </div>
                  </>
                )}

                <button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm"
                >Continue</button>
              </div>
            )}

            {/* Step 3: Select Provider */}
            {step === 3 && (
              <div className="space-y-2">
                {[{ name: 'Dr. Arsalan Khan', clinic: 'PetCare Central Clinic', rating: 4.9 }, { name: 'Dr. Sarah Ahmed', clinic: 'Happy Paws Vet', rating: 4.7 }, { name: 'Dr. Usman Ali', clinic: 'City Animal Hospital', rating: 4.8 }].map((vet) => (
                  <button key={vet.name} onClick={() => setStep(4)}
                    className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <p className="font-bold text-gray-900 text-sm">{vet.name}</p>
                    <p className="text-xs text-gray-600">{vet.clinic} · ⭐ {vet.rating}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Confirm Booking */}
            {step === 4 && (
              <div>
                <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100 space-y-3">
                  {[
                    { label: 'Provider', value: 'Dr. Arsalan Khan' },
                    { label: 'Service', value: service },
                    { label: 'Date', value: selectedDate },
                    { label: 'Time', value: selectedTime },
                    { label: 'Pet(s)', value: petName, emoji: petEmoji },
                  ].map(({ label, value, emoji }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {emoji && <span>{emoji}</span>}
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={() => { console.log('Booking confirmed'); handleClose(); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle size={16} />
                  Confirm Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
