import React, { useState } from 'react';
import { X, PartyPopper, Phone, Sparkles, CheckCircle2 } from 'lucide-react';

interface EventCateringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventCateringModal: React.FC<EventCateringModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [eventType, setEventType] = useState('Corporate Office Event');
  const [guestCount, setGuestCount] = useState('25-50 Guests');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please fill in your name and phone number');
      return;
    }

    const message = `🎉 *EVENT & CATERING INQUIRY - GREESAL* 🎉\n\n` +
      `👤 *Name:* ${name}\n` +
      `📞 *Mobile:* ${phone}\n` +
      `🎊 *Event Type:* ${eventType}\n` +
      `👥 *Estimated Guests:* ${guestCount}\n` +
      `📅 *Date:* ${date || 'Upcoming'}\n` +
      `📝 *Notes/Requirements:* ${notes || 'Live Salad Counter / Custom Salad Bowls'}\n\n` +
      `🥗 *Please share custom menu options & pricing quote.*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919825144321?text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-[#e4eae7] relative animate-fadeIn">
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6ac6ac]/20 text-[#20493c] text-xs font-bold uppercase tracking-wider mb-2">
              <PartyPopper className="w-3.5 h-3.5" /> Greesal Catering
            </span>
            <h3 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#20493c]">
              Event &amp; Bulk Orders
            </h3>
            <p className="text-xs sm:text-sm text-[#20493c]/80 mt-1">
              Live salad counters, corporate wellness desks &amp; party boxes across Surat
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-dmsans text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#20493c]"
              >
                <option value="Corporate Office Event">Corporate Office Event / Healthy Lunch</option>
                <option value="Wedding / Reception Salad Bar">Wedding / Reception Salad Bar</option>
                <option value="Birthday / Anniversary Party">Birthday / Anniversary Party</option>
                <option value="Gym / Fitness Community Meet">Gym / Fitness Community Meet</option>
                <option value="Little Bundle Bulk Packs">Little Bundle Bulk Packs (50+ Salads)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1">
                  Estimated Guests
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#20493c]"
                >
                  <option value="10-25 Guests">10 - 25 Guests</option>
                  <option value="25-50 Guests">25 - 50 Guests</option>
                  <option value="50-100 Guests">50 - 100 Guests</option>
                  <option value="100+ Guests">100+ Guests (Live Counter)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1">
                  WhatsApp Contact *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1">
                Special Requests / Venue in Surat
              </label>
              <textarea
                rows={2}
                placeholder="Mention any custom dressing requests, location in Surat, or time..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#20493c] hover:bg-[#15342a] active:scale-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Phone className="w-4 h-4 text-[#fbce45]" />
              <span>Send Catering Request on WhatsApp</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
