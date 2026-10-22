import {
  BellRing,
  PieChart,
  ReceiptText,
  Sparkles,
  Target,
  Trophy,
  WalletCards,
} from 'lucide-react';

export const productStats = [
  { value: '$186', label: 'your float today' },
  { value: '$42', label: 'recovered this week' },
  { value: '18', label: 'day streak' },
  { value: '< 5m', label: 'daily time in app' },
];

export const pressQuotes = [
  "It doesn't ask you to budget harder. It just shows what's actually yours.",
  'The first finance app that opens with one honest number, not a chart.',
  'Finally cancelled three subscriptions I forgot I was paying for.',
];

export const landingFeatures = [
  {
    icon: ReceiptText,
    title: 'Your float, always current',
    body: "Float removes rent, card payments, savings goals, upcoming bills, and quiet renewals before showing what's genuinely available right now.",
  },
  {
    icon: BellRing,
    title: 'Quiet leaks, surfaced early',
    body: 'Price changes, unused trials, duplicate tools, and sneaky renewals appear as review cards before they become surprise charges.',
  },
  {
    icon: Sparkles,
    title: 'Real answers, not more charts',
    body: 'Ask if dinner fits, why your spending shifted, which bill is next, or what to pause before payday. Get a direct answer.',
  },
  {
    icon: Trophy,
    title: "Habits that don't feel like work",
    body: 'Daily streaks, spending rooms, weekly recoveries, and a 5-minute check-in keep money admin from becoming a second job.',
  },
];

export const testimonials = [
  {
    quote: 'I stopped opening three apps before buying anything. Float just tells me the number.',
    name: 'Maya',
    role: 'Product designer, Brooklyn',
  },
  {
    quote: 'The morning brief is actually useful. It tells me what changed, not what I did wrong.',
    name: 'Andre',
    role: 'Founder, Austin',
  },
  {
    quote: 'Cancelled three subscriptions in the first week. Found $52 I had no idea was leaving.',
    name: 'Nina',
    role: 'Product lead, Seattle',
  },
];

export const lifestyleImages = [
  {
    src: 'https://images.pexels.com/photos/30535634/pexels-photo-30535634.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'A person using a smartphone and card in a cafe',
    label: 'Cafe checkout',
  },
  {
    src: 'https://images.pexels.com/photos/6331252/pexels-photo-6331252.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'A person checking purchases on a phone outside',
    label: 'Street spend',
  },
  {
    src: 'https://images.pexels.com/photos/5999820/pexels-photo-5999820.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'A professional using phone and laptop in a cafe',
    label: 'Money admin',
  },
];

export const appNav = [
  { href: '/app', label: 'Overview', icon: PieChart },
  { href: '/app/activity', label: 'Activity', icon: ReceiptText },
  { href: '/app/budgets', label: 'Budgets', icon: Target },
  { href: '/app/cards', label: 'Accounts', icon: WalletCards },
];

export const trustSignals = [
  'Connect only what you choose',
  'Review imports before saving',
  'Private keys stay server-side',
  'No dark-pattern alerts',
  'Export your complete history',
  'Installable as a PWA',
];
