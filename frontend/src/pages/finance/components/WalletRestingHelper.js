// frontend/src/pages/finance/components/WalletRestingHelper.js - CONNECTED VERSION WITH FIRESTORE
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaShieldAlt, FaHome, FaChartLine,
  FaQuoteLeft, FaCalculator,
  FaMoneyBillWave, FaSave
} from 'react-icons/fa';

// Firebase imports
import { db } from '../../../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';

const SAVINGS_OPTIONS = [
  {
    id: 'emergency', name: 'Emergency Fund', emoji: '🛡️', color: '#3b82f6',
    description: 'Your financial oxygen tank. 3-6 months of basic expenses.',
    minAmount: 0, typical: '3-6 months expenses', returns: '5-7% (money market)',
    access: 'Instant', taxBenefit: 'None — but it saves you from debt',
    tips: [
      'Start with 1 month of rent + food + transport as your first target',
      'Keep it in a money market account (better than savings, still instant access)',
      'Don\'t invest this — it needs to be available immediately',
      'Capitec, TymeBank, and Discovery all offer 6%+ money market rates',
    ],
  },
  {
    id: 'tfsa', name: 'Tax-Free Savings Account', emoji: '🏦', color: '#10b981',
    description: 'R36,000/year limit. All growth is TAX FREE. Best first investment.',
    minAmount: 500, typical: 'R500-R3,000/month', returns: '8-12% (depends on fund)',
    access: 'Withdraw anytime (but you lose the tax-free space)',
    taxBenefit: 'ALL returns are tax-free — dividends, interest, capital gains',
    tips: [
      'R36,000 per year limit, R500,000 lifetime limit',
      'Start with R500/month — that\'s R6,000/year tax-free growth',
      'Choose a low-cost index fund (Satrix, 10X, Sygnia) inside the TFSA',
      'Don\'t withdraw unless emergency — you can\'t get the tax-free space back',
      'EasyEquities, FNB, Nedbank all offer easy TFSA accounts',
    ],
  },
  {
    id: 'ra', name: 'Retirement Annuity (RA)', emoji: '👴', color: '#8b5cf6',
    description: 'Tax deduction NOW + compound growth for decades. SA\'s best tax hack.',
    minAmount: 500, typical: 'R1,000-R3,000/month', returns: '9-14% (long-term equity)',
    access: 'Locked until 55 (with some exceptions)',
    taxBenefit: 'Contributions reduce your taxable income by up to 27.5%',
    tips: [
      'If you earn R30k/month, a R2k RA contribution saves ~R600 in tax',
      'That\'s like getting a 30% discount on your savings!',
      'Choose a low-cost provider: 10X, Sygnia, Allan Gray, Coronation',
      'Locked until 55 — this is a feature, not a bug. It forces you to save.',
      'You can withdraw 1/3 as cash at retirement (tax rules apply)',
    ],
  },
  {
    id: 'property', name: 'Property Deposit', emoji: '🏠', color: '#f59e0b',
    description: 'Save for a 10-20% deposit. Banks reward bigger deposits with lower rates.',
    minAmount: 0, typical: 'R2,000-R5,000/month', returns: 'N/A — this is a savings target',
    access: 'When you\'re ready to buy',
    taxBenefit: 'None directly — but property builds long-term wealth',
    tips: [
      'Aim for 10% deposit minimum (banks offer better rates)',
      'R1M property = R100k-R200k deposit needed',
      'Transfer duties: R0 under R1.1M property value',
      'Don\'t forget bond registration costs (~R30k) and moving costs',
      'Save in a high-interest savings account or money market',
    ],
  },
];

const WISDOM = [
  'Money you don\'t touch grows faster than money you watch.',
  'Compound interest is the 8th wonder of the world. Start today.',
  'R500/month for 30 years at 10% = R1.1 million. Time is your superpower.',
  'The best time to start investing was 10 years ago. The second best time is today.',
  'Your future self will thank you for every rand you saved today.',
  'Rich people make money work. Smart people make money rest.',
];

const calculateGrowth = (monthly, years, rate) => {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return monthly * months;
  return Math.round(monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
};

const calculateRATaxSaving = (grossSalary, raContribution) => {
  let marginalRate = 0.18;
  const annual = grossSalary * 12;
  if (annual > 237100) marginalRate = 0.26;
  if (annual > 370500) marginalRate = 0.31;
  if (annual > 512800) marginalRate = 0.36;
  if (annual > 673000) marginalRate = 0.39;
  if (annual > 857900) marginalRate = 0.41;
  if (annual > 1817000) marginalRate = 0.45;
  const maxDeductible = Math.min(grossSalary * 0.275, 350000 / 12);
  const actualDeductible = Math.min(raContribution, maxDeductible);
  const monthlySaving = Math.round(actualDeductible * marginalRate);
  return { monthlySaving, marginalRate: Math.round(marginalRate * 100), actualDeductible: Math.round(actualDeductible) };
};

// ══════════════════════════════════════════════
// COMPONENT — receives grossSalary & takeHomePay from parent
// ══════════════════════════════════════════════
function WalletRestingHelper({ grossSalary, takeHomePay }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState('emergency');
  const [monthlyAmount, setMonthlyAmount] = useState(1000);
  const [years, setYears] = useState(10);
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(15000);
  const [currentSavings, setCurrentSavings] = useState(5000);
  const [propertyPrice, setPropertyPrice] = useState(1000000);
  const [depositPercent, setDepositPercent] = useState(10);

  // ── Firebase Load Function ──
  const loadFromFirestore = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'professionalFinance', currentUser.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists() && docSnap.data().walletResting) {
        const savedData = docSnap.data().walletResting;
        setSelectedOption(savedData.selectedOption || 'emergency');
        setMonthlyAmount(savedData.monthlyAmount || 1000);
        setYears(savedData.years || 10);
        setMonthlyExpenses(savedData.monthlyExpenses || 15000);
        setCurrentSavings(savedData.currentSavings || 5000);
        setPropertyPrice(savedData.propertyPrice || 1000000);
        setDepositPercent(savedData.depositPercent || 10);
      }
    } catch (error) {
      console.error('Error loading wallet resting data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ── Firebase Save Function ──
  const saveToFirestore = async () => {
    if (!currentUser) {
      alert('Please login to save your savings plan');
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, 'professionalFinance', currentUser.uid);
      await setDoc(userRef, {
        walletResting: {
          selectedOption,
          monthlyAmount,
          years,
          monthlyExpenses,
          currentSavings,
          propertyPrice,
          depositPercent,
          lastUpdated: new Date().toISOString()
        }
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving wallet resting data:', error);
      alert('Error saving your plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Load data on mount and user change ──
  useEffect(() => {
    if (currentUser) {
      loadFromFirestore();
    }
  }, [currentUser, loadFromFirestore]);

  const option = SAVINGS_OPTIONS.find(o => o.id === selectedOption);
  const futureValue = calculateGrowth(monthlyAmount, years, selectedOption === 'emergency' ? 6 : selectedOption === 'tfsa' ? 10 : selectedOption === 'ra' ? 11 : 6);
  const totalContributed = monthlyAmount * years * 12;
  const growthEarned = futureValue - totalContributed;

  // RA tax saving uses shared grossSalary
  const raTax = calculateRATaxSaving(grossSalary, monthlyAmount);

  const emergencyTarget = monthlyExpenses * 3;
  const emergencyProgress = emergencyTarget > 0 ? Math.min(100, (currentSavings / emergencyTarget) * 100) : 0;
  const monthsToTarget = monthlyAmount > 0 ? Math.ceil((emergencyTarget - currentSavings) / monthlyAmount) : 0;

  const depositNeeded = Math.round(propertyPrice * depositPercent / 100);
  const monthsToDeposit = monthlyAmount > 0 ? Math.ceil(depositNeeded / monthlyAmount) : 0;

  // Savings as % of income
  const savingsPercent = takeHomePay > 0 ? Math.round((monthlyAmount / takeHomePay) * 100) : 0;

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div>Loading your savings plan...</div>
      </div>
    );
  }

  return (
    <div className="wallet-resting-container">

      <div className="wrh-wisdom" onClick={() => setWisdomIdx((wisdomIdx + 1) % WISDOM.length)}>
        <FaQuoteLeft className="wrh-wisdom-icon" />
        <p>{WISDOM[wisdomIdx]}</p>
        <span className="wrh-wisdom-tap">tap for more</span>
      </div>

      {/* ── INCOME CONTEXT (from shared salary) ── */}
      <div className="fsp-income-context">
        <FaMoneyBillWave />
        <span>Your take-home pay: <strong>R{takeHomePay.toLocaleString()}</strong>/month</span>
        <span className="fsp-income-hint">Change this in the Gentle Spending tab</span>
      </div>

      {/* ── SAVE BUTTON ── */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginTop: '20px',
        marginBottom: '20px',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <button 
          onClick={saveToFirestore} 
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#ccc' : '#8A2BE2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaSave /> {loading ? 'Saving...' : saved ? '✓ Saved!' : '💾 Save Savings Plan'}
        </button>
        {!currentUser && (
          <div style={{ color: '#666', fontSize: '14px' }}>
            💡 Login to save your plan
          </div>
        )}
      </div>

      <div className="wrh-options">
        {SAVINGS_OPTIONS.map(opt => (
          <button key={opt.id}
            className={`wrh-option ${selectedOption === opt.id ? 'active' : ''}`}
            onClick={() => setSelectedOption(opt.id)}
            style={selectedOption === opt.id ? { borderColor: opt.color, background: `${opt.color}15` } : {}}>
            <span className="wrh-option-emoji">{opt.emoji}</span>
            <span className="wrh-option-name">{opt.name}</span>
          </button>
        ))}
      </div>

      <div className="wrh-info" style={{ borderColor: option.color }}>
        <div className="wrh-info-header">
          <span style={{ fontSize: '1.6rem' }}>{option.emoji}</span>
          <div>
            <h3 style={{ color: option.color, margin: 0 }}>{option.name}</h3>
            <p className="wrh-info-desc">{option.description}</p>
          </div>
        </div>
        <div className="wrh-info-grid">
          <div className="wrh-info-item"><span className="wrh-info-label">Typical</span><span>{option.typical}</span></div>
          <div className="wrh-info-item"><span className="wrh-info-label">Returns</span><span>{option.returns}</span></div>
          <div className="wrh-info-item"><span className="wrh-info-label">Access</span><span>{option.access}</span></div>
          <div className="wrh-info-item"><span className="wrh-info-label">Tax Benefit</span><span>{option.taxBenefit}</span></div>
        </div>
      </div>

      <div className="wrh-section">
        <h3 className="wrh-section-title"><FaCalculator /> Growth Calculator</h3>
        <div className="wrh-calc-inputs">
          <div className="wrh-calc-field">
            <label>Monthly contribution</label>
            <div className="wrh-input-row">
              <span className="wrh-currency">R</span>
              <input type="number" value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(parseInt(e.target.value) || 0)} min="0" step="100" />
            </div>
            {takeHomePay > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '6px', display: 'block' }}>
                That's {savingsPercent}% of your take-home pay
              </span>
            )}
          </div>
          <div className="wrh-calc-field">
            <label>For how many years</label>
            <div className="wrh-input-row">
              <input type="number" value={years}
                onChange={(e) => setYears(parseInt(e.target.value) || 1)} min="1" max="40" />
              <span className="wrh-unit">years</span>
            </div>
          </div>
        </div>

        <div className="wrh-growth-result" style={{ borderColor: option.color }}>
          <div className="wrh-growth-row"><span>You contribute</span><span>R{totalContributed.toLocaleString()}</span></div>
          <div className="wrh-growth-row"><span>Growth earned</span><span style={{ color: option.color }}>+R{growthEarned.toLocaleString()}</span></div>
          <div className="wrh-growth-total"><span>After {years} years</span><strong style={{ color: option.color }}>R{futureValue.toLocaleString()}</strong></div>
          <div className="wrh-growth-wow">💡 Your money earned R{growthEarned.toLocaleString()} while you slept. That's compound interest.</div>
        </div>
      </div>

      {/* RA Tax Saving — uses shared grossSalary */}
      {selectedOption === 'ra' && (
        <div className="wrh-section">
          <h3 className="wrh-section-title"><FaChartLine /> Your RA Tax Saving</h3>
          <p className="fsp-section-desc">Based on your gross salary of R{grossSalary.toLocaleString()}/month (from Gentle Spending tab)</p>
          <div className="wrh-tax-result" style={{ borderColor: '#8b5cf6' }}>
            <div className="wrh-tax-row"><span>Your tax bracket</span><span>{raTax.marginalRate}%</span></div>
            <div className="wrh-tax-row"><span>RA contribution (tax deductible)</span><span>R{raTax.actualDeductible.toLocaleString()}</span></div>
            <div className="wrh-tax-saving"><span>Monthly tax saving</span><strong style={{ color: '#8b5cf6' }}>R{raTax.monthlySaving.toLocaleString()}</strong></div>
            <div className="wrh-tax-wow">
              🎯 You save R{monthlyAmount.toLocaleString()}/month but it only "costs" you R{(monthlyAmount - raTax.monthlySaving).toLocaleString()} 
              because SARS gives you R{raTax.monthlySaving.toLocaleString()} back. That's a {raTax.marginalRate}% discount on saving!
            </div>
          </div>
        </div>
      )}

      {selectedOption === 'emergency' && (
        <div className="wrh-section">
          <h3 className="wrh-section-title"><FaShieldAlt /> Your Emergency Fund Tracker</h3>
          <div className="wrh-calc-inputs">
            <div className="wrh-calc-field"><label>Monthly basic expenses</label>
              <div className="wrh-input-row"><span className="wrh-currency">R</span>
                <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(parseInt(e.target.value) || 0)} min="0" step="1000" /></div></div>
            <div className="wrh-calc-field"><label>Current savings</label>
              <div className="wrh-input-row"><span className="wrh-currency">R</span>
                <input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(parseInt(e.target.value) || 0)} min="0" /></div></div>
          </div>
          <div className="wrh-emergency-result" style={{ borderColor: '#3b82f6' }}>
            <div className="wrh-emergency-bar-bg"><div className="wrh-emergency-bar-fill" style={{ width: `${emergencyProgress}%` }} /></div>
            <div className="wrh-emergency-labels">
              <span>R{currentSavings.toLocaleString()}</span>
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>{emergencyProgress.toFixed(0)}%</span>
              <span>R{emergencyTarget.toLocaleString()}</span>
            </div>
            {emergencyProgress < 100 && monthlyAmount > 0 && (
              <div className="wrh-emergency-eta">⏱️ At R{monthlyAmount.toLocaleString()}/month, you'll reach 3 months in <strong>{monthsToTarget} months</strong></div>
            )}
            {emergencyProgress >= 100 && (
              <div className="wrh-emergency-done">🎉 3-month target reached! Consider aiming for 6 months (R{(monthlyExpenses * 6).toLocaleString()})</div>
            )}
          </div>
        </div>
      )}

      {selectedOption === 'property' && (
        <div className="wrh-section">
          <h3 className="wrh-section-title"><FaHome /> Property Deposit Calculator</h3>
          <div className="wrh-calc-inputs">
            <div className="wrh-calc-field"><label>Property price</label>
              <div className="wrh-input-row"><span className="wrh-currency">R</span>
                <input type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(parseInt(e.target.value) || 0)} min="0" step="50000" /></div></div>
            <div className="wrh-calc-field"><label>Deposit %</label>
              <div className="wrh-input-row">
                <input type="number" value={depositPercent} onChange={(e) => setDepositPercent(parseInt(e.target.value) || 0)} min="0" max="100" />
                <span className="wrh-unit">%</span></div></div>
          </div>
          <div className="wrh-property-result" style={{ borderColor: '#f59e0b' }}>
            <div className="wrh-growth-row"><span>Deposit needed ({depositPercent}%)</span><strong>R{depositNeeded.toLocaleString()}</strong></div>
            <div className="wrh-growth-row"><span>Bond registration (~3%)</span><span>~R{Math.round(propertyPrice * 0.03).toLocaleString()}</span></div>
            <div className="wrh-growth-row"><span>Transfer duty</span><span>{propertyPrice <= 1100000 ? 'R0 (under R1.1M)' : `~R${Math.round(propertyPrice * 0.03).toLocaleString()}`}</span></div>
            <div className="wrh-growth-total"><span>Total you need</span><strong style={{ color: '#f59e0b' }}>R{(depositNeeded + Math.round(propertyPrice * 0.03)).toLocaleString()}</strong></div>
            {monthlyAmount > 0 && (
              <div className="wrh-growth-wow">⏱️ At R{monthlyAmount.toLocaleString()}/month, deposit saved in <strong>{monthsToDeposit} months</strong> (~{(monthsToDeposit / 12).toFixed(1)} years)</div>
            )}
          </div>
        </div>
      )}

      <div className="wrh-tips">
        <h3>💡 {option.name} Tips</h3>
        {option.tips.map((tip, i) => (
          <div key={i} className="wrh-tip-row"><span className="wrh-tip-bullet">→</span><span>{tip}</span></div>
        ))}
      </div>

      <div className="wrh-order-guide">
        <h3>📌 The SA Savings Order (Do This First → Last)</h3>
        <div className="wrh-order-step"><span className="wrh-order-num" style={{ background: '#3b82f6' }}>1</span>
          <div><strong>Emergency Fund (1-3 months)</strong><p>Before anything else. This stops you going to loan sharks when life happens.</p></div></div>
        <div className="wrh-order-step"><span className="wrh-order-num" style={{ background: '#ef4444' }}>2</span>
          <div><strong>Kill expensive debt</strong><p>Store cards (20%+), personal loans, credit cards. Pay these off before investing.</p></div></div>
        <div className="wrh-order-step"><span className="wrh-order-num" style={{ background: '#10b981' }}>3</span>
          <div><strong>Tax-Free Savings Account</strong><p>R500/month into a TFSA. All growth is tax-free forever. Best deal in SA.</p></div></div>
        <div className="wrh-order-step"><span className="wrh-order-num" style={{ background: '#8b5cf6' }}>4</span>
          <div><strong>Retirement Annuity</strong><p>Get your tax deduction. R2k/month RA = ~R600/month tax saving. Free money.</p></div></div>
        <div className="wrh-order-step"><span className="wrh-order-num" style={{ background: '#f59e0b' }}>5</span>
          <div><strong>Property / Additional Investments</strong><p>Once 1-4 are covered, start saving for a deposit or extra investments.</p></div></div>
      </div>
    </div>
  );
}

export default WalletRestingHelper;