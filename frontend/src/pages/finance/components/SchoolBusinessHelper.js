// frontend/src/pages/finance/components/SchoolBusinessHelper.js
import React, { useState } from 'react';

// ══════════════════════════════════════════════
// SCHOOL BUSINESSES — Safe, permission-based options
// ══════════════════════════════════════════════
const SCHOOL_BUSINESSES = {
  sweets: {
    name: 'School Sweets Pack',
    emoji: '🍬',
    color: '#10b981',
    tagline: 'Small sweets, big profits. Perfect for break time.',
    description: 'Sell mixed sweet packs during break. Small investment, quick sales.',
    permissionRequired: true,
    permissionGuide: [
      '📝 Ask your teacher/principal first',
      '🗣️ Explain: "I want to learn business skills"',
      '✅ Promise: Only during breaks, no class disruption',
      '💼 Show this business plan to them'
    ],
    startup: [
      { item: 'Mixed sweets (bulk pack)', cost: 45 },
      { item: 'Small resealable bags (50-pack)', cost: 15 },
      { item: 'Price labels/stickers', cost: 10 },
    ],
    products: [
      { name: 'Small pack (5 sweets)', cost: 1.5, sell: 5 },
      { name: 'Medium pack (10 sweets)', cost: 3, sell: 8 },
      { name: 'Big pack (20 sweets)', cost: 6, sell: 12 },
      { name: 'Special Friday pack', cost: 8, sell: 15 },
    ],
    defaultSalesPerDay: 10,
    tips: [
      'Mix popular sweets: Chappies, Wilson, Whispers, Toffees',
      'Friday = treat day. Add a lollipop to special packs',
      'Keep inventory simple: 3 pack sizes only',
      'Use clear bags so kids can see the sweets',
      'Sell only during break time — never during class',
      'Save 50% of profit, reinvest 50% in new stock',
    ],
    warning: 'ALWAYS get permission first. No permission = no business.',
    specialNote: '💰 Start with just R70 investment. Pay back in 1 week!',
  },

  fruit: {
    name: 'Healthy Fruit Packs',
    emoji: '🍎',
    color: '#f59e0b',
    tagline: 'Healthy snacks, happy teachers, good profits.',
    description: 'Sell fresh fruit packs. Teachers will support healthy options.',
    permissionRequired: true,
    permissionGuide: [
      '🍎 Position it as "healthy alternative to chips"',
      '👨‍🏫 Teachers are more likely to approve healthy snacks',
      '🏫 Ask Life Orientation/EMS teacher to mentor you',
      '📋 Show your hygiene plan: clean hands, fresh fruit'
    ],
    startup: [
      { item: 'Apples (10 pack)', cost: 25 },
      { item: 'Bananas (bunch of 6)', cost: 15 },
      { item: 'Oranges (6 pack)', cost: 20 },
      { item: 'Small bags/paper wraps', cost: 10 },
      { item: 'Hand sanitizer', cost: 20 },
    ],
    products: [
      { name: 'Apple slice pack', cost: 2, sell: 5 },
      { name: 'Banana + peanut butter', cost: 4, sell: 8 },
      { name: 'Orange segments pack', cost: 3, sell: 7 },
      { name: 'Fruit mix pack', cost: 5, sell: 10 },
    ],
    defaultSalesPerDay: 8,
    tips: [
      'Wash fruit at home, pack fresh daily',
      'Team up with 1-2 friends to share costs',
      'Monday = fresh stock day',
      'Offer "teacher special" — they\'ll support you',
      'Sell near sports fields after practice',
      'Hot days = more fruit sales. Check the weather!',
    ],
    warning: 'Hygiene is everything! Always wash fruit, clean hands, fresh packs daily.',
    specialNote: '🍏 Healthier than chips → easier to get permission!',
  },

  stationery: {
    name: 'Emergency Stationery Shop',
    emoji: '📏',
    color: '#3b82f6',
    tagline: 'Save the day when someone forgets a pen.',
    description: 'Sell emergency stationery: pens, pencils, erasers, paper.',
    permissionRequired: true,
    permissionGuide: [
      '✏️ Frame it as "helping classmates be prepared"',
      '📚 Math/EMS teachers often support this',
      '🕐 Sell only before school or during breaks',
      '📋 Show price list to teacher for approval'
    ],
    startup: [
      { item: 'Pens (pack of 10)', cost: 25 },
      { item: 'Pencils (pack of 10)', cost: 15 },
      { item: 'Erasers (pack of 10)', cost: 10 },
      { item: 'Sharpener (pack of 5)', cost: 12 },
      { item: 'Rulers (pack of 5)', cost: 15 },
    ],
    products: [
      { name: 'Pen', cost: 2.5, sell: 5 },
      { name: 'Pencil', cost: 1.5, sell: 3 },
      { name: 'Eraser', cost: 1, sell: 2 },
      { name: 'Pen + pencil combo', cost: 4, sell: 7 },
    ],
    defaultSalesPerDay: 12,
    tips: [
      'Test week = peak sales! Stock up before exams',
      'Keep inventory in your locker',
      'Simple price list: R5, R3, R2, R7',
      '"Emergency kit": pen, pencil, eraser for R10',
      'Offer to buy back unused pens at R2 (resell at R5)',
      'Friday = check stock, buy new on Saturday',
    ],
    warning: 'Keep it small. Don\'t carry too much stock. Focus on emergencies only.',
    specialNote: '📝 Exam/test weeks = 3× normal sales! Plan ahead.',
  },
};

