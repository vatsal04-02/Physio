/**
 * Single source of truth for clinic facts.
 *
 * Only information verified in the Master PRD (§3) lives here. Anything unknown stays as
 * TBD so it is obvious on the page and in code review — never invent doctor details,
 * prices, testimonials, outcomes or home-visit availability.
 */

export const TBD = '[TBD - confirm with clinic]';

export const clinic = {
  name: 'Geeta Krishna Physiotherapy',
  shortName: 'Geeta Krishna',
  monogram: 'GK',
  address: {
    street: 'B-1/127 Viram Khand',
    area: 'Gomti Nagar, near Deva Palace',
    city: 'Lucknow',
    region: 'UP',
    postalCode: '226010',
  },
  phone: {
    display: '+91 98386 81421',
    tel: '+919838681421',
    whatsapp: '919838681421',
  },
  rating: { value: '5.0', count: '467+' },
} as const;

export const hours = {
  days: 'Mon–Sat',
  sessions: ['9 AM–1 PM', '4 PM–8 PM'],
  closed: 'Sunday closed',
} as const;

/* ---------- Contact links ---------- */

const GENERIC_MESSAGE =
  'Hello Geeta Krishna Physiotherapy,\n\nI found you through your website and would like to enquire about physiotherapy services.\n\nThank you.';

