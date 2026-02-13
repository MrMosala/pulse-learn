// frontend/src/pages/finance/components/CommuteShareHelper.js - CONNECTED VERSION WITH FIRESTORE
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCar, FaBus, FaGasPump, FaUsers,
  FaCalculator, FaQuoteLeft, FaRoute, FaWrench,
  FaMoneyBillWave, FaSave
} from 'react-icons/fa';

// Firebase imports
import { db } from '../../../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';

const FUEL_PRICE = 22.50;

const PUBLIC_TRANSPORT = {
  gautrain: { name: 'Gautrain', perTrip: 65, monthly: 2800, emoji: '🚆', areas: 'Joburg, Pretoria, OR Tambo' },
  metrorail: { name: 'Metrorail', perTrip: 12, monthly: 500, emoji: '🚂', areas: 'Cape Town, Joburg, Pretoria, Durban' },
  myCity: { name: 'MyCiti Bus', perTrip: 18, monthly: 780, emoji: '🚌', areas: 'Cape Town' },
  reaVaya: { name: 'Rea Vaya BRT', perTrip: 15, monthly: 650, emoji: '🚌', areas: 'Johannesburg' },
  taxi: { name: 'Minibus Taxi', perTrip: 20, monthly: 880, emoji: '🚐', areas: 'Nationwide' },
};

const WISDOM = [
  'A car is a convenience, not a status symbol. Don\'t let it eat your salary.',
  'Every km you carpool saves you R3-5. That adds up to thousands.',
  'The real cost of your car isn\'t the payment — it\'s insurance + fuel + maintenance.',
  'Working from home 2 days/week saves R2,000-R4,000/month in transport.',
  'Your car loses 15-20% value per year. It\'s a tool, not an investment.',
];

// ══════════════════════════════════════════════
// COMPONENT — receives takeHomePay from parent
// ══════════════════════════════════════════════
function CommuteShareHelper({ takeHomePay }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const [mode, setMode] = useState('car');
  const [kmPerDay, setKmPerDay] = useState(40);
  const [fuelConsumption, setFuelConsumption] = useState(8);
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState(5);
  const [carpoolPeople, setCarpoolPeople] = useState(1);
  const [insurance, setInsurance] = useState(1200);
  const [tolls, setTolls] = useState(300);
  const [parking, setParking] = useState(400);
  const [selectedPublic, setSelectedPublic] = useState('taxi');
  const [publicTripsPerDay, setPublicTripsPerDay] = useState(2);

  // ── Firebase Load Function ──
  const loadFromFirestore = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'professionalFinance', currentUser.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists() && docSnap.data().commuteShare) {
        const savedData = docSnap.data().commuteShare;
        setMode(savedData.mode || 'car');
        setKmPerDay(savedData.kmPerDay || 40);
        setFuelConsumption(savedData.fuelConsumption || 8);
        setWorkDaysPerWeek(savedData.workDaysPerWeek || 5);
        setCarpoolPeople(savedData.carpoolPeople || 1);
        setInsurance(savedData.insurance || 1200);
        setTolls(savedData.tolls || 300);
        setParking(savedData.parking || 400);
        setSelectedPublic(savedData.selectedPublic || 'taxi');
        setPublicTripsPerDay(savedData.publicTripsPerDay || 2);
      }
    } catch (error) {
      console.error('Error loading commute share data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ── Firebase Save Function ──
  const saveToFirestore = async () => {
    if (!currentUser) {
      alert('Please login to save your commute plan');
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, 'professionalFinance', currentUser.uid);
      await setDoc(userRef, {
        commuteShare: {
          mode,
          kmPerDay,
          fuelConsumption,
          workDaysPerWeek,
          carpoolPeople,
          insurance,
          tolls,
          parking,
          selectedPublic,
          publicTripsPerDay,
          lastUpdated: new Date().toISOString()
        }
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving commute share data:', error);
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

  const kmPerMonth = kmPerDay * workDaysPerWeek * 4.33;
  const litresPerMonth = (kmPerMonth / 100) * fuelConsumption;
  const fuelCostMonthly = Math.round(litresPerMonth * FUEL_PRICE);
  const fuelPerPerson = Math.round(fuelCostMonthly / carpoolPeople);
  const carpoolSaving = fuelCostMonthly - fuelPerPerson;

  const carMonthlyCosts = {
    fuel: fuelPerPerson, insurance, service: 500, licence: 50,
    tyres: 200, carWash: 150, tolls, parking,
  };
  const totalCarMonthly = Object.values(carMonthlyCosts).reduce((sum, v) => sum + v, 0);

  const publicOption = PUBLIC_TRANSPORT[selectedPublic];
  const publicMonthlyRounded = Math.round(publicOption.perTrip * publicTripsPerDay * workDaysPerWeek * 4.33);

  const cheaperOption = totalCarMonthly < publicMonthlyRounded ? 'car' : 'public';
  const saving = Math.abs(totalCarMonthly - publicMonthlyRounded);

  // Transport as % of income
  const transportPercent = takeHomePay > 0 ? Math.round((totalCarMonthly / takeHomePay) * 100) : 0;

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div>Loading your commute plan...</div>
      </div>
    );
  }

  return (
    <div className="commute-share-container">

      <div className="csh-wisdom" onClick={() => setWisdomIdx((wisdomIdx + 1) % WISDOM.length)}>
        <FaQuoteLeft className="csh-wisdom-icon" />
        <p>{WISDOM[wisdomIdx]}</p>
        <span className="csh-wisdom-tap">tap for more</span>
      </div>

      {/* ── INCOME CONTEXT ── */}
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
          <FaSave /> {loading ? 'Saving...' : saved ? '✓ Saved!' : '💾 Save Commute Plan'}
        </button>
        {!currentUser && (
          <div style={{ color: '#666', fontSize: '14px' }}>
            💡 Login to save your plan
          </div>
        )}
      </div>

      <div className="csh-mode-toggle">
        <button className={`csh-mode-btn ${mode === 'car' ? 'active' : ''}`} onClick={() => setMode('car')}>
          <FaCar /> I Drive
        </button>
        <button className={`csh-mode-btn ${mode === 'public' ? 'active' : ''}`} onClick={() => setMode('public')}>
          <FaBus /> Public Transport
        </button>
      </div>

      {mode === 'car' && (
        <>
          <div className="csh-section">
            <h3 className="csh-section-title"><FaRoute /> Your Commute</h3>
            <div className="csh-inputs-grid">
              <div className="csh-field"><label>Distance (one way)</label>
                <div className="csh-input-row"><input type="number" value={kmPerDay}
                  onChange={(e) => setKmPerDay(parseInt(e.target.value) || 0)} min="0" />
                  <span className="csh-unit">km</span></div></div>
              <div className="csh-field"><label>Fuel consumption</label>
                <div className="csh-input-row"><input type="number" value={fuelConsumption}
                  onChange={(e) => setFuelConsumption(parseFloat(e.target.value) || 0)} min="0" step="0.5" />
                  <span className="csh-unit">L/100km</span></div></div>
              <div className="csh-field"><label>Work days/week</label>
                <div className="csh-input-row"><input type="number" value={workDaysPerWeek}
                  onChange={(e) => setWorkDaysPerWeek(parseInt(e.target.value) || 0)} min="1" max="7" />
                  <span className="csh-unit">days</span></div></div>
            </div>
          </div>

          <div className="csh-section">
            <h3 className="csh-section-title"><FaGasPump /> Fuel Cost</h3>
            <div className="csh-fuel-summary">
              <div className="csh-fuel-row"><span>Monthly distance</span><span>{Math.round(kmPerMonth).toLocaleString()} km</span></div>
              <div className="csh-fuel-row"><span>Fuel used</span><span>{Math.round(litresPerMonth)} litres</span></div>
              <div className="csh-fuel-row"><span>At R{FUEL_PRICE}/litre</span><strong style={{ color: '#f59e0b' }}>R{fuelCostMonthly.toLocaleString()}/month</strong></div>
            </div>
          </div>

          <div className="csh-section">
            <h3 className="csh-section-title"><FaUsers /> Carpool Savings</h3>
            <p className="csh-section-desc">Split fuel with colleagues. Same route, fraction of the cost.</p>
            <div className="csh-carpool-input">
              <label>People in the car (including you)</label>
              <div className="csh-people-btns">
                {[1, 2, 3, 4].map(n => (
                  <button key={n} className={`csh-people-btn ${carpoolPeople === n ? 'active' : ''}`}
                    onClick={() => setCarpoolPeople(n)}>
                    {'🧑'.repeat(n)} {n}
                  </button>
                ))}
              </div>
            </div>
            {carpoolPeople > 1 && (
              <div className="csh-carpool-result">
                <div className="csh-carpool-row"><span>Full fuel cost</span>
                  <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.3)' }}>R{fuelCostMonthly.toLocaleString()}</span></div>
                <div className="csh-carpool-row"><span>Your share (÷{carpoolPeople})</span>
                  <strong style={{ color: '#10b981' }}>R{fuelPerPerson.toLocaleString()}</strong></div>
                <div className="csh-carpool-saving">💰 You save <strong>R{carpoolSaving.toLocaleString()}/month</strong> by carpooling. That's R{(carpoolSaving * 12).toLocaleString()}/year.</div>
              </div>
            )}
          </div>

          <div className="csh-section">
            <h3 className="csh-section-title"><FaWrench /> Total Car Cost</h3>
            <p className="csh-section-desc">The REAL cost of driving — not just fuel.</p>
            <div className="csh-car-costs">
              <div className="csh-cost-row"><span>⛽ Fuel {carpoolPeople > 1 ? `(your share ÷${carpoolPeople})` : ''}</span><span>R{fuelPerPerson.toLocaleString()}</span></div>
              <div className="csh-cost-row editable"><span>🛡️ Insurance</span>
                <div className="csh-inline-input"><span>R</span><input type="number" value={insurance}
                  onChange={(e) => setInsurance(parseInt(e.target.value) || 0)} min="0" step="100" /></div></div>
              <div className="csh-cost-row"><span>🔧 Service & repairs (avg)</span><span>R500</span></div>
              <div className="csh-cost-row"><span>📋 Licence (monthly avg)</span><span>R50</span></div>
              <div className="csh-cost-row"><span>🛞 Tyres (spread monthly)</span><span>R200</span></div>
              <div className="csh-cost-row"><span>🧽 Car wash</span><span>R150</span></div>
              <div className="csh-cost-row editable"><span>🛣️ Tolls / E-tolls</span>
                <div className="csh-inline-input"><span>R</span><input type="number" value={tolls}
                  onChange={(e) => setTolls(parseInt(e.target.value) || 0)} min="0" step="50" /></div></div>
              <div className="csh-cost-row editable"><span>🅿️ Parking</span>
                <div className="csh-inline-input"><span>R</span><input type="number" value={parking}
                  onChange={(e) => setParking(parseInt(e.target.value) || 0)} min="0" step="50" /></div></div>
              <div className="csh-cost-total" style={{ borderColor: '#f59e0b' }}>
                <span>Total monthly car cost</span>
                <strong style={{ color: '#f59e0b' }}>R{totalCarMonthly.toLocaleString()}</strong>
              </div>
              {takeHomePay > 0 && (
                <div className="csh-income-pct">
                  🚗 Transport eats <strong>{transportPercent}%</strong> of your R{takeHomePay.toLocaleString()} take-home pay
                  {transportPercent > 20 && <span style={{ color: '#f97316' }}> — that's high, consider carpooling or public transport</span>}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {mode === 'public' && (
        <div className="csh-section">
          <h3 className="csh-section-title"><FaBus /> Public Transport Options</h3>
          <div className="csh-public-options">
            {Object.entries(PUBLIC_TRANSPORT).map(([key, opt]) => (
              <button key={key} className={`csh-public-btn ${selectedPublic === key ? 'active' : ''}`}
                onClick={() => setSelectedPublic(key)}>
                <span className="csh-public-emoji">{opt.emoji}</span>
                <div><strong>{opt.name}</strong><span className="csh-public-area">{opt.areas}</span></div>
                <span className="csh-public-price">~R{opt.perTrip}/trip</span>
              </button>
            ))}
          </div>
          <div className="csh-field" style={{ marginTop: '16px', maxWidth: '250px' }}>
            <label>Trips per day (usually 2 = to + from)</label>
            <div className="csh-input-row"><input type="number" value={publicTripsPerDay}
              onChange={(e) => setPublicTripsPerDay(parseInt(e.target.value) || 0)} min="1" max="6" />
              <span className="csh-unit">trips</span></div>
          </div>
          <div className="csh-public-result">
            <div className="csh-fuel-row">
              <span>{publicOption.name} — R{publicOption.perTrip}/trip × {publicTripsPerDay} × {workDaysPerWeek} days × 4.33 weeks</span>
              <strong style={{ color: '#3b82f6' }}>R{publicMonthlyRounded.toLocaleString()}/month</strong>
            </div>
            {takeHomePay > 0 && (
              <div className="csh-fuel-row">
                <span>% of take-home pay</span>
                <span>{Math.round((publicMonthlyRounded / takeHomePay) * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="csh-comparison">
        <h3 className="csh-section-title"><FaCalculator /> Car vs Public Transport</h3>
        <div className="csh-compare-cards">
          <div className={`csh-compare-card ${cheaperOption === 'car' ? 'cheaper' : ''}`}>
            <span className="csh-compare-emoji">🚗</span>
            <span className="csh-compare-label">Driving</span>
            <strong>R{totalCarMonthly.toLocaleString()}</strong>
            {cheaperOption === 'car' && <span className="csh-cheaper-badge">Cheaper</span>}
          </div>
          <div className="csh-compare-vs">vs</div>
          <div className={`csh-compare-card ${cheaperOption === 'public' ? 'cheaper' : ''}`}>
            <span className="csh-compare-emoji">{publicOption.emoji}</span>
            <span className="csh-compare-label">{publicOption.name}</span>
            <strong>R{publicMonthlyRounded.toLocaleString()}</strong>
            {cheaperOption === 'public' && <span className="csh-cheaper-badge">Cheaper</span>}
          </div>
        </div>
        <div className="csh-compare-saving">
          💰 {cheaperOption === 'car' ? 'Driving' : publicOption.name} saves you 
          <strong> R{saving.toLocaleString()}/month</strong> (R{(saving * 12).toLocaleString()}/year)
        </div>
      </div>

      <div className="csh-tips">
        <h3>💡 SA Transport Tips</h3>
        <div className="csh-tip-row"><span className="csh-tip-bullet">→</span><span>Work from home 2 days/week = 40% less fuel. Ask your employer.</span></div>
        <div className="csh-tip-row"><span className="csh-tip-bullet">→</span><span>Gautrain + Uber from station is often cheaper than driving + parking in Sandton.</span></div>
        <div className="csh-tip-row"><span className="csh-tip-bullet">→</span><span>Fuel is cheapest on the 1st Wednesday of the month (before increase announcements).</span></div>
        <div className="csh-tip-row"><span className="csh-tip-bullet">→</span><span>Car insurance excess: increase to R5,000 to drop monthly premium by 15-25%.</span></div>
        <div className="csh-tip-row"><span className="csh-tip-bullet">→</span><span>Service your car on schedule. Skipping a R2k service causes a R15k engine problem.</span></div>
      </div>
    </div>
  );
}

export default CommuteShareHelper;