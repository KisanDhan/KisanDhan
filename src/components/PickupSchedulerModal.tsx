import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Truck,
  CheckCircle2,
  Phone,
  User,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Buyer, CropType, Language, PickupBooking } from '../types';
import { CROPS, TRANSLATIONS } from '../data/seedData';

interface PickupSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyer: Buyer | null;
  crop: CropType;
  acres: number;
  quantityQuintals: number;
  netPayout: number;
  district: string;
  village: string;
  language: Language;
  onBookingConfirmed: (booking: PickupBooking) => void;
}

export const PickupSchedulerModal: React.FC<PickupSchedulerModalProps> = ({
  isOpen,
  onClose,
  buyer,
  crop,
  acres,
  quantityQuintals,
  netPayout,
  district,
  village,
  language,
  onBookingConfirmed,
}) => {
  const [farmerName, setFarmerName] = useState('Gurpreet Singh');
  const [phone, setPhone] = useState('+91 98140 82194');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<PickupBooking['timeSlot']>('Morning (07:00 - 11:00)');
  const [machineryType, setMachineryType] = useState<PickupBooking['machineryType']>(
    'Round Baler + Trolley'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<PickupBooking | null>(null);

  const i18n = {
    pa: {
      windowBadge: '10-15 ਦਿਨਾਂ ਵਿੱਚ ਪੱਕੀ ਚੁਕਾਈ ਗਾਰੰਟੀ',
      title: 'ਪਰਾਲੀ ਚੁਕਾਈ ਅਤੇ ਬੇਲਰ ਬੁਕਿੰਗ',
      subtitle: 'ਕਣਕ ਦੀ ਬਿਜਾਈ ਤੋਂ ਪਹਿਲਾਂ ਸਮੇਂ ਸਿਰ ਖੇਤ ਵਿੱਚੋਂ ਪਰਾਲੀ ਚੁੱਕੀ ਜਾਵੇਗੀ।',
      assignedBuyer: 'ਨਿਰਧਾਰਤ ਪਰਾਲੀ ਖਰੀਦਦਾਰ:',
      netCash: 'ਪੱਕੀ ਨਕਦ ਕਮਾਈ:',
      farmerName: 'ਕਿਸਾਨ ਦਾ ਨਾਮ',
      phone: 'ਮੋਬਾਈਲ ਫੋਨ ਨੰਬਰ',
      date: 'ਚੁਕਾਈ ਦੀ ਲੋੜੀਂਦੀ ਤਰੀਕ',
      slot: 'ਸਮਾਂ ਸਲਾਟ',
      slotMorning: 'ਸਵੇਰੇ (07:00 - 11:00)',
      slotAfternoon: 'ਦੁਪਹਿਰ (11:00 - 15:00)',
      slotEvening: 'ਸ਼ਾਮ (15:00 - 19:00)',
      equipment: 'ਖੇਤ ਵਿੱਚ ਭੇਜੀ ਜਾਣ ਵਾਲੀ ਮਸ਼ੀਨਰੀ',
      eqRound: 'ਗੋਲ ਬੇਲਰ + ਟਰਾਲੀ',
      eqSquare: 'ਵੱਡਾ ਚੌਰਸ ਬੇਲਰ',
      eqShredder: 'ਸਟਰੌਅ ਚੌਪਰ / ਮਲਚਰ',
      submitBtn: 'ਬੇਲਰ ਚੁਕਾਈ ਪੱਕੀ ਕਰੋ (ਬੁੱਕ ਕਰੋ)',
      submitting: 'ਬੁਕਿੰਗ ਹੋ ਰਹੀ ਹੈ...',
      backBtn: 'ਪਿੱਛੇ',
      confirmedTitle: 'ਪਰਾਲੀ ਚੁਕਾਈ ਦੀ ਬੁਕਿੰਗ ਪੱਕੀ ਹੋ ਗਈ!',
      bookingToken: 'ਬੁਕਿੰਗ ਟੋਕਨ:',
      operatorAssigned: 'ਨਿਯੁਕਤ ਬੇਲਰ ਆਪਰੇਟਰ:',
      scheduledOn: 'ਨਿਸ਼ਚਿਤ ਤਰੀਕ:',
      expectedPayment: 'ਖਰੀਦਦਾਰ ਵੱਲੋਂ ਭੁਗਤਾਨ:',
      smsNote: 'ਤੁਹਾਡੇ ਫੋਨ ਤੇ ਬੁਕਿੰਗ ਸੰਦੇਸ਼ (SMS) ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਆਪਰੇਟਰ ਪਹੁੰਚਣ ਤੋਂ 2 ਘੰਟੇ ਪਹਿਲਾਂ ਫੋਨ ਕਰੇਗਾ।',
      doneBtn: 'ਠੀਕ ਹੈ (ਮੁੱਖ ਪੰਨੇ ਤੇ ਜਾਓ)',
    },
    hi: {
      windowBadge: '10-15 दिनों के भीतर निश्चित उठान',
      title: 'पराली पिकअप व बेलर मशीन बुकिंग',
      subtitle: 'गेहूं की बुवाई से पहले खेत खाली करने के लिए निश्चित प्रबंधन।',
      assignedBuyer: 'निर्धारित पराली खरीदार:',
      netCash: 'सुनिश्चित शुद्ध नकद:',
      farmerName: 'किसान का नाम',
      phone: 'मोबाइल फोन नंबर',
      date: 'पिकअप की तारीख',
      slot: 'समय स्लॉट',
      slotMorning: 'सुबह (07:00 - 11:00)',
      slotAfternoon: 'दोपहर (11:00 - 15:00)',
      slotEvening: 'शाम (15:00 - 19:00)',
      equipment: 'खेत पर भेजी जाने वाली मशीनरी',
      eqRound: 'गोल बेलर + ट्रॉली',
      eqSquare: 'बड़ा चौकोर बेलर',
      eqShredder: 'स्ट्रॉ चॉपर / मल्चर',
      submitBtn: 'पिकअप स्लॉट कन्फर्म करें',
      submitting: 'बुकिंग दर्ज हो रही है...',
      backBtn: 'वापस',
      confirmedTitle: 'पराली पिकअप बुकिंग कन्फर्म हो गई!',
      bookingToken: 'बुकिंग टोकन:',
      operatorAssigned: 'निर्धारित बेलर ऑपरेटर:',
      scheduledOn: 'निर्धारित तारीख:',
      expectedPayment: 'खरीदार द्वारा देय राशि:',
      smsNote: 'आपके मोबाइल पर एसएमएस भेज दिया गया है। ऑपरेटर पहुंचने से 2 घंटे पहले कॉल करेगा।',
      doneBtn: 'संपन्न (मुख्य स्क्रीन पर जाएं)',
    },
    en: {
      windowBadge: 'Guaranteed 10-15 Day Window Pickup',
      title: 'Schedule Stubble Pickup & Baler',
      subtitle: 'Guaranteed field clearance inside your wheat sowing deadline.',
      assignedBuyer: 'Assigned Agro Buyer:',
      netCash: 'Guaranteed Net Cash:',
      farmerName: 'Farmer Name',
      phone: 'Mobile Phone Number',
      date: 'Preferred Pickup Date',
      slot: 'Time Slot',
      slotMorning: 'Morning (07:00 - 11:00)',
      slotAfternoon: 'Afternoon (11:00 - 15:00)',
      slotEvening: 'Evening (15:00 - 19:00)',
      equipment: 'Equipment Dispatched to Field',
      eqRound: 'Round Baler + Trolley',
      eqSquare: 'Square High-Density Baler',
      eqShredder: 'Straw Chopper & Mulcher',
      submitBtn: 'Confirm Pickup & Dispatch Baler',
      submitting: 'Dispatching...',
      backBtn: 'Back',
      confirmedTitle: 'Pickup Slot Confirmed & Locked!',
      bookingToken: 'Booking Token:',
      operatorAssigned: 'Assigned Baler Operator:',
      scheduledOn: 'Scheduled Date:',
      expectedPayment: 'Expected Net Payment:',
      smsNote: 'Confirmation SMS dispatched. The baler team will call you 2 hours before arriving at your field.',
      doneBtn: 'Done (Back to Home)',
    },
    hr: {
      windowBadge: '10-15 दिनां म्हां पक्की उठान की गारंटी',
      title: 'पराली उठान अर बेलर मशीन बुकिंग',
      subtitle: 'गेहूं बीजन तै पैहल्या खेत खाली करण खातर पक्का काम।',
      assignedBuyer: 'पक्का पराली खरीदार:',
      netCash: 'पक्की नकद कमाई:',
      farmerName: 'किसान का नाम',
      phone: 'मोबाइल फोन नंबर',
      date: 'पिकअप की तारीख',
      slot: 'समय स्लॉट',
      slotMorning: 'सवेरे (07:00 - 11:00)',
      slotAfternoon: 'दुपहरी (11:00 - 15:00)',
      slotEvening: 'सांझ (15:00 - 19:00)',
      equipment: 'खेत पै भेजी जाण आली मशीनरी',
      eqRound: 'गोल बेलर + ट्राली',
      eqSquare: 'बड़ा चौकोर बेलर',
      eqShredder: 'स्ट्रॉ चॉपर / मल्चर',
      submitBtn: 'बेलर अर ट्राली पक्की करो',
      submitting: 'बुकिंग होवै सै...',
      backBtn: 'वापस',
      confirmedTitle: 'पराली उठान की बुकिंग पक्की हो गी!',
      bookingToken: 'बुकिंग टोकन:',
      operatorAssigned: 'बेलर ऑपरेटर:',
      scheduledOn: 'निश्चित तारीख:',
      expectedPayment: 'खरीदार तै मिलण आले पईसे:',
      smsNote: 'थारे फोन पै एसएमएस भेज दिया सै। ऑपरेटर खेत पै आंण तै 2 घंटे पैहल्या फोन करैगा।',
      doneBtn: 'सम्पन्न (मुख्य स्क्रीन पै जाओ)',
    },
  }[language];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/book-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName,
          phone,
          village,
          district,
          acres,
          crop,
          quantityQuintals,
          buyerId: buyer?.id || 'b1',
          buyerName: buyer?.name || 'Punjab Biomass Power Plant Ltd.',
          scheduledDate,
          timeSlot,
          machineryType,
          netPaymentExpected: netPayout,
        }),
      });

      const data = await response.json();
      if (data.booking) {
        setConfirmedBooking(data.booking);
        onBookingConfirmed(data.booking);

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative bg-[#064e3b] text-emerald-50 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-[#059669] my-6 max-h-[90vh] overflow-y-auto">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#059669]">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-emerald-200 hover:text-emerald-50 bg-[#047857] hover:bg-[#10b981] px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>{i18n.backBtn}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-400 hover:text-emerald-50 rounded-full hover:bg-[#047857] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!confirmedBooking ? (
          <div>
            {/* Header */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2">
                <Truck className="w-3.5 h-3.5" />
                <span>{i18n.windowBadge}</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-emerald-950 text-emerald-50">
                {i18n.title}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-400 mt-1">
                {i18n.subtitle}
              </p>
            </div>

            {/* Selected Buyer & Deal Recap */}
            <div className="bg-[#052e16] border border-[#059669] rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-400 font-semibold">
                  {i18n.assignedBuyer}
                </p>
                <p className="text-sm font-emerald-950 text-emerald-50">
                  {buyer?.name || 'Punjab Biomass Power Plant Ltd.'}
                </p>
                <p className="text-xs text-emerald-400 mt-0.5">
                  {quantityQuintals} {language === 'pa' ? 'ਕੁਇੰਟਲ' : 'Quintals'} ({acres} {language === 'pa' ? 'ਏਕੜ' : 'Acres'} {CROPS[crop].name[language]})
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-400 block">{i18n.netCash}</span>
                <span className="text-lg sm:text-xl font-emerald-950 text-emerald-400">
                  +₹{netPayout.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{i18n.farmerName}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full bg-[#052e16] border border-[#059669] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-50 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{i18n.phone}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#052e16] border border-[#059669] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-50 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{i18n.date}</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[#052e16] border border-[#059669] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-50 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{i18n.slot}</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value as PickupBooking['timeSlot'])}
                    className="w-full bg-[#052e16] border border-[#059669] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-50 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Morning (07:00 - 11:00)">{i18n.slotMorning}</option>
                    <option value="Afternoon (11:00 - 15:00)">{i18n.slotAfternoon}</option>
                    <option value="Evening (15:00 - 19:00)">{i18n.slotEvening}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{i18n.equipment}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { val: 'Round Baler + Trolley', label: i18n.eqRound },
                    { val: 'Square Baler + Flatbed', label: i18n.eqSquare },
                    { val: 'Straw Chopper / Mulcher', label: i18n.eqShredder },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => setMachineryType(item.val as any)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                        machineryType === item.val
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                          : 'bg-[#052e16] border-[#059669] text-emerald-400 hover:border-emerald-500'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-emerald-950 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? i18n.submitting : i18n.submitBtn}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-4 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-xl font-emerald-950 text-emerald-50">
                {i18n.confirmedTitle}
              </h3>
              <p className="text-xs text-emerald-400 mt-1">
                {i18n.smsNote}
              </p>
            </div>

            <div className="bg-[#052e16] border border-[#059669] rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#059669] pb-2">
                <span className="text-emerald-400">{i18n.bookingToken}</span>
                <span className="font-mono font-bold text-emerald-400">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between border-b border-[#059669] pb-2">
                <span className="text-emerald-400">{i18n.operatorAssigned}</span>
                <span className="font-bold text-emerald-50">{confirmedBooking.operatorName} ({confirmedBooking.operatorPhone})</span>
              </div>
              <div className="flex justify-between border-b border-[#059669] pb-2">
                <span className="text-emerald-400">{i18n.scheduledOn}</span>
                <span className="font-bold text-emerald-50">{confirmedBooking.scheduledDate} • {confirmedBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-emerald-400">{i18n.expectedPayment}</span>
                <span className="font-emerald-950 text-emerald-400 text-sm">
                  +₹{confirmedBooking.netPaymentExpected.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setConfirmedBooking(null);
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-emerald-950 py-3 rounded-2xl text-xs sm:text-sm transition cursor-pointer"
            >
              {i18n.doneBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
