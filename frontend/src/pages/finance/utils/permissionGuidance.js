// Boundary scripts for difficult conversations
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

// Conversation starters for "Black Tax" discussions
export const CONVERSATION_STARTERS = [
  {
    situation: "Starting the conversation with family",
    script: "I want to help sustainably for the long term. Can we agree on a fixed monthly amount that works for both of us?",
    context: "This frames support as ongoing commitment, not one-off requests."
  },
  {
    situation: "Setting expectations with siblings",
    script: "Let's be transparent about what each of us can contribute. I don't want anyone to feel resentful later.",
    context: "Encourages shared responsibility and prevents hidden expectations."
  },
  {
    situation: "Discussing umsebenzi/lobola contributions",
    script: "I have R___ set aside for the family ceremony. I know it's not the full amount, but it's what I can give without stress.",
    context: "Giving a fixed amount upfront prevents scope creep."
  },
  {
    situation: "When parents ask for more than you can give",
    script: "I want to make sure I'm stable so I can help for years to come. Right now, R___ is what I can sustainably give.",
    context: "Focuses on long-term sustainability vs short-term relief."
  }
];

// Golden rules for sustainable giving
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

// Emergency request scripts
export const EMERGENCY_SCRIPTS = [
  "I've already helped others this month. I can help next month.",
  "My emergency buffer is empty for this month. Can we revisit this in 30 days?",
  "I have R___ left in my support budget. I can contribute that much."
];