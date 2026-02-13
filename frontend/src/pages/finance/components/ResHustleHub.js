// frontend/src/pages/finance/components/ResHustleHub.js
import React, { useState } from 'react';

// ══════════════════════════════════════════════
// CAMPUS BUSINESSES — Real options for res students
// ══════════════════════════════════════════════
const BUSINESSES = {
  food: {
    name: 'Kota & Sandwich Plug',
    emoji: '🍞',
    color: '#f59e0b',
    tagline: 'Feed the res. Hungry students = guaranteed customers.',
    description: 'Sell kotas, egg sandwiches, noodles & snacks from your room. The res kitchen is your factory.',
    startup: [
      { item: 'Bread (×5 loaves)', cost: 90 },
      { item: 'Eggs (tray of 30)', cost: 55 },
      { item: 'Polony (750g)', cost: 28 },
      { item: 'Cheese slices (×10)', cost: 35 },
      { item: 'Atchar jar', cost: 20 },
      { item: 'Chips (bulk pack)', cost: 40 },
      { item: 'Cooking oil (if frying)', cost: 32 },
    ],
    products: [
      { name: 'Egg sandwich', cost: 6, sell: 15 },
      { name: 'Kota (quarter)', cost: 12, sell: 30 },
      { name: 'Cheese & polony sandwich', cost: 8, sell: 18 },
      { name: 'Indomie noodles + egg', cost: 10, sell: 22 },
    ],
    defaultSalesPerDay: 8,
    tips: [
      'WhatsApp status every evening: "Kitchen open 6-10pm 🍞🔥"',
      'Bulk buy at Makro/Shoprite on Monday — saves 15-20%',
      'Golden rule: Don\'t eat your own stock',
      'Kota Friday = double sales. Prepare extra bread + fillings',
      'Offer a "combo deal" — sandwich + chips + drink for R25',
      'Keep a simple notebook: money in, money out, every day',
    ],
    warning: 'Check your res rules about cooking. Some allow microwaves only. Adapt your menu to what\'s allowed.',
  },

  laundry: {
    name: 'Laundry Boss',
    emoji: '👕',
    color: '#3b82f6',
    tagline: 'Students hate doing laundry. That\'s your opportunity.',
    description: 'Wash, dry & iron clothes for other students. Simple service, steady cash, repeat customers.',
    startup: [
      { item: 'Washing powder (2kg)', cost: 55 },
      { item: 'Fabric softener', cost: 30 },
      { item: 'Iron (if you don\'t have one)', cost: 150 },
      { item: 'Hangers (pack of 10)', cost: 25 },
      { item: 'Laundry basket/bag', cost: 35 },
      { item: 'Stain remover', cost: 28 },
    ],
    products: [
      { name: 'Wash + dry (1 load)', cost: 8, sell: 30 },
      { name: 'Wash + dry + iron', cost: 10, sell: 45 },
      { name: 'Iron only (5 items)', cost: 2, sell: 20 },
      { name: 'Express service (same day)', cost: 10, sell: 50 },
    ],
    defaultSalesPerDay: 3,
    tips: [
      'Offer weekly packages: "R100/week, I handle all your laundry"',
      'Collect Sunday night, deliver Tuesday — builds routine',
      'Ironing only = almost zero cost, pure profit',
      'Use res machines if available — saves electricity',
      'Label bags with room numbers — never mix up clothes',
      'Start with your floor, then expand to other floors',
    ],
    warning: 'Use res washing machines during off-peak hours. Always return clothes on time — trust is everything.',
  },

  print: {
    name: 'Print & Data Hub',
    emoji: '🖨️',
    color: '#8b5cf6',
    tagline: 'Everyone needs printing. No one wants to walk to the library.',
    description: 'Print assignments, sell data bundles & airtime. Become the one-stop shop in your res.',
    startup: [
      { item: 'Basic printer (second-hand)', cost: 500 },
      { item: 'Ink cartridge', cost: 150 },
      { item: 'Paper (1 ream = 500 pages)', cost: 55 },
      { item: 'Extension cord', cost: 45 },
      { item: 'Starting float for airtime/data', cost: 200 },
    ],
    products: [
      { name: 'Print (per page B&W)', cost: 0.5, sell: 2 },
      { name: 'Print (per page colour)', cost: 2, sell: 5 },
      { name: 'Binding/stapling', cost: 3, sell: 10 },
      { name: 'Wi-Fi hotspot (1hr)', cost: 3, sell: 8 },
    ],
    defaultSalesPerDay: 15,
    tips: [
      'Assignment deadline week = 3× normal sales. Stock up on ink & paper',
      'Sell airtime via your bank app — Capitec/FNB/Nedbank all allow it',
      'Offer "print + bind" combos for assignments',
      'Peak hours: 8-10pm night before due dates — stay open late',
      'Buy second-hand printer on Facebook Marketplace for R300-500',
      'Wi-Fi hotspot from your phone: sell 1hr slots when students run out of data',
    ],
    warning: 'Higher startup cost, but once the printer is paid off, it\'s almost pure profit. Pay it off within 2-3 weeks.',
  },

  // NEW: HAIR BRAIDING/BARBER BUSINESS
  hair: {
    name: 'Campus Barber/Braiding',
    emoji: '💇‍♂️',
    color: '#ec4899',
    tagline: 'Everyone needs a fresh cut. Be the campus barber.',
    description: 'Cut hair, braid, or do hairstyles for students. Low startup, high demand, great tips.',
    startup: [
      { item: 'Hair clippers (good quality)', cost: 300 },
      { item: 'Scissors + comb set', cost: 80 },
      { item: 'Cape/cloth (×2)', cost: 40 },
      { item: 'Disposable razors (pack of 10)', cost: 25 },
      { item: 'Hair products (gel, pomade)', cost: 50 },
      { item: 'Extension hair (for braiding, 1 pack)', cost: 150 },
      { item: 'Braiding thread & needles', cost: 30 },
    ],
    products: [
      { name: 'Basic haircut', cost: 2, sell: 50 },
      { name: 'Fade/style haircut', cost: 3, sell: 70 },
      { name: 'Beard trim', cost: 0, sell: 20 },
      { name: 'Simple braids (cornrows)', cost: 5, sell: 120 },
      { name: 'Full braiding (with extensions)', cost: 30, sell: 300 },
    ],
    defaultSalesPerDay: 2,
    tips: [
      'Start with just clippers and scissors — expand later',
      'Friday/Saturday = peak days for haircuts before weekend',
      'Take before/after photos for Instagram marketing',
      'Offer "student discount" but standard prices for others',
      'Learn 2-3 popular styles really well (fade, taper, etc)',
      'YouTube tutorials are your free training — practice on friends first',
      'Braiding takes longer but pays way more. Charge by hour (R80-150/hr)',
      'Keep your tools clean — hygiene is everything',
      'Get a foldable chair and mirror — your mobile barbershop',
    ],
    warning: 'Make sure your res allows this. Some require permission. Start small, build reputation.',
    specialNote: '🕒 Time matters: A haircut takes 30min, braiding takes 2-4hrs. Price accordingly!',
  },
};