/** WhatsApp deep link with an optional pre-filled message. */
export function whatsappLink(message: string = GENERIC_MESSAGE): string {
  return `https://wa.me/${clinic.phone.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Contextual message for a specific concern, e.g. "physiotherapy for back pain". */
export function concernMessage(ask: string): string {
  return `Hello Geeta Krishna Physiotherapy,\n\nI found you through the website and would like to know more about ${ask}.\n\nThank you.`;
}

export function doctorMessage(name: string): string {
  return `Hello Geeta Krishna Physiotherapy,\n\nI found you through the website and would like to ask about care with ${name}.\n\nThank you.`;
}

export const links = {
  whatsapp: whatsappLink(),
  tel: `tel:${clinic.phone.tel}`,
  // Built from the verified address, so it opens the correct place in Google Maps.
  // Swap for the clinic's Google Business Profile / review URLs once supplied.
  directions: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${clinic.name}, ${clinic.address.street}, ${clinic.address.area}, ${clinic.address.city} ${clinic.address.postalCode}`,
  )}`,
  reviews: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${clinic.name}, Gomti Nagar, ${clinic.address.city}`,
  )}`,
} as const;

/* ---------- Navigation ---------- */

export const nav = [
  { label: 'Conditions', href: '#conditions' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Visit', href: '#visit' },
] as const;

/* ---------- Conditions / services (PRD §12) ---------- */

export interface Condition {
  title: string;
  /** Short, claim-free descriptor. */
  blurb: string;
  /** Used in the WhatsApp pre-fill: "…would like to know more about {ask}." */
  ask: string;
  icon: 'bone' | 'activity' | 'footprints' | 'hand' | 'zap' | 'dumbbell' | 'person-standing' | 'flame' | 'stethoscope' | 'heart-pulse' | 'shield-check' | 'layers';
}

export const conditions: Condition[] = [
  { title: 'Back Pain', blurb: 'Stiffness, aches and everyday movement.', ask: 'physiotherapy for back pain', icon: 'bone' },
  { title: 'Neck Pain', blurb: 'Neck and upper-back discomfort.', ask: 'physiotherapy for neck pain', icon: 'activity' },
  { title: 'Shoulder Pain / Frozen Shoulder', blurb: 'Shoulder stiffness and restricted movement.', ask: 'physiotherapy for shoulder pain / frozen shoulder', icon: 'hand' },
  { title: 'Knee Pain / Arthritis', blurb: 'Knee and joint discomfort.', ask: 'physiotherapy for knee pain / arthritis', icon: 'footprints' },
  { title: 'Hip Pain', blurb: 'Hip discomfort and mobility concerns.', ask: 'physiotherapy for hip pain', icon: 'person-standing' },
  { title: 'Sciatica', blurb: 'Pain that travels down the leg.', ask: 'physiotherapy for sciatica', icon: 'zap' },
  { title: 'Slip Disc', blurb: 'Disc-related back and leg symptoms.', ask: 'physiotherapy for slip disc', icon: 'layers' },
  { title: 'Sports Injuries', blurb: 'Strains, sprains and activity-related injuries.', ask: 'physiotherapy for sports injuries', icon: 'dumbbell' },
  { title: 'Post-Surgical Rehabilitation', blurb: 'Guided rehabilitation after surgery.', ask: 'post-surgical rehabilitation', icon: 'heart-pulse' },
  { title: 'Therapeutic Exercise', blurb: 'Guided movement and strengthening.', ask: 'therapeutic exercise', icon: 'activity' },
  { title: 'Balance & Fall Prevention', blurb: 'Steadiness and balance support.', ask: 'balance and fall prevention', icon: 'shield-check' },
  { title: 'Heat Therapy', blurb: 'Heat-based therapy for comfort.', ask: 'heat therapy', icon: 'flame' },
  { title: 'Consultation', blurb: 'Talk through your concern with the clinic.', ask: 'a consultation', icon: 'stethoscope' },
];

/** "Care at a glance" band — short editorial labels, not another card grid. */
export const glance = ['Back pain', 'Neck pain', 'Knee pain', 'Shoulder pain', 'Sports injuries', 'Rehabilitation'] as const;

/* ---------- Why this approach (PRD §13) ---------- */

export const principles = [
  { n: '01', title: 'Assess First', body: 'Understand your concern before care is recommended.' },
  { n: '02', title: 'Individualised Care', body: 'Care is based on clinical assessment.' },
  { n: '03', title: 'Clear Next Steps', body: 'Progress and next steps are discussed with you.' },
  { n: '04', title: 'Local & Accessible', body: 'Gomti Nagar, Lucknow.' },
] as const;

/* ---------- What we do (kept deliberately short — no clinical claims) ---------- */

export const whatWeDo = [
  { icon: 'activity', title: 'Pain & Mobility', body: 'Support for common pain and movement concerns.' },
  { icon: 'heart-pulse', title: 'Rehabilitation', body: 'Post-surgical and injury rehabilitation support.' },
  { icon: 'dumbbell', title: 'Exercise & Recovery', body: 'Therapeutic exercise and guided movement care.' },
] as const;

/* ---------- Doctors (PRD §14) — unknown details stay TBD ---------- */

export const doctors = [
  {
    n: '01',
    slot: 'doctor-sandeep',
    name: 'Dr. Sandeep Tiwari',
    initials: 'ST',
    qualification: 'MPT (PT)',
    role: 'Clinic Lead',
    specialisation: TBD,
    bio: '[TBD - clinic approval]',
  },
  {
    n: '02',
    slot: 'doctor-mahesh',
    name: 'Dr. Mahesh Tiwari',
    initials: 'MT',
    qualification: 'MPT (PT)',
    role: 'Clinic Lead',
    specialisation: TBD,
    bio: '[TBD - clinic approval]',
  },
] as const;

/* ---------- Clinic gallery slots (PRD §15) ---------- */

export const gallery = [
  { slot: ['clinic', 'exterior'], key: 'clinic', label: 'The clinic', alt: 'Inside Geeta Krishna Physiotherapy in Viram Khand, Gomti Nagar' },
  { slot: ['reception'], key: 'reception', label: 'Reception', alt: 'Reception area at Geeta Krishna Physiotherapy' },
  { slot: ['treatment-room'], key: 'treatment-room', label: 'Treatment room', alt: 'Treatment room at Geeta Krishna Physiotherapy' },
  { slot: ['equipment'], key: 'equipment', label: 'Equipment', alt: 'Physiotherapy equipment at Geeta Krishna Physiotherapy' },
] as const;

/* ---------- How it works (PRD §16) ---------- */

export const steps = [
  { n: '01', title: 'Assess', body: 'Share your concern and have it assessed by the clinic’s physiotherapists.' },
  { n: '02', title: 'Treat', body: 'Receive individualised care based on your assessment.' },
  { n: '03', title: 'Review', body: 'Progress is reviewed and the next steps are discussed with you.' },
] as const;

/* ---------- Reviews (PRD §17) ----------
 * Only add reviews the clinic has approved for republishing, with attribution.
 * Never fabricate. While empty, the section shows a clearly-marked placeholder.
 */
export interface Review {
  quote: string;
  author: string;
  source?: string;
}
export const reviews: Review[] = [];

/* ---------- Pricing (PRD §18) — never invent a price ---------- */

export const pricing = {
  label: 'Physiotherapy',
  /** Set to the clinic-confirmed amount (e.g. '₹800') and the placeholder disappears. */
  confirmedAmount: null as string | null,
  unit: 'per session',
  extras: [
    { label: 'Consultation', value: TBD },
    { label: 'Home visit', value: TBD },
  ],
} as const;

/* ---------- FAQ (PRD §20) ----------
 * `confirmed: false` answers are shown as TBD and excluded from FAQPage structured data.
 */

export interface Faq {
  q: string;
  a: string;
  confirmed: boolean;
}

export const faqs: Faq[] = [
  {
    q: 'What conditions do you provide physiotherapy for?',
    a: 'The clinic provides physiotherapy for back pain, neck pain, shoulder pain / frozen shoulder, knee pain / arthritis, hip pain, sciatica, slip disc, sports injuries and post-surgical rehabilitation. It also offers therapeutic exercise, balance and fall prevention, heat therapy and consultation. Each concern is assessed individually before care is recommended.',
    confirmed: true,
  },
  {
    q: 'How do I contact the clinic?',
    a: `You can message the clinic on WhatsApp or call ${clinic.phone.display}. Tell them what you’re experiencing and they will help you with the next step.`,
    confirmed: true,
  },
  {
    q: 'What are the clinic timings?',
    a: 'Monday to Saturday, 9 AM–1 PM and 4 PM–8 PM. The clinic is closed on Sunday.',
    confirmed: true,
  },
  {
    q: 'Where is the clinic located?',
    a: `${clinic.name}, ${clinic.address.street}, ${clinic.address.area}, ${clinic.address.city}, ${clinic.address.region} ${clinic.address.postalCode}.`,
    confirmed: true,
  },
  {
    q: 'Do you treat sports injuries?',
    a: 'Yes — sports injuries are one of the concerns the clinic provides physiotherapy for. Message or call the clinic to discuss your situation.',
    confirmed: true,
  },
  { q: 'Do you offer home visits?', a: TBD, confirmed: false },
  { q: 'What is the starting price?', a: TBD, confirmed: false },
  { q: 'How long is a session?', a: TBD, confirmed: false },
];

/* ---------- SEO (PRD §34) ---------- */

export const seo = {
  title: 'Physiotherapist in Gomti Nagar, Lucknow | Geeta Krishna Physiotherapy',
  description:
    'Geeta Krishna Physiotherapy in Gomti Nagar, Lucknow. Physiotherapy for back pain, neck pain, knee pain, sports injuries, rehabilitation and more. Contact the clinic via WhatsApp or phone.',
} as const;
