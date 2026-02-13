// frontend/src/pages/finance/components/TransportStretcher.js
import React, { useState } from 'react';

// ══════════════════════════════════════════════
// TRANSPORT DATA BY USER TYPE
// ══════════════════════════════════════════════
const getTransportData = (userType = 'student') => {
  const baseData = {
    walking: {
      name: '🚶 Walking',
      color: '#10b981',
      costPerTrip: 0,
      monthlyPass: 0,
      description: userType === 'learner' 
        ? 'Safe & healthy if you live close to school (under 3km).' 
        : 'Free & healthy. Good up to 3km.',
      pros: ['Free', 'Exercise', 'No waiting'],
      cons: userType === 'learner' 
        ? ['Tiring', 'Weather dependent', 'Time consuming']
        : ['Tiring', 'Weather dependent', 'Not safe at night'],
      safetyTip: userType === 'learner' 
        ? 'Walk in groups, use main roads, avoid dark areas'
        : 'Good up to 3km, walk with friends when possible'
    }
  };

  if (userType === 'student') {
    return {
      ...baseData,
      bus: {
        name: '🚌 Bus',
        color: '#3b82f6',
        costPerTrip: 12,
        monthlyPass: 450,
        description: 'Reliable, monthly passes save money.',
        pros: ['Monthly pass saves', 'Reliable schedule', 'Sheltered'],
        cons: ['Limited routes', 'Can be crowded', 'Strikes happen']
      },
      taxi: {
        name: '🚕 Taxi',
        color: '#ef4444',
        costPerTrip: 18,
        weeklyPass: 140,
        description: 'Goes everywhere, but unpredictable.',
        pros: ['Goes anywhere', 'Frequent', '24/7 in some areas'],
        cons: ['Expensive', 'Unpredictable', 'Safety concerns']
      },
      campusShuttle: {
        name: '🏫 Campus Shuttle',
        color: '#8b5cf6',
        costPerTrip: 8,
        monthlyPass: 120,
        description: 'Cheapest option if your campus has one.',
        pros: ['Cheap', 'Safe', 'Student-friendly'],
        cons: ['Limited hours', 'Only campus routes', 'Long queues']
      }
    };
  }

  // LEARNER-SPECIFIC OPTIONS
  return {
    ...baseData,
    scholarTransport: {
      name: '🚌 Scholar Transport',
      color: '#3b82f6',
      costPerTrip: 15,
      monthlyPass: 300,
      description: 'Dedicated school transport - safest option.',
      pros: ['Safe', 'Reliable', 'Door-to-school', 'Monthly discount'],
      cons: ['Fixed schedule', 'May be crowded', 'Early pickup'],
      safetyTip: 'Know driver\'s name, have emergency contact saved'
    },
    taxi: {
      name: '🚕 Taxi',
      color: '#ef4444',
      costPerTrip: 12, // Cheaper for learners
      weeklyPass: 100,
      description: 'Common but unpredictable. Know your routes.',
      pros: ['Goes everywhere', 'Frequent', 'Flexible'],
      cons: ['Can be unsafe', 'Unpredictable', 'Expensive long-term'],
      safetyTip: 'Sit near driver, avoid empty taxis, travel in groups'
    },
    parentDropoff: {
      name: '👨‍👩‍👧 Parent Drop-off',
      color: '#8b5cf6',
      costPerTrip: 5, // Fuel cost
      monthlyPass: 120, // Fuel estimate
      description: 'If parents drive you - help with fuel money.',
      pros: ['Safest', 'Door-to-door', 'No waiting'],
      cons: ['Depends on parents', 'Fuel costs', 'Limited flexibility'],
      safetyTip: 'Offer to contribute R20/week for fuel'
    }
  };
};

