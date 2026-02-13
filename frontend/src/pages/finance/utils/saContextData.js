// SA Tax Brackets 2024
export const SA_TAX_BRACKETS_2024 = [
  { min: 0, max: 237100, rate: 0.18, base: 0 },
  { min: 237101, max: 370500, rate: 0.26, base: 42678 },
  { min: 370501, max: 512800, rate: 0.31, base: 77362 },
  { min: 512801, max: 673000, rate: 0.36, base: 121475 },
  { min: 673001, max: 857900, rate: 0.39, base: 179147 },
  { min: 857901, max: 1817000, rate: 0.41, base: 251258 },
  { min: 1817001, max: Infinity, rate: 0.45, base: 644489 }
];

// SA Public Transport Options
export const PUBLIC_TRANSPORT_OPTIONS = {
  gautrain: { name: 'Gautrain', perTrip: 65, monthly: 2800, emoji: '🚆', areas: 'Joburg, Pretoria, OR Tambo' },
  metrorail: { name: 'Metrorail', perTrip: 12, monthly: 500, emoji: '🚂', areas: 'Cape Town, Joburg, Pretoria, Durban' },
  myCity: { name: 'MyCiti Bus', perTrip: 18, monthly: 780, emoji: '🚌', areas: 'Cape Town' },
  reaVaya: { name: 'Rea Vaya BRT', perTrip: 15, monthly: 650, emoji: '🚌', areas: 'Johannesburg' },
  taxi: { name: 'Minibus Taxi', perTrip: 20, monthly: 880, emoji: '🚐', areas: 'Nationwide' },
};

// SA Cultural Definitions
export const SA_CONTEXT = {
  stokvel: 'A community savings group where members contribute regularly and take turns receiving payouts. Used for groceries, investments, or emergencies.',
  umsebenzi: 'Traditional family ceremony or celebration (coming of age, memorial services, etc.) that often involves significant financial contributions from family members.',
  burialSociety: 'Community-based funeral insurance group where members contribute monthly to cover funeral costs when a member or their family passes away.',
  blackTax: 'Financial support provided by black professionals to extended family members. A reality for many, not a choice, but can be managed with boundaries.',
  lobola: 'Traditional bride price paid by a groom to the bride\'s family. Can range from R20,000 to R100,000+ depending on family expectations.',
  December: 'The most expensive month. Travel costs increase 30-50%, family gatherings, gifts, and back-to-school expenses in January.'
};

// Icon Mapping
export const ICON_MAP = {
  FaHome: 'FaHome',
  FaUsers: 'FaUsers',
  FaShieldAlt: 'FaShieldAlt',
  FaUmbrellaBeach: 'FaUmbrellaBeach',
  FaChartPie: 'FaChartPie',
  FaMoneyBillWave: 'FaMoneyBillWave'
};

// SA Savings Options
export const SAVINGS_OPTIONS = [
  {
    id: 'emergency', name: 'Emergency Fund', emoji: '🛡️', color: '#3b82f6',
    description: 'Your financial oxygen tank. 3-6 months of basic expenses.',
    returns: '5-7% (money market)', access: 'Instant', taxBenefit: 'None — but it saves you from debt'
  },
  {
    id: 'tfsa', name: 'Tax-Free Savings Account', emoji: '🏦', color: '#10b981',
    description: 'R36,000/year limit. All growth is TAX FREE.',
    returns: '8-12%', access: 'Anytime (lose tax-free space)', taxBenefit: 'ALL returns tax-free'
  },
  {
    id: 'ra', name: 'Retirement Annuity (RA)', emoji: '👴', color: '#8b5cf6',
    description: 'Tax deduction NOW + compound growth. SA\'s best tax hack.',
    returns: '9-14%', access: 'Locked until 55', taxBenefit: 'Reduces taxable income by up to 27.5%'
  },
  {
    id: 'property', name: 'Property Deposit', emoji: '🏠', color: '#f59e0b',
    description: 'Save for a 10-20% deposit. Bigger deposit = better rates.',
    returns: 'N/A — savings target', access: 'When buying', taxBenefit: 'None directly'
  }
];