// ══════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════
function SchoolBusinessHelper() {
  const [selectedBiz, setSelectedBiz] = useState('sweets');
  const [salesPerDay, setSalesPerDay] = useState(null);
  const [workDays, setWorkDays] = useState(5);
  const [hasPermission, setHasPermission] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(true);

  const biz = SCHOOL_BUSINESSES[selectedBiz];
  const effectiveSales = salesPerDay !== null ? salesPerDay : biz.defaultSalesPerDay;

  // Calculate startup cost
  const startupTotal = biz.startup.reduce((sum, item) => sum + item.cost, 0);

  // Average profit per sale
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

  return (
    <div className="school-business-helper">

      {/* ── PERMISSION WARNING ── */}
      <div className="permission-warning" style={{ borderColor: biz.color }}>
        <div className="warning-header">
          <span className="warning-icon">⚠️</span>
          <strong>IMPORTANT: Get Permission First!</strong>
        </div>
        <p>Never start a school business without teacher/principal permission.</p>
        <button 
          className={`permission-toggle ${showPermissionGuide ? 'active' : ''}`}
          onClick={() => setShowPermissionGuide(!showPermissionGuide)}
          style={{ background: biz.color }}
        >
          {showPermissionGuide ? 'Hide' : 'Show'} Permission Guide
        </button>
      </div>

      {/* ── PERMISSION GUIDE ── */}
      {showPermissionGuide && (
        <div className="permission-guide" style={{ borderColor: biz.color }}>
          <h3>📋 How to Ask for Permission</h3>
          {biz.permissionGuide.map((step, i) => (
            <div key={i} className="permission-step">
              <span className="step-number" style={{ background: biz.color }}>{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
          <div className="permission-checkbox">
            <label>
              <input 
                type="checkbox" 
                checked={hasPermission}
                onChange={(e) => setHasPermission(e.target.checked)}
              />
              <span>I understand I need permission first</span>
            </label>
          </div>
        </div>
      )}

      {/* ── BUSINESS SELECTOR ── */}
      <div className="business-selector">
        {Object.entries(SCHOOL_BUSINESSES).map(([key, b]) => (
          <button
            key={key}
            className={`business-option ${selectedBiz === key ? 'active' : ''}`}
            onClick={() => { setSelectedBiz(key); setSalesPerDay(null); }}
            style={selectedBiz === key ? { borderColor: b.color, background: `${b.color}15` } : {}}
          >
            <span className="business-emoji">{b.emoji}</span>
            <span className="business-name">{b.name}</span>
          </button>
        ))}
      </div>

      {/* ── SELECTED BUSINESS HEADER ── */}
      <div className="business-header" style={{ borderColor: biz.color }}>
        <div className="business-title">
          <span style={{ fontSize: '1.6rem' }}>{biz.emoji}</span>
          <div>
            <h3 style={{ color: biz.color, margin: 0 }}>{biz.name}</h3>
            <p className="business-tagline">{biz.tagline}</p>
          </div>
        </div>
        <p className="business-description">{biz.description}</p>
        
        {biz.specialNote && (
          <div className="business-special-note" style={{ background: `${biz.color}15`, borderColor: biz.color }}>
            💡 {biz.specialNote}
          </div>
        )}
      </div>

      {/* ── STARTUP COSTS ── */}
      <div className="business-section">
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
      <div className="business-section">
        <h3>📦 What You Can Sell</h3>
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
                R{(product.sell - product.cost).toFixed(1)} profit each
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROFIT CALCULATOR ── */}
      <div className="business-section">
        <h3>📊 Your Profit Calculator</h3>
        
        <div className="calc-inputs">
          <div className="calc-input-group">
            <label>Sales per day (during breaks)</label>
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
            <label>School days per week</label>
            <div className="calc-input-row">
              <button 
                className="calc-btn"
                onClick={() => setWorkDays(Math.max(1, workDays - 1))}
              >−</button>
              <span className="calc-value" style={{ color: biz.color }}>{workDays}</span>
              <button 
                className="calc-btn"
                onClick={() => setWorkDays(Math.min(5, workDays + 1))}
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
            <span>Weekly sales</span>
            <span>{weeklySales} items</span>
          </div>
          <div className="calc-result-row">
            <span>Weekly revenue</span>
            <span>R{weeklyRevenue}</span>
          </div>
          <div className="calc-result-row">
            <span>− Weekly costs (stock)</span>
            <span style={{ color: '#ef4444' }}>−R{weeklyCosts}</span>
          </div>
          
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
          💡 With R{avgProfit} average profit per item • R{monthlyProfit}/month for a learner means:
          <span className="perspective-items">
            {monthlyProfit >= 50 && <span>📚 {Math.floor(monthlyProfit / 25)} school books</span>}
            {monthlyProfit >= 100 && <span>🍔 {Math.floor(monthlyProfit / 15)} school lunches</span>}
            {monthlyProfit >= 150 && <span>🚌 {Math.floor(monthlyProfit / 10)} taxi trips</span>}
            {monthlyProfit >= 200 && <span>👟 {Math.floor(monthlyProfit / 80)} savings for shoes</span>}
          </span>
        </div>
      </div>

      {/* ── WARNING ── */}
      <div className="business-warning">
        ⚠️ {biz.warning}
      </div>

      {/* ── TIPS ── */}
      <div className="business-tips">
        <h3>🧠 Smart Tips for School Business</h3>
        {biz.tips.map((tip, i) => (
          <div key={i} className="tip-row">
            <span className="tip-bullet">→</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>

      {/* ── SCHOOL RULES ── */}
      <div className="school-rules">
        <h3>📌 School Business Rules</h3>
        <div className="rule">
          <span className="rule-number" style={{ background: biz.color }}>1</span>
          <div>
            <strong>Permission First, Business Second</strong>
            <p>No permission = no business. Get it in writing if possible.</p>
          </div>
        </div>
        <div className="rule">
          <span className="rule-number" style={{ background: biz.color }}>2</span>
          <div>
            <strong>Never Disrupt Classes</strong>
            <p>Only sell during breaks. Keep it quiet. Don't bother teachers during lessons.</p>
          </div>
        </div>
        <div className="rule">
          <span className="rule-number" style={{ background: biz.color }}>3</span>
          <div>
            <strong>Studies Come First</strong>
            <p>Your business should help your studies (buy books, save for school), not hurt your grades.</p>
          </div>
        </div>
      </div>

      {/* ── PARENT/TEACHER LETTER TEMPLATE ── */}
      <div className="letter-template" style={{ borderColor: biz.color }}>
        <h3>📝 Permission Request Template</h3>
        <div className="template-content">
          <p><strong>Dear [Teacher's Name],</strong></p>
          <p>I would like to start a small school business to learn about entrepreneurship. 
          I plan to sell {biz.name.toLowerCase()} during break times only.</p>
          <p>• I will not disrupt classes<br/>
             • I will keep the area clean<br/>
             • My studies come first<br/>
             • I will follow all school rules</p>
          <p>May I have your permission to try this?</p>
          <p><strong>Sincerely,<br/>[Your Name]<br/>Grade [Your Grade]</strong></p>
        </div>
        <button 
          className="copy-template-btn"
          style={{ background: biz.color }}
          onClick={() => {
            const text = `Dear [Teacher's Name],\n\nI would like to start a small school business to learn about entrepreneurship. I plan to sell ${biz.name.toLowerCase()} during break times only.\n\n• I will not disrupt classes\n• I will keep the area clean\n• My studies come first\n• I will follow all school rules\n\nMay I have your permission to try this?\n\nSincerely,\n[Your Name]\nGrade [Your Grade]`;
            navigator.clipboard.writeText(text);
            alert('Template copied! Paste it and fill in your details.');
          }}
        >
          📋 Copy Template to Clipboard
        </button>
      </div>

    </div>
  );
}

export default SchoolBusinessHelper;