// frontend/src/pages/finance/utils/judgmentFreeMessages.js
// ════════════════════════════════════════════════════════════════
// JUDGMENT-FREE MESSAGES - Warm, gentle guidance for SA financial journey
// All messages validate user experience without shame or judgment
// ════════════════════════════════════════════════════════════════

// ── From FamilySupportPlanner.js ──────────────────────────────
export const WISDOM_MESSAGES = [
  'Umuntu ngumuntu ngabantu — but you can\'t pour from an empty cup.',
  'Supporting family is beautiful. Destroying yourself isn\'t.',
  'The best gift you can give your family is your own financial stability.',
  'Setting boundaries isn\'t selfish — it\'s how love becomes sustainable.',
  'You didn\'t create these circumstances. You\'re doing your best.',
  'A tree with strong roots can shelter many. Take care of your roots.',
  'Your ancestors would want you to thrive, not just survive.',
];

export const BOUNDARY_SCRIPTS = [
  {
    situation: 'When a relative asks for money you don\'t have',
    script: '"I hear you, and I wish I could help right now. My budget is already committed this month. I can help with R___ next month if you still need it."',
    tip: 'Offering a specific future amount shows you care without breaking your budget.',
  },
  {
    situation: 'When multiple people ask at the same time',
    script: '"I\'ve already committed my support budget for this month. I have to be fair to everyone I\'m helping, including myself."',
    tip: 'Having a fixed "support budget" makes it easier to say no without guilt.',
  },
  {
    situation: 'When asked to pay for something beyond your means',
    script: '"I can contribute R___ towards that. I know it\'s not the full amount, but that\'s what I can manage without putting myself in trouble."',
    tip: 'Partial help is still help. You don\'t have to cover everything.',
  },
  {
    situation: 'When you need to reduce what you\'re giving',
    script: '"Things have changed with my expenses. I need to adjust what I can give from R___ to R___. I\'m still committed to helping — just at a level I can sustain."',
    tip: 'Reducing is better than stopping completely. Sustainability matters.',
  },
  {
    situation: 'When guilt-tripped about "forgetting where you come from"',
    script: '"I haven\'t forgotten. The R___ I send every month proves that. But I also need to build something so I can help more in the future."',
    tip: 'You\'re not selfish for planning ahead. You\'re being strategic.',
  },
  {
    situation: 'When asked to take out a loan for someone',
    script: '"I love you, but I can\'t take on debt for this. If I get into financial trouble, I won\'t be able to help anyone — including you."',
    tip: 'Never go into debt for family support. It creates a cycle that hurts everyone.',
  },
];

export const GOLDEN_RULES = [
  {
    number: 1,
    rule: "Fix your amount, not theirs",
    explanation: "Decide what YOU can give monthly. Don't let requests set your budget."
  },
  {
    number: 2,
    rule: "Pay yourself first",
    explanation: "Rent, food, transport, savings — THEN family support. You can't help from a hospital bed."
  },
  {
    number: 3,
    rule: "Never borrow to give",
    explanation: "Taking out loans to support family creates a cycle that hurts everyone long-term."
  },
  {
    number: 4,
    rule: "Teach, don't just transfer",
    explanation: "Where possible, help family build their own income. Buy the fishing rod, not just the fish."
  },
  {
    number: 5,
    rule: "Review quarterly, not emotionally",
    explanation: "Every 3 months, look at what you're giving. Adjust based on facts, not guilt."
  }
];

// ── From WalletRestingHelper.js ───────────────────────────────
export const SAVINGS_WISDOM = [
  'Money you don\'t touch grows faster than money you watch.',
  'Compound interest is the 8th wonder of the world. Start today.',
  'R500/month for 30 years at 10% = R1.1 million. Time is your superpower.',
  'The best time to start investing was 10 years ago. The second best time is today.',
  'Your future self will thank you for every rand you saved today.',
  'Rich people make money work. Smart people make money rest.',
];