// ══════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════
function TransportStretcher({ userType = 'student' }) {
  const transportData = getTransportData(userType);
  const defaultTransport = userType === 'learner' ? 'scholarTransport' : 'taxi';
  
  const [tripsPerDay, setTripsPerDay] = useState(2); // To and from school/campus
  const [daysPerWeek, setDaysPerWeek] = useState(userType === 'learner' ? 5 : 5);
  const [selectedTransport, setSelectedTransport] = useState(defaultTransport);
  const [useMonthlyPass, setUseMonthlyPass] = useState(userType === 'learner');
  const [includeWalking, setIncludeWalking] = useState(true);
  const [travelInGroups, setTravelInGroups] = useState(userType === 'learner');

  const transport = transportData[selectedTransport];
  
  // Calculate costs
  const tripsPerWeek = tripsPerDay * daysPerWeek;
  
  let weeklyCost = 0;
  let monthlyCost = 0;
  
  if (useMonthlyPass && transport.monthlyPass) {
    weeklyCost = transport.monthlyPass / 4.33;
    monthlyCost = transport.monthlyPass;
  } else {
    weeklyCost = tripsPerWeek * transport.costPerTrip;
    monthlyCost = weeklyCost * 4.33;
  }
  
  // Savings calculations
  let savings = 0;
  let savingsDescription = '';
  
  if (includeWalking) {
    const walkingTrips = Math.min(2, tripsPerWeek);
    const walkingCost = walkingTrips * (useMonthlyPass ? transport.monthlyPass / (tripsPerWeek * 4.33) : transport.costPerTrip);
    const walkingSavings = walkingCost * 0.5;
    savings += walkingSavings;
    savingsDescription += `Walk some trips (-R${Math.round(walkingSavings)}) `;
  }
  
  if (travelInGroups && selectedTransport === 'taxi' && userType === 'learner') {
    const groupSavings = weeklyCost * 0.3;
    savings += groupSavings;
    savingsDescription += `Share taxi (-R${Math.round(groupSavings)}) `;
  }
  
  const effectiveWeeklyCost = Math.max(0, weeklyCost - savings);
  const effectiveMonthlyCost = effectiveWeeklyCost * 4.33;
  
  // Annual costs
  const annualCost = userType === 'learner' 
    ? effectiveWeeklyCost * 40 // 40 school weeks
    : effectiveMonthlyCost * 12; // 12 months for students
  
  // Typical budget comparison
  const typicalBudget = userType === 'learner' ? 500 : 800; // R500/month for learners, R800 for students
  const budgetDifference = typicalBudget - effectiveMonthlyCost;
  
  // Suggestions based on user type
  const getSuggestions = () => {
    const suggestions = [];
    
    if (userType === 'student') {
      if (effectiveMonthlyCost > 800) {
        suggestions.push(`🎯 Consider mixing transport: walk for short trips, taxi for rainy days.`);
      }
      
      if (selectedTransport === 'taxi' && tripsPerWeek > 10) {
        suggestions.push(`💡 Find a taxi buddy! Split costs with a friend going the same route.`);
      }
      
      if (!useMonthlyPass && transport.monthlyPass && tripsPerWeek > 8) {
        suggestions.push(`💰 Switch to monthly pass: Save R${Math.round((weeklyCost * 4.33) - transport.monthlyPass)} per month!`);
      }
      
      if (tripsPerDay > 2) {
        suggestions.push(`📅 Plan your day: Combine errands to reduce trips.`);
      }
    } else {
      // LEARNER SUGGESTIONS
      if (effectiveMonthlyCost > 500) {
        suggestions.push(`⚠️ Your transport costs (R${Math.round(effectiveMonthlyCost)}) are above the typical R${typicalBudget}/month budget.`);
        suggestions.push(`💡 Consider mixing: Walk some days, use scholar transport others.`);
      } else if (budgetDifference > 100) {
        suggestions.push(`✅ Great! You're saving R${Math.round(budgetDifference)}/month vs typical budget.`);
        suggestions.push(`💰 Put R${Math.round(budgetDifference * 0.5)} in savings each month!`);
      }
      
      if (!useMonthlyPass && transport.monthlyPass && tripsPerWeek > 6) {
        suggestions.push(`🎫 Switch to monthly pass: Save R${Math.round((weeklyCost * 4.33) - transport.monthlyPass)}/month!`);
      }
      
      if (selectedTransport === 'parentDropoff' && effectiveMonthlyCost > 200) {
        suggestions.push(`⛽ Offer R${Math.round(effectiveMonthlyCost * 0.25)}/month for fuel - helps family budget.`);
      }
    }
    
    return suggestions.length > 0 ? suggestions : [
      '✅ Your transport budget looks efficient! Keep tracking your spending.'
    ];
  };

  // Safety tips for learners
  const getSafetyTips = () => {
    if (userType !== 'learner') return [];
    
    const tips = [];
    
    if (selectedTransport === 'taxi') {
      tips.push('📱 Always have R5 airtime for emergencies');
      tips.push('👥 Travel with at least 1 friend in taxis');
      tips.push('📍 Share your location with parents when traveling');
    }
    
    if (selectedTransport === 'walking') {
      tips.push('👟 Wear visible clothing, especially in winter');
      tips.push('⏰ Leave home with enough time - don\'t rush');
      tips.push('🚫 Avoid shortcuts through unfamiliar areas');
    }
    
    tips.push('📞 Save emergency contacts as ICE (In Case of Emergency)');
    tips.push('🎒 Keep school bag secure - don\'t show phones/money');
    
    return tips;
  };

  return (
    <div className={`transport-stretcher ${userType}-version`}>
      {/* ── HEADER (User Type Specific) ── */}
      <div className="transport-header">
        <h3>{userType === 'learner' ? '🚌 School Transport Calculator' : '🚌 Smart Transport Calculator'}</h3>
        <p>
          {userType === 'learner' 
            ? `Plan your R${typicalBudget}/month transport budget safely` 
            : 'Find the most efficient way to get around campus'}
        </p>
      </div>

      {/* ── SAFETY BANNER (Learners Only) ── */}
      {userType === 'learner' && transport.safetyTip && (
        <div className="safety-banner" style={{ borderColor: transport.color }}>
          <span className="safety-icon">🛡️</span>
          <div>
            <strong>Safety First!</strong>
            <p>{transport.safetyTip}</p>
          </div>
        </div>
      )}

      {/* ── TRANSPORT SELECTOR ── */}
      <div className="transport-selector">
        <h4>{userType === 'learner' ? 'How do you get to school?' : 'Choose Your Main Transport:'}</h4>
        <div className="transport-options">
          {Object.entries(transportData).map(([key, trans]) => (
            <button
              key={key}
              className={`transport-option ${selectedTransport === key ? 'active' : ''}`}
              onClick={() => setSelectedTransport(key)}
              style={selectedTransport === key ? { 
                borderColor: trans.color,
                background: `${trans.color}15`
              } : {}}
            >
              <span className="transport-emoji">{trans.name.split(' ')[0]}</span>
              <span className="transport-name">{trans.name.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TRANSPORT DETAILS ── */}
      <div className="transport-details" style={{ borderColor: transport.color }}>
        <div className="transport-info">
          <span className="transport-label" style={{ color: transport.color }}>
            {transport.name}
          </span>
          <p className="transport-description">{transport.description}</p>
          
          {/* Safety info for learners */}
          {userType === 'learner' && transport.safetyTip && (
            <div className="safety-info">
              <span className="safety-label">Safety Tip:</span>
              <p>{transport.safetyTip}</p>
            </div>
          )}
          
          <div className="transport-pros-cons">
            <div className="pros">
              <span className="pros-label">👍 Pros:</span>
              <ul>
                {transport.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
            <div className="cons">
              <span className="cons-label">👎 Cons:</span>
              <ul>
                {transport.cons.map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── CALCULATOR ── */}
      <div className="transport-calculator">
        <h4>📊 Your {userType === 'learner' ? 'School' : 'Weekly'} Travel Pattern</h4>
        
        <div className="calc-inputs">
          {/* Days per week */}
          <div className="calc-input-group">
            <label>{userType === 'learner' ? 'School days per week' : 'Days on campus per week'}</label>
            <div className="calc-slider-row">
              <span className="calc-min">1</span>
              <input
                type="range"
                min="1"
                max={userType === 'learner' ? '5' : '7'}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="calc-slider"
                style={{
                  background: `linear-gradient(to right, ${transport.color} 0%, ${transport.color} ${((daysPerWeek - 1) / (userType === 'learner' ? 4 : 6)) * 100}%, rgba(255,255,255,0.1) ${((daysPerWeek - 1) / (userType === 'learner' ? 4 : 6)) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <span className="calc-max">{userType === 'learner' ? '5' : '7'}</span>
              <span className="calc-value" style={{ color: transport.color }}>
                {daysPerWeek} day{daysPerWeek !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Trips per day */}
          <div className="calc-input-group">
            <label>Trips per day ({userType === 'learner' ? 'there + back = 2' : 'round trips count as 2'})</label>
            <div className="calc-slider-row">
              <span className="calc-min">1</span>
              <input
                type="range"
                min="1"
                max="4"
                value={tripsPerDay}
                onChange={(e) => setTripsPerDay(Number(e.target.value))}
                className="calc-slider"
                style={{
                  background: `linear-gradient(to right, ${transport.color} 0%, ${transport.color} ${((tripsPerDay - 1) / 3) * 100}%, rgba(255,255,255,0.1) ${((tripsPerDay - 1) / 3) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <span className="calc-max">4</span>
              <span className="calc-value" style={{ color: transport.color }}>
                {tripsPerDay} trip{tripsPerDay !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="calc-options">
            {transport.monthlyPass && transport.monthlyPass > 0 && (
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={useMonthlyPass}
                  onChange={(e) => setUseMonthlyPass(e.target.checked)}
                />
                <span>Use monthly pass (R{transport.monthlyPass}/month)</span>
              </label>
            )}
            
            <label className="option-checkbox">
              <input
                type="checkbox"
                checked={includeWalking}
                onChange={(e) => setIncludeWalking(e.target.checked)}
              />
              <span>Include walking for short trips (save ~50%)</span>
            </label>
            
            {/* Group travel option for learner taxis */}
            {userType === 'learner' && (selectedTransport === 'taxi' || selectedTransport === 'scholarTransport') && (
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={travelInGroups}
                  onChange={(e) => setTravelInGroups(e.target.checked)}
                />
                <span>Travel in groups (safer & cheaper)</span>
              </label>
            )}
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div className="transport-results">
          <div className="result-card">
            <div className="result-label">Weekly cost</div>
            <div className="result-amount" style={{ color: transport.color }}>
              R{Math.round(effectiveWeeklyCost)}
            </div>
            <div className="result-detail">
              {savingsDescription || 'No savings applied'}
            </div>
          </div>
          
          <div className="result-card">
            <div className="result-label">Monthly cost</div>
            <div className="result-amount" style={{ color: transport.color }}>
              R{Math.round(effectiveMonthlyCost)}
            </div>
            <div className="result-detail">
              {userType === 'learner' ? `Typical budget: R${typicalBudget}` : 'Without walking'}
            </div>
          </div>
          
          <div className="result-card">
            <div className="result-label">
              {userType === 'learner' ? 'School year cost' : 'Annual cost'}
            </div>
            <div className="result-amount" style={{ color: transport.color }}>
              R{Math.round(annualCost)}
            </div>
            <div className="result-detail">
              That's {Math.round(annualCost / (userType === 'learner' ? 250 : 350))} {userType === 'learner' ? 'textbooks' : 'textbooks'}!
            </div>
          </div>
        </div>

        {/* ── BUDGET COMPARISON (Learners Only) ── */}
        {userType === 'learner' && (
          <div className="budget-comparison" style={{ 
            borderColor: budgetDifference >= 0 ? '#10b981' : '#ef4444',
            background: budgetDifference >= 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
          }}>
            <div className="comparison-header">
              <span>{budgetDifference >= 0 ? '✅' : '⚠️'} vs Typical Learner Budget</span>
            </div>
            <div className="comparison-details">
              <span>Your monthly cost: R{Math.round(effectiveMonthlyCost)}</span>
              <span>Typical budget: R{typicalBudget}</span>
              <span style={{ 
                color: budgetDifference >= 0 ? '#10b981' : '#ef4444',
                fontWeight: 700 
              }}>
                {budgetDifference >= 0 ? 'Save R' : 'Over budget by R'}{Math.abs(Math.round(budgetDifference))}
              </span>
            </div>
          </div>
        )}

        {/* ── SAVINGS HIGHLIGHT ── */}
        {useMonthlyPass && transport.monthlyPass && (
          <div className="savings-alert" style={{ borderColor: '#10b981' }}>
            💰 Monthly pass saves you R{Math.round((weeklyCost * 4.33) - transport.monthlyPass)} per month!
            {tripsPerWeek < 8 && ' Consider pay-per-trip if you travel less.'}
          </div>
        )}

        {/* ── COST COMPARISON (Students Only) ── */}
        {userType === 'student' && (
          <div className="cost-comparison">
            <h4>📈 Cost Breakdown</h4>
            <div className="comparison-grid">
              <div className="comparison-item">
                <span className="comparison-label">Without monthly pass:</span>
                <span className="comparison-value">R{Math.round(monthlyCost)}/month</span>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">With walking savings:</span>
                <span className="comparison-value" style={{ color: transport.color }}>
                  R{Math.round(effectiveMonthlyCost)}/month
                </span>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">You save:</span>
                <span className="comparison-value" style={{ color: '#10b981', fontWeight: 'bold' }}>
                  R{Math.round(monthlyCost - effectiveMonthlyCost)}/month
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── SUGGESTIONS ── */}
        <div className="transport-suggestions">
          <h4>💡 Smart Tips for You</h4>
          {getSuggestions().map((suggestion, i) => (
            <div key={i} className="suggestion-item">
              <span className="suggestion-bullet">→</span>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>

        {/* ── SAFETY TIPS (Learners Only) ── */}
        {userType === 'learner' && getSafetyTips().length > 0 && (
          <div className="safety-tips">
            <h4>🛡️ Safety Tips for School Travel</h4>
            {getSafetyTips().map((tip, i) => (
              <div key={i} className="safety-tip-item">
                <span className="safety-icon">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── CARPOOL CALCULATOR (Both) ── */}
        <div className="carpool-section">
          <h4>👥 {userType === 'learner' ? 'Group Travel' : 'Carpool'} Calculator</h4>
          <p className="carpool-description">
            {userType === 'learner' 
              ? 'Travel with friends? Split costs safely:' 
              : 'Find 3 friends going the same route? Split taxi/Uber costs:'}
          </p>
          
          <div className="carpool-calc">
            <div className="carpool-result">
              <span>Current weekly cost:</span>
              <span style={{ fontWeight: 600 }}>R{Math.round(effectiveWeeklyCost)}</span>
            </div>
            <div className="carpool-result">
              <span>With 2 friends (split 3 ways):</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>
                R{Math.round(effectiveWeeklyCost / 3)}
              </span>
            </div>
            <div className="carpool-result">
              <span>Weekly savings:</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>
                R{Math.round(effectiveWeeklyCost * 2 / 3)}
              </span>
            </div>
          </div>
          
          <div className="carpool-tip">
            {userType === 'learner' 
              ? '💬 Pro tip: Travel with classmates from your area. Safer and cheaper!' 
              : '💬 Pro tip: Start a WhatsApp group for your route. Post when you\'re traveling.'}
          </div>
        </div>

        {/* ── PARENT INVOLVEMENT (Learners Only) ── */}
        {userType === 'learner' && (
          <div className="parent-section">
            <h4>👨‍👩‍👧 Parent Communication</h4>
            <p className="parent-description">
              Share your transport plan with parents:
            </p>
            
            <div className="parent-message">
              "Mom/Dad, I calculated my school transport costs. It will be R{Math.round(effectiveMonthlyCost)}/month 
              using {transport.name.toLowerCase()}. {budgetDifference >= 0 ? 
              `We can save R${Math.round(budgetDifference)}/month!` : 
              `I need R${Math.abs(Math.round(budgetDifference))} more per month.`}"
            </div>
            
            <button 
              className="copy-message-btn"
              style={{ background: transport.color }}
              onClick={() => {
                const message = `Mom/Dad, I calculated my school transport costs. It will be R${Math.round(effectiveMonthlyCost)}/month using ${transport.name.toLowerCase()}. ${budgetDifference >= 0 ? 
                  `We can save R${Math.round(budgetDifference)}/month!` : 
                  `I need R${Math.abs(Math.round(budgetDifference))} more per month.`}`;
                navigator.clipboard.writeText(message);
                alert('Message copied! Share it with your parents.');
              }}
            >
              📋 Copy Message for Parents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransportStretcher;