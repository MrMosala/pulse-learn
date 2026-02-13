// frontend/src/pages/finance/components/FoodBudgetHelper.js
import React, { useState } from 'react';

// ══════════════════════════════════════════════
// SA GROCERY PRICES (2026 averages)
// ══════════════════════════════════════════════
const GROCERIES = {
  pap_2_5kg:     { name: 'Super Maize Meal (2.5kg)', price: 32, emoji: '🌽', lastsWeeks: 2 },
  bread:         { name: 'Albany Bread (white)', price: 18, emoji: '🍞', lastsWeeks: 1 },
  eggs_6:        { name: 'Eggs (6-pack)', price: 30, emoji: '🥚', lastsWeeks: 1 },
  beans_tin:     { name: 'Baked Beans (410g)', price: 16, emoji: '🫘', lastsWeeks: 1 },
  onions_1kg:    { name: 'Onions (1kg)', price: 18, emoji: '🧅', lastsWeeks: 1 },
  peanut_butter: { name: 'Peanut Butter (400g)', price: 30, emoji: '🥜', lastsWeeks: 2 },
  salt:          { name: 'Salt (500g)', price: 8,  emoji: '🧂', lastsWeeks: 8 },
  cooking_oil:   { name: 'Cooking Oil (750ml)', price: 32, emoji: '🫗', lastsWeeks: 4 },
  sugar_1kg:     { name: 'Sugar (1kg)', price: 22, emoji: '🍬', lastsWeeks: 3 },
  tea_bags:      { name: 'Joko Tea (40 bags)', price: 25, emoji: '🍵', lastsWeeks: 4 },
  rice_2kg:      { name: 'Rice (2kg)', price: 38, emoji: '🍚', lastsWeeks: 2 },
  chicken_1kg:   { name: 'Chicken Portions (1kg)', price: 60, emoji: '🍗', lastsWeeks: 1 },
  tinned_fish:   { name: 'Pilchards (400g)', price: 22, emoji: '🐟', lastsWeeks: 1 },
  tomatoes_1kg:  { name: 'Tomatoes (1kg)', price: 22, emoji: '🍅', lastsWeeks: 1 },
  cabbage:       { name: 'Cabbage (head)', price: 15, emoji: '🥬', lastsWeeks: 1 },
  potatoes_2kg:  { name: 'Potatoes (2kg)', price: 28, emoji: '🥔', lastsWeeks: 1 },
  milk_1L:       { name: 'Long Life Milk (1L)', price: 18, emoji: '🥛', lastsWeeks: 1 },
  polony:        { name: 'Polony (750g)', price: 28, emoji: '🌭', lastsWeeks: 1 },
  mince_500g:    { name: 'Beef Mince (500g)', price: 55, emoji: '🥩', lastsWeeks: 1 },
  samp_1kg:      { name: 'Samp (1kg)', price: 18, emoji: '🌾', lastsWeeks: 2 },
  amasi_500ml:   { name: 'Amasi (500ml)', price: 14, emoji: '🥛', lastsWeeks: 1 },
  bananas_bunch: { name: 'Bananas (bunch of 6)', price: 15, emoji: '🍌', lastsWeeks: 1 },
  soup_packet:   { name: 'Soup Packet (Knorr)', price: 8, emoji: '🥣', lastsWeeks: 1 },
  eggs_tray:     { name: 'Eggs (tray of 30)', price: 55, emoji: '🥚', lastsWeeks: 1 },
};

// ══════════════════════════════════════════════
// PRIORITY SHOPPING LIST
// Buy from top → down. Stop when money runs out.
// Sorted by: survival essentials first, then nutrition upgrades, then comfort
// ══════════════════════════════════════════════
const PRIORITY_LIST = [
  // === ESSENTIALS (you need these to eat) ===
  { item: GROCERIES.pap_2_5kg,     qty: 1, priority: 'essential', note: 'Your base — breakfast, lunch, dinner' },
  { item: GROCERIES.bread,         qty: 1, priority: 'essential', note: 'Sandwiches for lunch' },
  { item: GROCERIES.eggs_6,        qty: 1, priority: 'essential', note: 'Cheapest protein — fry, boil, scramble' },
  { item: GROCERIES.beans_tin,     qty: 2, priority: 'essential', note: 'Protein + fibre — stretches any meal' },
  { item: GROCERIES.onions_1kg,    qty: 1, priority: 'essential', note: 'Makes everything taste better' },
  { item: GROCERIES.salt,          qty: 1, priority: 'essential', note: 'One-time buy, lasts months' },

  // === SMART ADDS (way more variety) ===
  { item: GROCERIES.peanut_butter, qty: 1, priority: 'smart', note: 'Breakfast sorted — lasts 2 weeks' },
  { item: GROCERIES.cooking_oil,   qty: 1, priority: 'smart', note: 'For frying — lasts a month' },
  { item: GROCERIES.bread,         qty: 1, priority: 'smart', note: 'Second loaf for the week' },
  { item: GROCERIES.sugar_1kg,     qty: 1, priority: 'smart', note: 'For tea/pap — lasts 3 weeks' },
  { item: GROCERIES.tea_bags,      qty: 1, priority: 'smart', note: 'Morning tea — lasts a month' },
  { item: GROCERIES.beans_tin,     qty: 1, priority: 'smart', note: 'Third tin — you won\'t run out' },

  // === NUTRITION BOOST (protein + veg) ===
  { item: GROCERIES.rice_2kg,      qty: 1, priority: 'nutrition', note: 'Second staple — change from pap' },
  { item: GROCERIES.chicken_1kg,   qty: 1, priority: 'nutrition', note: 'Sunday stew — portions for 3 days' },
  { item: GROCERIES.eggs_6,        qty: 1, priority: 'nutrition', note: 'Extra eggs = extra meals' },
  { item: GROCERIES.cabbage,       qty: 1, priority: 'nutrition', note: 'Cheap veg — fried cabbage is 🔥' },
  { item: GROCERIES.tomatoes_1kg,  qty: 1, priority: 'nutrition', note: 'For stews and chakalaka' },
  { item: GROCERIES.tinned_fish,   qty: 1, priority: 'nutrition', note: 'Quick protein — eat with bread or pap' },
  { item: GROCERIES.potatoes_2kg,  qty: 1, priority: 'nutrition', note: 'Filling — chips, mash, or stew' },
  { item: GROCERIES.milk_1L,       qty: 1, priority: 'nutrition', note: 'For tea and soft pap' },

  // === COMFORT (you deserve this) ===
  { item: GROCERIES.polony,        qty: 1, priority: 'comfort', note: 'Sandwich upgrade — kota filler' },
  { item: GROCERIES.mince_500g,    qty: 1, priority: 'comfort', note: 'Mince + onion gravy = weeknight treat' },
  { item: GROCERIES.samp_1kg,      qty: 1, priority: 'comfort', note: 'Samp & beans — proper SA comfort' },
  { item: GROCERIES.amasi_500ml,   qty: 1, priority: 'comfort', note: 'Cheaper than yoghurt, lasts longer' },
  { item: GROCERIES.bananas_bunch, qty: 1, priority: 'comfort', note: 'Quick breakfast + energy for class' },
  { item: GROCERIES.soup_packet,   qty: 2, priority: 'comfort', note: 'Warm lunch in winter — R8 each' },
];

// Average vendor/spaza meal price
const VENDOR_MEAL_AVG = 35;

// Priority labels & colors
const PRIORITY_LABELS = {
  essential: { label: '🔴 ESSENTIALS — Buy These First', color: '#ef4444' },
  smart:     { label: '🟡 SMART ADDS — Stretch Your Meals', color: '#f59e0b' },
  nutrition: { label: '🟢 NUTRITION BOOST — Protein & Veg', color: '#10b981' },
  comfort:   { label: '✨ COMFORT — You Deserve This', color: '#8b5cf6' },
};

// ══════════════════════════════════════════════
// MEAL PLANS (same as before)
// ══════════════════════════════════════════════
const MEAL_PLANS = {
  survival: [
    { day: 'Monday',    breakfast: 'Pap + peanut butter', lunch: 'PB sandwich', dinner: 'Pap + beans' },
    { day: 'Tuesday',   breakfast: 'Egg sandwich',        lunch: 'Bean sandwich', dinner: 'Pap + fried egg + onion' },
    { day: 'Wednesday', breakfast: 'Pap + peanut butter', lunch: 'PB sandwich', dinner: 'Beans + bread' },
    { day: 'Thursday',  breakfast: 'Egg sandwich',        lunch: 'Bean sandwich', dinner: 'Pap + beans + onion' },
    { day: 'Friday',    breakfast: 'Pap + peanut butter', lunch: 'Egg sandwich', dinner: 'Pap + beans' },
    { day: 'Saturday',  breakfast: 'Egg + bread',         lunch: 'PB sandwich', dinner: 'Pap + fried onion + beans' },
    { day: 'Sunday',    breakfast: 'Pap + peanut butter', lunch: 'Bean sandwich', dinner: 'Pap + egg + beans' },
  ],
  balanced: [
    { day: 'Monday',    breakfast: 'Egg + bread + tea', lunch: 'Rice + beans', dinner: 'Pap + chicken stew' },
    { day: 'Tuesday',   breakfast: 'Pap + milk',        lunch: 'Chicken sandwich', dinner: 'Rice + cabbage + egg' },
    { day: 'Wednesday', breakfast: 'PB sandwich + tea',  lunch: 'Rice + tinned fish', dinner: 'Pap + beans + tomato' },
    { day: 'Thursday',  breakfast: 'Egg + bread + tea',  lunch: 'Potato + egg', dinner: 'Rice + chicken stew' },
    { day: 'Friday',    breakfast: 'Pap + milk',         lunch: 'PB sandwich', dinner: 'Pap + chakalaka-style beans' },
    { day: 'Saturday',  breakfast: 'Egg sandwich + tea', lunch: 'Leftover chicken + rice', dinner: 'Pap + cabbage + potato' },
    { day: 'Sunday',    breakfast: 'Egg + bread + tea',  lunch: 'Rice + beans', dinner: 'Full plate: pap + chicken + cabbage' },
  ],
  comfortable: [
    { day: 'Monday',    breakfast: 'Egg + bread + tea', lunch: 'Mince vetkoek', dinner: 'Pap + chicken stew + cabbage' },
    { day: 'Tuesday',   breakfast: 'Amasi + banana',    lunch: 'Rice + beans + polony', dinner: 'Samp + beans + tomato gravy' },
    { day: 'Wednesday', breakfast: 'Egg + bread + tea',  lunch: 'Chicken wrap', dinner: 'Rice + mince + onion gravy' },
    { day: 'Thursday',  breakfast: 'PB + banana + tea',  lunch: 'Tinned fish + bread', dinner: 'Pap + chicken + cabbage' },
    { day: 'Friday',    breakfast: 'Egg + bread + tea',  lunch: 'Polony sandwich + soup', dinner: 'Kota (quarter bread + fillings)' },
    { day: 'Saturday',  breakfast: 'Amasi + bread',      lunch: 'Leftover mince + rice', dinner: 'Pap + chakalaka beans + egg' },
    { day: 'Sunday',    breakfast: 'Full: egg, bread, polony, tea', lunch: 'Rice + chicken', dinner: 'Sunday plate: pap, chicken, cabbage, potato' },
  ],
};

const COOKING_TIPS = {
  survival: [
    'Buy pap in bulk (10kg = ~R55, lasts 3+ weeks)',
    'One pot of beans feeds you 2-3 meals',
    'Fried onion + salt makes anything taste better',
  ],
  balanced: [
    'Cook chicken on Sunday — portions last Mon, Tue, Thu',
    'Chakalaka-style: beans + onion + tomato + chilli = 🔥',
    'A tray of 30 eggs (R55) beats 5×6-packs (R150)',
    'Shoprite marks down chicken on Wednesday evenings',
  ],
  comfortable: [
    'Sunday cook-up: make chicken stew + bean pot for the week',
    'Freeze mince in portions — defrost what you need',
    'Kota Friday: quarter bread + polony + atchar + chips = treat for ~R25',
    'Amasi is cheaper than yoghurt and lasts longer',
  ],
};

// ══════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════
function FoodBudgetHelper() {
  const [weeklyBudget, setWeeklyBudget] = useState(180);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(true);

  // Determine tier
  const getTierKey = () => {
    if (weeklyBudget < 150) return 'survival';
    if (weeklyBudget < 250) return 'balanced';
    return 'comfortable';
  };
  const tierKey = getTierKey();

  const tierInfo = {
    survival:    { name: 'Survival Mode', emoji: '💪', color: '#ef4444', description: 'The basics. You WILL eat every day.' },
    balanced:    { name: 'Balanced Budget', emoji: '🌟', color: '#f59e0b', description: 'Proper meals with protein. Brain fuel for studying.' },
    comfortable: { name: 'Comfortable', emoji: '✨', color: '#10b981', description: 'Variety, fruit, and you can treat yourself.' },
  };
  const currentTier = tierInfo[tierKey];

  // Build the budget-aware shopping list
  let runningTotal = 0;
  let cutoffIndex = -1; // index where money runs out
  const budgetList = PRIORITY_LIST.map((entry, i) => {
    const cost = entry.item.price * entry.qty;
    const canAfford = (runningTotal + cost) <= weeklyBudget;
    if (canAfford) {
      runningTotal += cost;
      return { ...entry, cost, runningTotal, canAfford: true };
    } else {
      if (cutoffIndex === -1) cutoffIndex = i;
      return { ...entry, cost, runningTotal: runningTotal + cost, canAfford: false };
    }
  });

  const affordableItems = budgetList.filter(item => item.canAfford);
  const nextItems = budgetList.filter(item => !item.canAfford).slice(0, 4); // show next 4
  const moneyLeft = weeklyBudget - runningTotal;

  // What your budget buys from vendors vs cooking
  const mealsFromVendors = Math.floor(weeklyBudget / VENDOR_MEAL_AVG);
  const vendorDays = mealsFromVendors / 3;
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const runOutDay = dayNames[Math.min(Math.floor(vendorDays), 6)];

  // Meals from cooking depends on what you could buy
  const hasStaple = affordableItems.some(e => e.item === GROCERIES.pap_2_5kg || e.item === GROCERIES.rice_2kg);
  const hasBread = affordableItems.some(e => e.item === GROCERIES.bread);
  const hasProtein = affordableItems.some(e => 
    e.item === GROCERIES.eggs_6 || e.item === GROCERIES.beans_tin || 
    e.item === GROCERIES.chicken_1kg || e.item === GROCERIES.tinned_fish
  );
  // Estimate meals: staple gives 14 meals, bread gives 7, protein adds to those
  let mealsFromCooking = 0;
  if (hasStaple) mealsFromCooking += 14;
  if (hasBread) mealsFromCooking += 7;
  if (!hasStaple && hasBread) mealsFromCooking = Math.min(mealsFromCooking, 10);
  if (hasProtein) mealsFromCooking = Math.min(mealsFromCooking + (hasStaple ? 0 : 3), 21);
  mealsFromCooking = Math.min(mealsFromCooking, 21);
  // If budget is high enough for full list, guarantee 21
  if (weeklyBudget >= 200) mealsFromCooking = 21;

  // Group affordable items by priority for display
  // Fixed: Removed unused priorityOrder variable
  let currentPriority = null;

  return (
    <div className="food-budget-helper">

      {/* ── BUDGET SLIDER ── */}
      <div className="budget-slider-section">
        <label className="budget-label">
          Your weekly food budget:
          <span className="budget-amount" style={{ color: currentTier.color }}>
            R{weeklyBudget}
          </span>
        </label>
        <input
          type="range"
          min="80"
          max="400"
          step="10"
          value={weeklyBudget}
          onChange={(e) => setWeeklyBudget(Number(e.target.value))}
          className="budget-range-slider"
          style={{
            background: `linear-gradient(to right, ${currentTier.color} 0%, ${currentTier.color} ${((weeklyBudget - 80) / 320) * 100}%, rgba(255,255,255,0.1) ${((weeklyBudget - 80) / 320) * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="budget-range-labels">
          <span>R80</span>
          <span>R250</span>
          <span>R400</span>
        </div>
      </div>

      {/* ── TIER BADGE ── */}
      <div className="tier-badge" style={{ borderColor: currentTier.color, color: currentTier.color }}>
        <span className="tier-emoji">{currentTier.emoji}</span>
        <div>
          <strong>{currentTier.name}</strong>
          <span className="tier-description">{currentTier.description}</span>
        </div>
      </div>

      {/* ── YOUR BUDGET BUYS... ── */}
      <div className="cook-vs-buy">
        <h3>🧮 Your R{weeklyBudget} buys you...</h3>
        <div className="comparison-cards">
          <div className="compare-card buying">
            <div className="compare-meals">{mealsFromVendors} meals</div>
            <div className="compare-label">from vendors/spaza</div>
            <div className="compare-detail">
              {mealsFromVendors < 3 
                ? 'Not even one full day 😰'
                : `Done by ${runOutDay} ${vendorDays < 2 ? 'morning' : 'evening'} 😰`
              }
            </div>
          </div>
          <div className="compare-vs">vs</div>
          <div className="compare-card cooking">
            <div className="compare-meals">{mealsFromCooking} meals</div>
            <div className="compare-label">cooking at home</div>
            <div className="compare-detail">
              {mealsFromCooking >= 21 
                ? 'Fed the whole week 💪' 
                : mealsFromCooking >= 14 
                  ? 'Most of the week covered 💪' 
                  : 'Stretches way further 💪'
              }
            </div>
          </div>
        </div>
        <div className="savings-highlight" style={{ borderColor: currentTier.color }}>
          💰 Same R{weeklyBudget} — but cooking gives you <strong>{mealsFromCooking - mealsFromVendors} extra meals</strong>.
          {mealsFromCooking - mealsFromVendors > 10 
            ? ' That\'s the difference between going hungry and eating all week.'
            : ' Every extra meal counts.'
          }
        </div>
      </div>

      {/* ── TAB BUTTONS ── */}
      <div className="food-tabs">
        <button
          className={`food-tab ${showShoppingList ? 'active' : ''}`}
          onClick={() => { setShowShoppingList(true); setShowMealPlan(false); }}
          style={showShoppingList ? { borderColor: currentTier.color, color: currentTier.color } : {}}
        >
          🛒 Shopping List
        </button>
        <button
          className={`food-tab ${showMealPlan ? 'active' : ''}`}
          onClick={() => { setShowMealPlan(true); setShowShoppingList(false); }}
          style={showMealPlan ? { borderColor: currentTier.color, color: currentTier.color } : {}}
        >
          📅 7-Day Meal Plan
        </button>
      </div>

      {/* ── SHOPPING LIST (BUDGET-AWARE) ── */}
      {showShoppingList && (
        <div className="shopping-list">
          {/* Header */}
          <div className="list-header">
            <span>Item</span>
            <span>Price</span>
            <span>Running</span>
          </div>

          {/* Affordable items with priority group headers */}
          {affordableItems.map((entry, i) => {
            let showGroupHeader = false;
            if (entry.priority !== currentPriority) {
              currentPriority = entry.priority;
              showGroupHeader = true;
            }
            return (
              <React.Fragment key={`afford-${i}`}>
                {showGroupHeader && (
                  <div className="list-group-header" style={{ color: PRIORITY_LABELS[entry.priority].color }}>
                    {PRIORITY_LABELS[entry.priority].label}
                  </div>
                )}
                <div className="list-item affordable">
                  <span className="item-name">
                    <span className="item-check">✅</span>
                    {entry.item.emoji} {entry.item.name}
                    {entry.qty > 1 && <span className="item-multi"> ×{entry.qty}</span>}
                    {entry.item.lastsWeeks > 1 && (
                      <span className="item-lasts"> (lasts {entry.item.lastsWeeks} wks)</span>
                    )}
                  </span>
                  <span className="item-price">R{entry.cost}</span>
                  <span className="item-running">R{entry.runningTotal}</span>
                </div>
              </React.Fragment>
            );
          })}

          {/* Budget line */}
          <div className="budget-cutoff-line" style={{ borderColor: currentTier.color }}>
            <span>💳 Your R{weeklyBudget} stops here</span>
            {moneyLeft > 0 && (
              <span className="money-left" style={{ color: currentTier.color }}>
                R{moneyLeft} left — save it or buy airtime
              </span>
            )}
          </div>

          {/* Next items you can't afford yet */}
          {nextItems.length > 0 && (
            <>
              <div className="list-group-header next-week">
                📌 Next On Your List (when budget allows)
              </div>
              {nextItems.map((entry, i) => (
                <div key={`next-${i}`} className="list-item not-affordable">
                  <span className="item-name">
                    <span className="item-check">⬜</span>
                    {entry.item.emoji} {entry.item.name}
                    {entry.qty > 1 && <span className="item-multi"> ×{entry.qty}</span>}
                  </span>
                  <span className="item-price">R{entry.cost}</span>
                  <span className="item-note-small">{entry.note}</span>
                </div>
              ))}
            </>
          )}

          {/* Summary */}
          <div className="list-summary">
            <div className="summary-row">
              <span>Items you can buy</span>
              <span>{affordableItems.length} items</span>
            </div>
            <div className="summary-row">
              <span>Total at the till</span>
              <span style={{ fontWeight: 800, color: currentTier.color }}>R{runningTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── MEAL PLAN ── */}
      {showMealPlan && (
        <div className="meal-plan">
          {tierKey !== 'survival' && weeklyBudget < 150 && (
            <div className="meal-plan-note">
              📌 This plan is based on survival essentials. As your budget grows, meals get better.
            </div>
          )}
          {(MEAL_PLANS[tierKey] || MEAL_PLANS.survival).map((day, i) => (
            <div key={i} className="meal-day">
              <div className="day-name">{day.day}</div>
              <div className="day-meals">
                <div className="meal">
                  <span className="meal-time">🌅</span>
                  <span>{day.breakfast}</span>
                </div>
                <div className="meal">
                  <span className="meal-time">☀️</span>
                  <span>{day.lunch}</span>
                </div>
                <div className="meal">
                  <span className="meal-time">🌙</span>
                  <span>{day.dinner}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── COOKING TIPS ── */}
      <div className="cooking-tips">
        <h3>💡 Smart Tips</h3>
        {(COOKING_TIPS[tierKey] || COOKING_TIPS.survival).map((tip, i) => (
          <div key={i} className="tip-row">
            <span className="tip-bullet">→</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default FoodBudgetHelper;