export const SAVINGS_TIPS = {
  emergency: [
    'Start with 1 month of rent + food + transport as your first target',
    'Keep it in a money market account (better than savings, still instant access)',
    'Don\'t invest this — it needs to be available immediately',
    'Capitec, TymeBank, and Discovery all offer 6%+ money market rates',
  ],
  tfsa: [
    'R36,000 per year limit, R500,000 lifetime limit',
    'Start with R500/month — that\'s R6,000/year tax-free growth',
    'Choose a low-cost index fund (Satrix, 10X, Sygnia) inside the TFSA',
    'Don\'t withdraw unless emergency — you can\'t get the tax-free space back',
    'EasyEquities, FNB, Nedbank all offer easy TFSA accounts',
  ],
  ra: [
    'If you earn R30k/month, a R2k RA contribution saves ~R600 in tax',
    'That\'s like getting a 30% discount on your savings!',
    'Choose a low-cost provider: 10X, Sygnia, Allan Gray, Coronation',
    'Locked until 55 — this is a feature, not a bug. It forces you to save.',
    'You can withdraw 1/3 as cash at retirement (tax rules apply)',
  ],
  property: [
    'Aim for 10% deposit minimum (banks offer better rates)',
    'R1M property = R100k-R200k deposit needed',
    'Transfer duties: R0 under R1.1M property value',
    'Don\'t forget bond registration costs (~R30k) and moving costs',
    'Save in a high-interest savings account or money market',
  ]
};

export const SAVINGS_ORDER = [
  { step: 1, name: 'Emergency Fund (1-3 months)', color: '#3b82f6', description: 'Before anything else. This stops you going to loan sharks when life happens.' },
  { step: 2, name: 'Kill expensive debt', color: '#ef4444', description: 'Store cards (20%+), personal loans, credit cards. Pay these off before investing.' },
  { step: 3, name: 'Tax-Free Savings Account', color: '#10b981', description: 'R500/month into a TFSA. All growth is tax-free forever. Best deal in SA.' },
  { step: 4, name: 'Retirement Annuity', color: '#8b5cf6', description: 'Get your tax deduction. R2k/month RA = ~R600/month tax saving. Free money.' },
  { step: 5, name: 'Property / Additional Investments', color: '#f59e0b', description: 'Once 1-4 are covered, start saving for a deposit or extra investments.' }
];

// ── From CommuteShareHelper.js ────────────────────────────────
export const TRANSPORT_WISDOM = [
  'A car is a convenience, not a status symbol. Don\'t let it eat your salary.',
  'Every km you carpool saves you R3-5. That adds up to thousands.',
  'The real cost of your car isn\'t the payment — it\'s insurance + fuel + maintenance.',
  'Working from home 2 days/week saves R2,000-R4,000/month in transport.',
  'Your car loses 15-20% value per year. It\'s a tool, not an investment.',
];

export const TRANSPORT_TIPS = [
  'Work from home 2 days/week = 40% less fuel. Ask your employer.',
  'Gautrain + Uber from station is often cheaper than driving + parking in Sandton.',
  'Fuel is cheapest on the 1st Wednesday of the month (before increase announcements).',
  'Car insurance excess: increase to R5,000 to drop monthly premium by 15-25%.',
  'Service your car on schedule. Skipping a R2k service causes a R15k engine problem.',
];

// ── From GentleSpendingView.js ────────────────────────────────
export const CATEGORY_MESSAGES = {
  basicNeeds: [
    "Taking care of basics first is financial wisdom.",
    "A roof and food are non-negotiable - you're doing great.",
    "These expenses keep you safe and functioning."
  ],
  family: [
    "You're building generational wealth - what an honor.",
    "Remember: Secure your oxygen mask first before helping others.",
    "Setting boundaries is an act of love for everyone.",
    "Your support today plants trees for tomorrow's shade."
  ],
  future: [
    "Every rand saved is future-you breathing easier.",
    "Retirement may seem far, but compound interest loves early starters.",
    "Your emergency fund is your financial oxygen tank.",
    "RA contributions reduce your tax - smart move!"
  ],
  joy: [
    "Joy is not a luxury - it's necessary for a full life.",
    "You work hard. You deserve moments that make you smile.",
    "Self-care isn't selfish - it's how you stay strong for others.",
    "December memories are priceless. Plan for them."
  ]
};

