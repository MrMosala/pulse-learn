// frontend/src/pages/finance/components/FamilySupportPlanner.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaUsers, FaPlus, FaTrash,
  FaShieldAlt, FaExclamationTriangle, FaQuoteLeft,
  FaChartPie, FaHeart, FaMoneyBillWave
} from 'react-icons/fa';

// Firebase imports
import { db } from '../../../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';

// ══════════════════════════════════════════════
// GENTLE BOUNDARY SCRIPTS — Real phrases people can use
// ══════════════════════════════════════════════
const BOUNDARY_SCRIPTS = [
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

// ══════════════════════════════════════════════
// SA WISDOM — Gentle messages
// ══════════════════════════════════════════════
const WISDOM_MESSAGES = [
  'Umuntu ngumuntu ngabantu — but you can\'t pour from an empty cup.',
  'Supporting family is beautiful. Destroying yourself isn\'t.',
  'The best gift you can give your family is your own financial stability.',
  'Setting boundaries isn\'t selfish — it\'s how love becomes sustainable.',
  'You didn\'t create these circumstances. You\'re doing your best.',
  'A tree with strong roots can shelter many. Take care of your roots.',
  'Your ancestors would want you to thrive, not just survive.',
];

// ══════════════════════════════════════════════
// RELATIONSHIP OPTIONS
// ══════════════════════════════════════════════
const RELATIONSHIPS = [
  'Parent', 'Sibling', 'Grandparent', 'Child',
  'Niece/Nephew', 'Aunt/Uncle', 'Cousin', 'Extended Family', 'Other'
];

const FREQUENCIES = [
  { value: 'monthly', label: 'Every month', multiplier: 1 },
  { value: 'quarterly', label: 'Every 3 months', multiplier: 0.33 },
  { value: 'school-term', label: 'School terms (×4/year)', multiplier: 0.33 },
  { value: 'yearly', label: 'Once a year', multiplier: 0.083 },
  { value: 'as-needed', label: 'When they ask', multiplier: 0.5 },
];

// ══════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════
const FamilySupportPlanner = ({ takeHomePay }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [wisdomIndex, setWisdomIndex] = useState(0);

  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: 'Mother', relationship: 'Parent', amount: 2000, frequency: 'monthly', note: '' },
    { id: 2, name: 'Younger Brother', relationship: 'Sibling', amount: 800, frequency: 'monthly', note: 'Transport & data' },
  ]);

  const [communityCommitments, setCommunityCommitments] = useState([
    { id: 1, name: 'Stokvel', amount: 1000, frequency: 'monthly' },
    { id: 2, name: 'Burial Society', amount: 500, frequency: 'monthly' },
  ]);

  const [emergencyBudget, setEmergencyBudget] = useState(500);

  // ── Calculations ──
  const monthlyFamilyTotal = familyMembers.reduce((sum, m) => {
    const freq = FREQUENCIES.find(f => f.value === m.frequency);
    return sum + (m.amount * (freq ? freq.multiplier : 1));
  }, 0);

  const monthlyCommunityTotal = communityCommitments.reduce((sum, c) => {
    const freq = FREQUENCIES.find(f => f.value === c.frequency);
    return sum + (c.amount * (freq ? freq.multiplier : 1));
  }, 0);

  const totalMonthlySupport = Math.round(monthlyFamilyTotal + monthlyCommunityTotal + emergencyBudget);
  const supportPercentage = takeHomePay > 0 ? Math.round((totalMonthlySupport / takeHomePay) * 100) : 0;
  const moneyAfterSupport = takeHomePay - totalMonthlySupport;

  // ── Firebase Load Function ──
  const loadFromFirestore = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'professionalFinance', currentUser.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists() && docSnap.data().familySupport) {
        const savedData = docSnap.data().familySupport;
        setFamilyMembers(savedData.familyMembers || []);
        setCommunityCommitments(savedData.communityCommitments || []);
        setEmergencyBudget(savedData.emergencyBudget || 500);
      }
    } catch (error) {
      console.error('Error loading family support data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ── Firebase Save Function ──
  const saveToFirestore = async () => {
    if (!currentUser) {
      alert('Please login to save your family support plan');
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, 'professionalFinance', currentUser.uid);
      await setDoc(userRef, {
        familySupport: {
          familyMembers,
          communityCommitments,
          emergencyBudget,
          totalMonthlySupport,
          supportPercentage,
          lastUpdated: new Date().toISOString()
        }
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving family support data:', error);
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

  // Health indicator
  const getHealthStatus = () => {
    if (supportPercentage <= 15) return { label: 'Sustainable', color: '#10b981', emoji: '💚', message: 'You\'re supporting family while keeping yourself strong.' };
    if (supportPercentage <= 25) return { label: 'Manageable', color: '#f59e0b', emoji: '💛', message: 'This is common for SA professionals. Watch that it doesn\'t creep up.' };
    if (supportPercentage <= 35) return { label: 'Stretching', color: '#f97316', emoji: '🧡', message: 'You\'re giving a lot. Make sure YOUR basics are covered first.' };
    return { label: 'At Risk', color: '#ef4444', emoji: '❤️‍🩹', message: 'This level of support may harm your own financial health. Consider boundaries.' };
  };

  const health = getHealthStatus();

  // ── Family member management ──
  const addFamilyMember = () => {
    const newId = Math.max(0, ...familyMembers.map(m => m.id)) + 1;
    setFamilyMembers([...familyMembers, {
      id: newId, name: '', relationship: 'Extended Family',
      amount: 500, frequency: 'monthly', note: ''
    }]);
  };

  const removeFamilyMember = (id) => {
    if (familyMembers.length > 0) {
      setFamilyMembers(familyMembers.filter(m => m.id !== id));
    }
  };

  const updateFamilyMember = (id, field, value) => {
    setFamilyMembers(familyMembers.map(m =>
      m.id === id ? { ...m, [field]: field === 'amount' ? (parseInt(value) || 0) : value } : m
    ));
  };

  // ── Community commitment management ──
  const addCommunityCommitment = () => {
    const newId = Math.max(0, ...communityCommitments.map(c => c.id)) + 1;
    setCommunityCommitments([...communityCommitments, {
      id: newId, name: '', amount: 500, frequency: 'monthly'
    }]);
  };

  const removeCommunityCommitment = (id) => {
    setCommunityCommitments(communityCommitments.filter(c => c.id !== id));
  };

  const updateCommunityCommitment = (id, field, value) => {
    setCommunityCommitments(communityCommitments.map(c =>
      c.id === id ? { ...c, [field]: field === 'amount' ? (parseInt(value) || 0) : value } : c
    ));
  };

  // ── Wisdom rotation ──
  const nextWisdom = () => {
    setWisdomIndex((wisdomIndex + 1) % WISDOM_MESSAGES.length);
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div>Loading your family support plan...</div>
      </div>
    );
  }

  return (
    <div className="family-support-container">

      {/* ── WISDOM BANNER ── */}
      <div className="fsp-wisdom-banner" onClick={nextWisdom}>
        <FaQuoteLeft className="fsp-wisdom-icon" />
        <p className="fsp-wisdom-text">{WISDOM_MESSAGES[wisdomIndex]}</p>
        <span className="fsp-wisdom-tap">tap for more wisdom</span>
      </div>

      {/* ── INCOME CONTEXT (from shared salary) ── */}
      <div className="fsp-income-context">
        <FaMoneyBillWave />
        <span>Your take-home pay: <strong>R{takeHomePay.toLocaleString()}</strong>/month</span>
        <span className="fsp-income-hint">Change this in the Gentle Spending tab</span>
      </div>

      {/* ── HEALTH METER ── */}
      <div className="fsp-health-meter" style={{ borderColor: health.color }}>
        <div className="fsp-health-top">
          <div className="fsp-health-label">
            <span className="fsp-health-emoji">{health.emoji}</span>
            <div>
              <strong style={{ color: health.color }}>{health.label}</strong>
              <span className="fsp-health-pct">{supportPercentage}% of income to support</span>
            </div>
          </div>
          <div className="fsp-health-amounts">
            <div className="fsp-health-giving">
              <span>Giving</span>
              <strong style={{ color: health.color }}>R{totalMonthlySupport.toLocaleString()}</strong>
            </div>
            <div className="fsp-health-keeping">
              <span>Keeping</span>
              <strong style={{ color: moneyAfterSupport >= 0 ? '#10b981' : '#ef4444' }}>
                R{moneyAfterSupport.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
        <div className="fsp-health-bar-bg">
          <div
            className="fsp-health-bar-fill"
            style={{ width: `${Math.min(supportPercentage, 100)}%`, background: health.color }}
          />
          {/* Markers at 15%, 25%, 35% */}
          <div className="fsp-health-marker" style={{ left: '15%' }}>
            <span>15%</span>
          </div>
          <div className="fsp-health-marker" style={{ left: '25%' }}>
            <span>25%</span>
          </div>
          <div className="fsp-health-marker" style={{ left: '35%' }}>
            <span>35%</span>
          </div>
        </div>
        <p className="fsp-health-message">{health.message}</p>
      </div>

      {/* ── SAVE/LOAD CONTROLS ── */}
      <div className="fsp-action-buttons" style={{ 
        display: 'flex', 
        gap: '10px', 
        marginTop: '20px',
        marginBottom: '20px',
        justifyContent: 'center' 
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
          {loading ? 'Saving...' : saved ? '✓ Saved!' : '💾 Save Family Support Plan'}
        </button>
        {!currentUser && (
          <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>
            💡 Login to save your plan
          </div>
        )}
      </div>

      {/* ── FAMILY MEMBERS ── */}
      <div className="fsp-section">
        <div className="fsp-section-header">
          <h3 className="fsp-section-title">
            <FaHeart /> People You Support
          </h3>
          <button className="fsp-add-btn" onClick={addFamilyMember}>
            <FaPlus /> Add Person
          </button>
        </div>

        {familyMembers.length === 0 && (
          <div className="fsp-empty">
            No family members added. Click "Add Person" to start.
          </div>
        )}

        {familyMembers.map((member) => {
          const freq = FREQUENCIES.find(f => f.value === member.frequency);
          const effectiveMonthly = Math.round(member.amount * (freq ? freq.multiplier : 1));
          return (
            <div key={member.id} className="fsp-member-card">
              <div className="fsp-member-row">
                <div className="fsp-member-field">
                  <label>Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                    placeholder="e.g. Mother"
                  />
                </div>
                <div className="fsp-member-field">
                  <label>Relationship</label>
                  <select
                    value={member.relationship}
                    onChange={(e) => updateFamilyMember(member.id, 'relationship', e.target.value)}
                  >
                    {RELATIONSHIPS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="fsp-member-field amount">
                  <label>Amount (R)</label>
                  <input
                    type="number"
                    value={member.amount}
                    onChange={(e) => updateFamilyMember(member.id, 'amount', e.target.value)}
                    min="0"
                    step="100"
                  />
                </div>
                <div className="fsp-member-field">
                  <label>How often</label>
                  <select
                    value={member.frequency}
                    onChange={(e) => updateFamilyMember(member.id, 'frequency', e.target.value)}
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="fsp-remove-btn"
                  onClick={() => removeFamilyMember(member.id)}
                  title="Remove"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="fsp-member-footer">
                <input
                  type="text"
                  className="fsp-member-note"
                  value={member.note}
                  onChange={(e) => updateFamilyMember(member.id, 'note', e.target.value)}
                  placeholder="What's this for? (e.g. groceries, school fees, transport)"
                />
                <span className="fsp-effective-monthly">
                  ~R{effectiveMonthly.toLocaleString()}/month
                </span>
              </div>
            </div>
          );
        })}

        <div className="fsp-subtotal">
          <span>Family Support Total</span>
          <strong>~R{Math.round(monthlyFamilyTotal).toLocaleString()}/month</strong>
        </div>
      </div>

      {/* ── COMMUNITY COMMITMENTS ── */}
      <div className="fsp-section">
        <div className="fsp-section-header">
          <h3 className="fsp-section-title">
            <FaUsers /> Community Commitments
          </h3>
          <button className="fsp-add-btn" onClick={addCommunityCommitment}>
            <FaPlus /> Add
          </button>
        </div>

        {communityCommitments.map((commitment) => {
          const freq = FREQUENCIES.find(f => f.value === commitment.frequency);
          const effectiveMonthly = Math.round(commitment.amount * (freq ? freq.multiplier : 1));
          return (
            <div key={commitment.id} className="fsp-community-card">
              <div className="fsp-community-row">
                <div className="fsp-member-field">
                  <label>Name</label>
                  <input
                    type="text"
                    value={commitment.name}
                    onChange={(e) => updateCommunityCommitment(commitment.id, 'name', e.target.value)}
                    placeholder="e.g. Stokvel, Burial Society"
                  />
                </div>
                <div className="fsp-member-field amount">
                  <label>Amount (R)</label>
                  <input
                    type="number"
                    value={commitment.amount}
                    onChange={(e) => updateCommunityCommitment(commitment.id, 'amount', e.target.value)}
                    min="0"
                    step="100"
                  />
                </div>
                <div className="fsp-member-field">
                  <label>How often</label>
                  <select
                    value={commitment.frequency}
                    onChange={(e) => updateCommunityCommitment(commitment.id, 'frequency', e.target.value)}
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="fsp-remove-btn"
                  onClick={() => removeCommunityCommitment(commitment.id)}
                  title="Remove"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="fsp-member-footer">
                <span></span>
                <span className="fsp-effective-monthly">
                  ~R{effectiveMonthly.toLocaleString()}/month
                </span>
              </div>
            </div>
          );
        })}

        <div className="fsp-subtotal">
          <span>Community Total</span>
          <strong>~R{Math.round(monthlyCommunityTotal).toLocaleString()}/month</strong>
        </div>
      </div>

      {/* ── EMERGENCY REQUEST BUDGET ── */}
      <div className="fsp-section">
        <h3 className="fsp-section-title">
          <FaExclamationTriangle /> Emergency Request Buffer
        </h3>
        <p className="fsp-section-desc">
          Set aside a fixed amount for those unexpected "please help" calls. 
          When it's gone, it's gone — no guilt.
        </p>
        <div className="fsp-emergency-input">
          <span className="fsp-currency">R</span>
          <input
            type="number"
            value={emergencyBudget}
            onChange={(e) => setEmergencyBudget(parseInt(e.target.value) || 0)}
            min="0"
            step="100"
          />
          <span className="fsp-per-month">/month</span>
        </div>
        <div className="fsp-emergency-tip">
          💡 When someone asks and this budget is empty, you can honestly say: 
          "I've already helped others this month. I can help next month."
        </div>
      </div>

      {/* ── FULL BREAKDOWN ── */}
      <div className="fsp-breakdown">
        <h3 className="fsp-section-title">
          <FaChartPie /> Your Support Breakdown
        </h3>
        <div className="fsp-breakdown-rows">
          <div className="fsp-breakdown-row">
            <span>👨‍👩‍👧 Family members ({familyMembers.length})</span>
            <span>R{Math.round(monthlyFamilyTotal).toLocaleString()}</span>
          </div>
          <div className="fsp-breakdown-row">
            <span>🤝 Community commitments ({communityCommitments.length})</span>
            <span>R{Math.round(monthlyCommunityTotal).toLocaleString()}</span>
          </div>
          <div className="fsp-breakdown-row">
            <span>🆘 Emergency buffer</span>
            <span>R{emergencyBudget.toLocaleString()}</span>
          </div>
          <div className="fsp-breakdown-total" style={{ borderColor: health.color }}>
            <span>Total monthly support</span>
            <strong style={{ color: health.color }}>R{totalMonthlySupport.toLocaleString()}</strong>
          </div>
          <div className="fsp-breakdown-row remaining">
            <span>💰 What's left for YOU</span>
            <strong style={{ color: moneyAfterSupport >= 0 ? '#10b981' : '#ef4444' }}>
              R{moneyAfterSupport.toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* ── BOUNDARY SCRIPTS ── */}
      <div className="fsp-section">
        <div className="fsp-section-header">
          <h3 className="fsp-section-title">
            <FaShieldAlt /> Words That Help (Boundary Scripts)
          </h3>
          <button
            className="fsp-toggle-btn"
            onClick={() => setShowBoundaries(!showBoundaries)}
          >
            {showBoundaries ? 'Hide' : 'Show'} Scripts
          </button>
        </div>
        <p className="fsp-section-desc">
          Real phrases you can use. No judgment — just practical words for hard conversations.
        </p>

        {showBoundaries && (
          <div className="fsp-scripts">
            {BOUNDARY_SCRIPTS.map((script, i) => (
              <div key={i} className="fsp-script-card">
                <div className="fsp-script-situation">
                  <FaExclamationTriangle /> {script.situation}
                </div>
                <div className="fsp-script-text">
                  <FaQuoteLeft className="fsp-script-quote" />
                  {script.script}
                </div>
                <div className="fsp-script-tip">
                  💡 {script.tip}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── GOLDEN RULES ── */}
      <div className="fsp-golden-rules">
        <h3>📌 5 Rules for Sustainable Family Support</h3>
        <div className="fsp-rule">
          <span className="fsp-rule-num">1</span>
          <div>
            <strong>Fix your amount, not theirs</strong>
            <p>Decide what YOU can give monthly. Don't let requests set your budget.</p>
          </div>
        </div>
        <div className="fsp-rule">
          <span className="fsp-rule-num">2</span>
          <div>
            <strong>Pay yourself first</strong>
            <p>Rent, food, transport, savings — THEN family support. You can't help from a hospital bed.</p>
          </div>
        </div>
        <div className="fsp-rule">
          <span className="fsp-rule-num">3</span>
          <div>
            <strong>Never borrow to give</strong>
            <p>Taking out loans to support family creates a cycle that hurts everyone long-term.</p>
          </div>
        </div>
        <div className="fsp-rule">
          <span className="fsp-rule-num">4</span>
          <div>
            <strong>Teach, don't just transfer</strong>
            <p>Where possible, help family build their own income. Buy the fishing rod, not just the fish.</p>
          </div>
        </div>
        <div className="fsp-rule">
          <span className="fsp-rule-num">5</span>
          <div>
            <strong>Review quarterly, not emotionally</strong>
            <p>Every 3 months, look at what you're giving. Adjust based on facts, not guilt.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FamilySupportPlanner;