// ══════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════
function ResHustleHub() {
  const [selectedBiz, setSelectedBiz] = useState('food');
  const [salesPerDay, setSalesPerDay] = useState(null); // null = use default
  const [workDays, setWorkDays] = useState(5);

  const biz = BUSINESSES[selectedBiz];
  const effectiveSales = salesPerDay !== null ? salesPerDay : biz.defaultSalesPerDay;

  // Calculate startup cost
  const startupTotal = biz.startup.reduce((sum, item) => sum + item.cost, 0);

  // Average profit per sale (weighted average of products)
  const avgCost = biz.products.reduce((sum, p) => sum + p.cost, 0) / biz.products.length;
  const avgSell = biz.products.reduce((sum, p) => sum + p.sell, 0) / biz.products.length;
  const avgProfit = Math.round(avgSell - avgCost);

  // Weekly & monthly projections
  const weeklySales = effectiveSales * workDays;
  const weeklyRevenue = Math.round(weeklySales * avgSell);
  const weeklyCosts = Math.round(weeklySales * avgCost);
  const weeklyProfit = weeklyRevenue - weeklyCosts;
  const monthlyProfit = Math.round(weeklyProfit * 4.33);

  // Weeks to recover startup
  const weeksToRecover = weeklyProfit > 0 ? Math.ceil(startupTotal / weeklyProfit) : 0;

  // Special calculation for hair business (time-based)
  const isHairBusiness = selectedBiz === 'hair';
  const avgTimePerService = isHairBusiness ? 1.5 : 0.5; // hours
  const weeklyHours = weeklySales * avgTimePerService;
  const hourlyRate = weeklyHours > 0 ? Math.round(weeklyProfit / weeklyHours) : 0;

  return (
    <div className="res-hustle-hub">

      {/* ── BUSINESS SELECTOR ── */}
      <div className="hustle-selector">
        {Object.entries(BUSINESSES).map(([key, b]) => (
          <button
            key={key}
            className={`hustle-option ${selectedBiz === key ? 'active' : ''}`}
            onClick={() => { setSelectedBiz(key); setSalesPerDay(null); }}
            style={selectedBiz === key ? { borderColor: b.color, background: `${b.color}15` } : {}}
          >
            <span className="hustle-option-emoji">{b.emoji}</span>
            <span className="hustle-option-name">{b.name}</span>
          </button>
        ))}
      </div>

      {/* ── SELECTED BUSINESS HEADER ── */}
      <div className="hustle-header" style={{ borderColor: biz.color }}>
        <div className="hustle-title">
          <span style={{ fontSize: '1.6rem' }}>{biz.emoji}</span>
          <div>
            <h3 style={{ color: biz.color, margin: 0 }}>{biz.name}</h3>
            <p className="hustle-tagline">{biz.tagline}</p>
          </div>
        </div>
        <p className="hustle-description">{biz.description}</p>
        
        {/* Special note for hair business */}
        {biz.specialNote && (
          <div className="hustle-special-note" style={{ background: `${biz.color}15`, borderColor: biz.color }}>
            💡 {biz.specialNote}
          </div>
        )}
      </div>

      {/* ── STARTUP COSTS ── */}
      <div className="hustle-section">
        <h3>💰 What You Need to Start</h3>
        <div className="startup-list">
          {biz.startup.map((item, i) => (
            <div key={i} className="startup-item">
              <span>{item.item}</span>
              <span className="startup-cost">R{item.cost}</span>
            </div>
          ))}
          <div className="startup-total" style={{ borderColor: biz.color }}>
            <span>Total startup</span>
            <span style={{ color: biz.color, fontWeight: 800, fontSize: '1.2rem' }}>
              R{startupTotal}
            </span>
          </div>
        </div>
      </div>

      {/* ── WHAT YOU CAN SELL ── */}
      <div className="hustle-section">
        <h3>📦 What You Can Offer</h3>
        <div className="product-grid">
          {biz.products.map((product, i) => (
            <div key={i} className="product-card">
              <div className="product-name">{product.name}</div>
              <div className="product-prices">
                <span className="product-cost">Cost: R{product.cost}</span>
                <span className="product-arrow">→</span>
                <span className="product-sell">Sell: R{product.sell}</span>
              </div>
              <div className="product-profit" style={{ color: biz.color }}>
                R{product.sell - product.cost} profit each
                {isHairBusiness && product.name.includes('braid') && (
                  <span className="time-note"> (2-4 hrs)</span>
                )}
                {isHairBusiness && product.name.includes('haircut') && (
                  <span className="time-note"> (30 mins)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROFIT CALCULATOR ── */}
      <div className="hustle-section">
        <h3>📊 Your Profit Calculator</h3>
        
        <div className="calc-inputs">
          <div className="calc-input-group">
            <label>
              {isHairBusiness ? 'Clients per day' : 'Sales per day'}
            </label>
            <div className="calc-input-row">
              <button 
                className="calc-btn"
                onClick={() => setSalesPerDay(Math.max(1, effectiveSales - 1))}
              >−</button>
              <span className="calc-value" style={{ color: biz.color }}>{effectiveSales}</span>
              <button 
                className="calc-btn"
                onClick={() => setSalesPerDay(effectiveSales + 1)}
              >+</button>
            </div>
          </div>
          <div className="calc-input-group">
            <label>Days per week</label>
            <div className="calc-input-row">
              <button 
                className="calc-btn"
                onClick={() => setWorkDays(Math.max(1, workDays - 1))}
              >−</button>
              <span className="calc-value" style={{ color: biz.color }}>{workDays}</span>
              <button 
                className="calc-btn"
                onClick={() => setWorkDays(Math.min(7, workDays + 1))}
              >+</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="calc-results">
          <div className="calc-result-row">
            <span>Average profit per item</span>
            <span style={{ color: biz.color, fontWeight: 600 }}>R{avgProfit}</span>
          </div>
          <div className="calc-result-row">
            <span>{isHairBusiness ? 'Weekly clients' : 'Weekly sales'}</span>
            <span>{weeklySales} {isHairBusiness ? 'clients' : 'items'}</span>
          </div>
          <div className="calc-result-row">
            <span>Weekly revenue</span>
            <span>R{weeklyRevenue}</span>
          </div>
          <div className="calc-result-row">
            <span>− Weekly costs (stock)</span>
            <span style={{ color: '#ef4444' }}>−R{weeklyCosts}</span>
          </div>
          
          {/* Time calculation for hair business */}
          {isHairBusiness && weeklyHours > 0 && (
            <>
              <div className="calc-result-row">
                <span>Total weekly hours</span>
                <span>{weeklyHours.toFixed(1)} hours</span>
              </div>
              <div className="calc-result-row">
                <span>Hourly rate</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>
                  R{hourlyRate}/hour
                </span>
              </div>
            </>
          )}
          
          <div className="calc-result-row profit-row" style={{ borderColor: biz.color }}>
            <span>Weekly profit</span>
            <span style={{ color: biz.color, fontWeight: 800, fontSize: '1.3rem' }}>
              R{weeklyProfit}
            </span>
          </div>
          <div className="calc-result-row monthly-row">
            <span>Monthly profit</span>
            <span style={{ color: biz.color, fontWeight: 800, fontSize: '1.1rem' }}>
              ~R{monthlyProfit}/month
            </span>
          </div>
        </div>

        {/* Payback period */}
        <div className="payback-info" style={{ borderColor: biz.color }}>
          ⏱️ Startup cost of R{startupTotal} paid back in <strong style={{ color: biz.color }}>
            {weeksToRecover} week{weeksToRecover !== 1 ? 's' : ''}
          </strong> — after that, it's pure profit.
        </div>

        {/* Perspective */}
        <div className="profit-perspective">
          💡 With R{avgProfit} average profit per item • R{monthlyProfit}/month means:
          <span className="perspective-items">
            {monthlyProfit >= 500 && <span>📱 {Math.floor(monthlyProfit / 30)} airtime vouchers</span>}
            {monthlyProfit >= 300 && <span>🚕 {Math.floor(monthlyProfit / 15)} taxi rides</span>}
            {monthlyProfit >= 200 && <span>🍔 {Math.floor(monthlyProfit / 35)} kotas</span>}
            {monthlyProfit >= 100 && <span>📚 {Math.floor(monthlyProfit / 50)} textbook prints</span>}
            {monthlyProfit >= 800 && <span>💇‍♂️ {Math.floor(monthlyProfit / 70)} haircuts for yourself</span>}
          </span>
        </div>
      </div>

      {/* ── RULES & WARNING ── */}
      <div className="hustle-warning">
        ⚠️ {biz.warning}
      </div>

      {/* ── TIPS ── */}
      <div className="hustle-tips">
        <h3>🧠 Pro Tips</h3>
        {biz.tips.map((tip, i) => (
          <div key={i} className="tip-row">
            <span className="tip-bullet">→</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>

      {/* ── SKILL DEVELOPMENT SECTION (for hair business) ── */}
      {isHairBusiness && (
        <div className="skill-development" style={{ borderColor: biz.color }}>
          <h3>🎓 Learn the Skills (Free Resources)</h3>
          <div className="skill-resources">
            <div className="resource-card">
              <span className="resource-icon">🎥</span>
              <div>
                <strong>YouTube Channels:</strong>
                <p>• Chris Bossio (Modern cuts)<br/>
                   • 360 Jeezy (Fade tutorials)<br/>
                   • African Hair Braiding (Beginner braids)</p>
              </div>
            </div>
            <div className="resource-card">
              <span className="resource-icon">📱</span>
              <div>
                <strong>Instagram for Inspiration:</strong>
                <p>• Follow local barbers<br/>
                   • Save styles you like<br/>
                   • Watch Reels tutorials</p>
              </div>
            </div>
            <div className="resource-card">
              <span className="resource-icon">👨‍🏫</span>
              <div>
                <strong>Practice Order:</strong>
                <p>1. Basic clipper work on friends<br/>
                   2. Simple fades<br/>
                   3. Cornrows & basic braids<br/>
                   4. Complex styles</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GOLDEN RULES ── */}
      <div className="golden-rules">
        <h3>📌 3 Golden Rules of Res Business</h3>
        <div className="rule">
          <span className="rule-number" style={{ background: biz.color }}>1</span>
          <div>
            <strong>Start Small, Grow Slow</strong>
            <p>Buy only what you need. Don't get R500 clippers if R300 will do. Upgrade when you have regular customers.</p>
          </div>
        </div>
        <div className="rule">
          <span className="rule-number" style={{ background: biz.color }}>2</span>
          <div>
            <strong>Quality = Repeat Customers</strong>
            <p>One bad haircut can ruin your reputation. Take your time, do it right. Happy customers come back and bring friends.</p>
          </div>
        </div>
        <div className="rule">
          <span className="rule-number" style={{ background: biz.color }}>3</span>
          <div>
            <strong>Track Every Rand</strong>
            <p>A simple notebook: what you spent, what you earned, what's next. No notebook = no idea if you're making or losing money.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ResHustleHub;