export const BOUNDARY_TIPS = [
  "Consider a fixed monthly amount instead of ad-hoc giving",
  "Have an 'Umsebenzi budget' - once it's gone, it's gone",
  "It's okay to say 'I can help next month'"
];

export const INVESTMENT_TIPS = [
  "Start with R500/month in a Tax-Free Savings Account",
  "Consider a Retirement Annuity for tax benefits (up to 27.5% of income)",
  "Emergency fund first, then investments"
];

export const DECEMBER_TIPS = [
  "Travel costs increase by 30-50% in December",
  "Gift budget: R200-500 per close family member",
  "Food costs: Plan for 20% more than usual",
  "Start buying non-perishables from October"
];

// ── From GentleAlerts.js ──────────────────────────────────────
export const GENTLE_ALERT_MESSAGES = {
  success: [
    "🎉 You're killing it! Emergency fund at 25%!",
    "🌟 You've saved R5,000 this month! That's incredible!",
    "💚 Your family support is sustainable - what a gift to your loved ones.",
    "🏆 December fund at 50% - summer here we come!",
    "💰 You're saving 20% of your income. Future you is doing a happy dance."
  ],
  warning: [
    "⚠️ Your Basic Needs category is at 85% - just a gentle heads up",
    "💭 Family support is at 90% - remember your oxygen mask first",
    "🚗 Transport costs are 22% of your income - consider carpooling or public transport",
    "📊 You've allocated 100% of your income. No room for unexpected expenses.",
    "💳 Credit card interest is expensive. Try to pay more than the minimum."
  ],
  info: [
    "💡 Did you know? RA contributions reduce your taxable income by up to 27.5%",
    "📅 December is 10 months away. R500/month now = R5,000 for summer.",
    "🏦 TFSA lifetime limit: R500,000. All growth is tax-free forever.",
    "🤝 Stokvels are great - just make sure you can afford the monthly contribution.",
    "🏠 Bond registration costs about R30k. Start saving for it if you're planning to buy."
  ],
  celebration: [
    "🎓 3-month emergency fund reached! You're financially unshakable.",
    "🎯 R10,000 saved! That's a real achievement. Celebrate a little.",
    "🌟 6 months of consistent saving. Discipline looks good on you.",
    "💰 Debt-free feeling? That's financial freedom knocking.",
    "🎉 You're in the top 30% of South Africans with an emergency fund."
  ],
  encouragement: [
    "You're doing better than you think. Keep going.",
    "Every small step adds up. You've got this.",
    "Financial freedom isn't about being perfect. It's about being consistent.",
    "Your future self is cheering for you right now.",
    "Some progress is still progress. Be proud of yourself."
  ]
};

// ── General encouragement messages ────────────────────────────
export const GENERAL_ENCOURAGEMENT = [
  "You're exactly where you need to be on your financial journey.",
  "No shame, no judgment - just you and your goals.",
  "Every rand saved is a step toward freedom.",
  "You can't change yesterday, but you're shaping tomorrow.",
  "Your financial journey is unique. Go at your own pace.",
  "Be gentle with yourself. You're learning and growing."
];

// ── Welcome messages ──────────────────────────────────────────
export const WELCOME_MESSAGES = {
  default: "Let's plan your finances gently. No judgment, just SA reality.",
  returning: "Welcome back! Your SA financial plan is loaded.",
  reset: "Fresh start! Let's create a plan that works for SA reality."
};