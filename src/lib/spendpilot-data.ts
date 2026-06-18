import {
  BadgeDollarSign,
  BellRing,
  CalendarClock,
  Flame,
  Landmark,
  Lightbulb,
  PieChart,
  ReceiptText,
  ShieldCheck,
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
  { href: '/app/cards', label: 'Cards', icon: WalletCards },
];

export const userProfile = {
  name: 'Maya Chen',
  handle: '@maya.money',
  city: 'Brooklyn',
  plan: 'Float Pro',
  streak: 18,
};

export const accountCards = [
  {
    name: 'Everyday Checking',
    bank: 'Chase',
    balance: '$8,420.18',
    change: '+$1,240 payroll',
    tone: 'blue',
  },
  {
    name: 'Travel Card',
    bank: 'Amex',
    balance: '$1,834.22',
    change: '$420 left this cycle',
    tone: 'mint',
  },
  {
    name: 'Rainy Day',
    bank: 'SoFi',
    balance: '$14,500.00',
    change: '6.4 months covered',
    tone: 'black',
  },
];

export const moneyMood = [
  {
    label: 'Float today',
    value: '$186',
    detail: 'after bills, cards, and goals',
    icon: BadgeDollarSign,
  },
  {
    label: 'Bill pressure',
    value: 'Calm',
    detail: '2 small renewals this week',
    icon: CalendarClock,
  },
  { label: 'Streak', value: '18', detail: 'days checked in', icon: Flame },
];

export const liveFeed = [
  {
    merchant: 'Blue Bottle Coffee',
    category: 'Coffee',
    amount: '-$6.80',
    time: '8:42 AM',
    status: 'Auto-sorted',
    tone: 'blue',
  },
  {
    merchant: 'Spotify Duo',
    category: 'Subscriptions',
    amount: '-$16.99',
    time: 'Yesterday',
    status: 'Price changed',
    tone: 'warn',
  },
  {
    merchant: "Trader Joe's",
    category: 'Groceries',
    amount: '-$84.16',
    time: 'Tue',
    status: 'On plan',
    tone: 'good',
  },
  {
    merchant: 'Uber',
    category: 'Transport',
    amount: '-$31.22',
    time: 'Mon',
    status: 'Weekend spike',
    tone: 'warn',
  },
  {
    merchant: 'Payroll',
    category: 'Income',
    amount: '+$3,850.00',
    time: 'Jun 15',
    status: 'Cleared',
    tone: 'good',
  },
  {
    merchant: 'Sephora',
    category: 'Shopping',
    amount: '-$72.40',
    time: 'Jun 13',
    status: 'Treat fund',
    tone: 'pink',
  },
];

export const budgetRooms = [
  {
    name: 'Groceries',
    spent: '$612',
    limit: '$750',
    percent: 82,
    vibe: 'Hot but handled',
    color: 'bg-sky',
  },
  {
    name: 'Eating out',
    spent: '$284',
    limit: '$360',
    percent: 79,
    vibe: 'Weekend watch',
    color: 'bg-[#ffcf6e]',
  },
  {
    name: 'Shopping',
    spent: '$188',
    limit: '$300',
    percent: 63,
    vibe: 'Still good',
    color: 'bg-[#ff8fb3]',
  },
  {
    name: 'Transport',
    spent: '$144',
    limit: '$240',
    percent: 60,
    vibe: 'Under control',
    color: 'bg-mint',
  },
];

export const challenges = [
  { title: 'No-spend lunch streak', prize: '$42 projected save', progress: '4 of 5 days' },
  {
    title: 'Cancel one dusty subscription',
    prize: '$17 monthly save',
    progress: 'Ready to review',
  },
  { title: 'Roundups to rainy day', prize: '$96 this month', progress: '18 transfers' },
];

export const subscriptionStack = [
  { name: 'Spotify Duo', price: '$16.99', note: 'price changed +$2', action: 'Review' },
  { name: 'iCloud+', price: '$9.99', note: 'family storage', action: 'Keep' },
  { name: 'Hulu', price: '$18.99', note: 'unused 24 days', action: 'Pause' },
  { name: 'Canva Pro', price: '$14.99', note: 'work expense', action: 'Tag' },
];

export const appInsights = [
  {
    icon: Lightbulb,
    title: 'Weekend food spend is up 19%',
    body: 'Move $60 from shopping or set a Friday reminder before dinner plans lock in.',
  },
  {
    icon: ShieldCheck,
    title: 'Emergency fund covers 6.4 months',
    body: 'Ahead of target. Keep roundups on and pause extra transfers this week.',
  },
  {
    icon: Landmark,
    title: 'Rent cleared, cards are current',
    body: 'No major bills due for 5 days. Your float number is accurate through the weekend.',
  },
];

export const cardStack = [
  {
    name: 'Neon Debit',
    digits: '9934',
    balance: '$8,420.18',
    color: 'card-mint',
    network: 'VISA',
  },
  {
    name: 'Weekend Credit',
    digits: '4428',
    balance: '$1,834.22',
    color: 'card-blue',
    network: 'VISA',
  },
  {
    name: 'Black Reserve',
    digits: '1029',
    balance: '$14,500.00',
    color: 'card-black text-white',
    network: 'VISA',
  },
];

export const trustSignals = [
  'Connect only what you choose',
  'Review imports before saving',
  'Private keys stay server-side',
  'No dark-pattern alerts',
  'Export your complete history',
  'Installable as a PWA',
];

export const appMoments = [
  { label: 'Accounts synced', value: '12' },
  { label: 'Rules active', value: '48' },
  { label: 'Bills detected', value: '21' },
  { label: 'Saved in 30 days', value: '$412' },
];
