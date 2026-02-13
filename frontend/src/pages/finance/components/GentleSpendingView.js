// frontend/src/pages/finance/components/GentleSpendingView.js - CONNECTED VERSION WITH FIRESTORE FIX
import React, { useState, useEffect, useCallback } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  FaMoneyBillWave, FaHome, FaSave, FaUndo, 
  FaChartPie, FaShieldAlt, FaUsers, 
  FaUmbrellaBeach, FaCoins
} from 'react-icons/fa';
import { db } from '../../../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import '../styles/professional-finance.css';

// Calculate emergency fund target
const calculateEmergencyFundTarget = (monthlyExpenses) => ({
  threeMonths: monthlyExpenses * 3,
  sixMonths: monthlyExpenses * 6,
  message: `Aim for R${(monthlyExpenses * 3).toLocaleString()} (3 months) first`
});

// December holiday savings calculator
const calculateDecemberSavings = (desiredAmount, currentMonth) => {
  const monthsUntilDecember = currentMonth <= 11 ? 12 - currentMonth : 12;
  const monthlySave = desiredAmount / monthsUntilDecember;
  return {
    monthly: Math.round(monthlySave),
    months: monthsUntilDecember,
    message: `Save R${Math.round(monthlySave).toLocaleString()}/month for December`
  };
};

// Icon mapping function
const getIcon = (iconName) => {
  switch(iconName) {
    case 'FaHome': return <FaHome />;
    case 'FaUsers': return <FaUsers />;
    case 'FaShieldAlt': return <FaShieldAlt />;
    case 'FaUmbrellaBeach': return <FaUmbrellaBeach />;
    default: return <FaChartPie />;
  }
};

// ══════════════════════════════════════════════
// COMPONENT — now receives salary from parent
// Props: grossSalary, takeHomeData, onGrossSalaryChange
// ══════════════════════════════════════════════
const GentleSpendingView = ({ grossSalary, takeHomeData, onGrossSalaryChange }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  
  const currentMonth = new Date().getMonth();
  
  // Use take-home from parent
  const takeHomePay = takeHomeData.takeHomePay;

  const [spendingData, setSpendingData] = useState({
    monthlyIncome: takeHomePay,
    emergencyFund: {
      current: 5000,
      target: takeHomePay * 3,
      progress: 0
    },
    decemberHoliday: {
      target: 10000,
      current: 0,
      monthlySave: 0
    },
    categories: [
      {
        id: 1,
        name: 'Basic Needs',
        description: 'Rent, groceries, electricity, transport',
        color: '#2E8B57',
        icon: 'FaHome',
        amount: 12000,
        percentage: 48,
        saItems: [
          { name: 'Rent/Bond', typical: 8000, actual: 8000 },
          { name: 'Groceries', typical: 3000, actual: 3000 },
          { name: 'Electricity', typical: 1000, actual: 1000 },
          { name: 'Transport', typical: 2000, actual: 2000 },
          { name: 'Airtime/Data', typical: 500, actual: 500 }
        ],
        messages: [
          "Taking care of basics first is financial wisdom.",
          "A roof and food are non-negotiable - you're doing great.",
          "These expenses keep you safe and functioning."
        ]
      },
      {
        id: 2,
        name: 'Family & Umsebenzi',
        description: 'Black Tax, stokvel, burial society, family support',
        color: '#8B4513',
        icon: 'FaUsers',
        amount: 5000,
        percentage: 20,
        saItems: [
          { name: 'Parents Support', typical: 2000, actual: 2000 },
          { name: 'Siblings/Extended', typical: 1500, actual: 1500 },
          { name: 'Stokvel Contribution', typical: 1000, actual: 1000 },
          { name: 'Burial Society', typical: 500, actual: 500 }
        ],
        messages: [
          "You're building generational wealth - what an honor.",
          "Remember: Secure your oxygen mask first before helping others.",
          "Setting boundaries is an act of love for everyone.",
          "Your support today plants trees for tomorrow's shade."
        ],
        boundaryTips: [
          "Consider a fixed monthly amount instead of ad-hoc giving",
          "Have an 'Umsebenzi budget' - once it's gone, it's gone",
          "It's okay to say 'I can help next month'"
        ]
      },
      {
        id: 3,
        name: 'Future You',
        description: 'Emergency fund, retirement, savings, investments',
        color: '#4169E1',
        icon: 'FaShieldAlt',
        amount: 4000,
        percentage: 16,
        saItems: [
          { name: 'Emergency Fund', typical: 2000, actual: 2000 },
          { name: 'Retirement Annuity', typical: 1500, actual: 1500 },
          { name: 'Tax-Free Savings', typical: 500, actual: 500 }
        ],
        messages: [
          "Every rand saved is future-you breathing easier.",
          "Retirement may seem far, but compound interest loves early starters.",
          "Your emergency fund is your financial oxygen tank.",
          "RA contributions reduce your tax - smart move!"
        ],
        investmentTips: [
          "Start with R500/month in a Tax-Free Savings Account",
          "Consider a Retirement Annuity for tax benefits (up to 27.5% of income)",
          "Emergency fund first, then investments"
        ]
      },
      {
        id: 4,
        name: 'Living & Joy',
        description: 'Entertainment, self-care, hobbies, holidays',
        color: '#FF6B6B',
        icon: 'FaUmbrellaBeach',
        amount: 4000,
        percentage: 16,
        saItems: [
          { name: 'Takeaways/Eating Out', typical: 1500, actual: 1500 },
          { name: 'Movies/Entertainment', typical: 1000, actual: 1000 },
          { name: 'Self-Care/Hair/Beauty', typical: 1000, actual: 1000 },
          { name: 'December Holiday Fund', typical: 500, actual: 500 }
        ],
        messages: [
          "Joy is not a luxury - it's necessary for a full life.",
          "You work hard. You deserve moments that make you smile.",
          "Self-care isn't selfish - it's how you stay strong for others.",
          "December memories are priceless. Plan for them."
        ]
      }
    ]
  });

  const [currentMessage, setCurrentMessage] = useState({
    category: 'Welcome',
    message: "Let's plan your finances gently. No judgment, just SA reality.",
    icon: <FaChartPie />
  });

  // ── Sync monthlyIncome when parent's takeHomePay changes ──
  useEffect(() => {
    setSpendingData(prev => ({
      ...prev,
      monthlyIncome: takeHomePay,
      emergencyFund: {
        ...prev.emergencyFund,
        target: takeHomePay * 3
      }
    }));
  }, [takeHomePay]);

  // Calculate totals
  const totalSpent = spendingData.categories.reduce((sum, cat) => sum + cat.amount, 0);
  const moneyLeft = spendingData.monthlyIncome - totalSpent;
  
  const emergencyFundTarget = calculateEmergencyFundTarget(spendingData.monthlyIncome);
  const emergencyFundProgress = Math.min(100, (spendingData.emergencyFund.current / emergencyFundTarget.threeMonths) * 100);
  
  const decemberSavings = calculateDecemberSavings(
    spendingData.decemberHoliday.target, 
    currentMonth
  );

  // Load from Firestore
  const loadFromFirestore = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'professionalFinance', currentUser.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists() && docSnap.data().gentleSpending) {
        const savedData = docSnap.data().gentleSpending;
        setSpendingData(savedData);
        
        // Update parent with saved gross salary
        if (savedData.grossSalary && onGrossSalaryChange) {
          onGrossSalaryChange(savedData.grossSalary);
        }
        
        setCurrentMessage({
          category: 'Loaded',
          message: "Welcome back! Your SA financial plan is loaded.",
          icon: <FaUndo />
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, onGrossSalaryChange]);

  // Update percentages - FIXED VERSION
  const updatePercentages = useCallback(() => {
    if (spendingData.monthlyIncome <= 0) return;
    
    setSpendingData(prev => {
      const updatedCategories = prev.categories.map(category => ({
        ...category,
        percentage: Math.round((category.amount / prev.monthlyIncome) * 100)
      }));
      
      return {
        ...prev,
        categories: updatedCategories
      };
    });
  }, [spendingData.monthlyIncome]); // Only depends on monthlyIncome

  // Handle gross salary change — updates parent which flows back as props
  const handleGrossSalaryChange = (e) => {
    const newGross = parseInt(e.target.value) || 0;
    if (onGrossSalaryChange) {
      onGrossSalaryChange(newGross);
    }
  };

  // Handle category amount change
  const handleCategoryChange = (id, amount) => {
    const updatedCategories = spendingData.categories.map(category => {
      if (category.id === id) {
        return { ...category, amount };
      }
      return category;
    });
    
    setSpendingData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  // Handle SA item amount change
  const handleSAItemChange = (categoryId, itemName, amount) => {
    const updatedCategories = spendingData.categories.map(category => {
      if (category.id === categoryId) {
        const updatedItems = category.saItems.map(item => 
          item.name === itemName ? { ...item, actual: amount } : item
        );
        const newTotal = updatedItems.reduce((sum, item) => sum + item.actual, 0);
        return { ...category, saItems: updatedItems, amount: newTotal };
      }
      return category;
    });
    
    setSpendingData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  // Handle emergency fund change
  const handleEmergencyFundChange = (current) => {
    setSpendingData(prev => ({
      ...prev,
      emergencyFund: {
        ...prev.emergencyFund,
        current: current,
        progress: (current / prev.emergencyFund.target) * 100
      }
    }));
  };

  // Handle December holiday target change
  const handleDecemberTargetChange = (target) => {
    const decemberUpdate = calculateDecemberSavings(target, currentMonth);
    setSpendingData(prev => ({
      ...prev,
      decemberHoliday: {
        target: target,
        current: prev.decemberHoliday.current,
        monthlySave: decemberUpdate.monthly
      }
    }));
  };

  // Generate gentle message
  const generateMessage = (categoryName, messageType = 'general') => {
    const category = spendingData.categories.find(cat => cat.name === categoryName);
    if (category) {
      let messagePool = category.messages;
      if (messageType === 'boundary' && category.boundaryTips) {
        messagePool = category.boundaryTips.map(tip => `💡 ${tip}`);
      } else if (messageType === 'investment' && category.investmentTips) {
        messagePool = category.investmentTips.map(tip => `📈 ${tip}`);
      }
      const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
      setCurrentMessage({
        category: categoryName,
        message: randomMessage,
        icon: getIcon(category.icon)
      });
    }
  };

  // Save to Firestore (include grossSalary so it loads back)
  const saveToFirestore = async () => {
    if (!currentUser) {
      alert('Please login to save your progress');
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, 'professionalFinance', currentUser.uid);
      await setDoc(userRef, {
        gentleSpending: { ...spendingData, grossSalary },
        takeHomeCalculation: takeHomeData,
        lastUpdated: new Date().toISOString(),
        moneyLeft: moneyLeft,
        emergencyFundProgress: emergencyFundProgress,
        decemberMonthlySave: decemberSavings.monthly
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving your plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    // Reset parent salary
    if (onGrossSalaryChange) {
      onGrossSalaryChange(35000);
    }

    setSpendingData({
      monthlyIncome: 25000,
      emergencyFund: { current: 5000, target: 75000, progress: 6.7 },
      decemberHoliday: { target: 10000, current: 0, monthlySave: 833 },
      categories: [
        {
          id: 1, name: 'Basic Needs', description: 'Rent, groceries, electricity, transport',
          color: '#2E8B57', icon: 'FaHome', amount: 12000, percentage: 48,
          saItems: [
            { name: 'Rent/Bond', typical: 8000, actual: 8000 },
            { name: 'Groceries', typical: 3000, actual: 3000 },
            { name: 'Electricity', typical: 1000, actual: 1000 },
            { name: 'Transport', typical: 2000, actual: 2000 },
            { name: 'Airtime/Data', typical: 500, actual: 500 }
          ],
          messages: [
            "Taking care of basics first is financial wisdom.",
            "A roof and food are non-negotiable - you're doing great.",
            "These expenses keep you safe and functioning."
          ]
        },
        {
          id: 2, name: 'Family & Umsebenzi', description: 'Black Tax, stokvel, burial society, family support',
          color: '#8B4513', icon: 'FaUsers', amount: 5000, percentage: 20,
          saItems: [
            { name: 'Parents Support', typical: 2000, actual: 2000 },
            { name: 'Siblings/Extended', typical: 1500, actual: 1500 },
            { name: 'Stokvel Contribution', typical: 1000, actual: 1000 },
            { name: 'Burial Society', typical: 500, actual: 500 }
          ],
          messages: [
            "You're building generational wealth - what an honor.",
            "Remember: Secure your oxygen mask first before helping others.",
            "Setting boundaries is an act of love for everyone.",
            "Your support today plants trees for tomorrow's shade."
          ],
          boundaryTips: [
            "Consider a fixed monthly amount instead of ad-hoc giving",
            "Have an 'Umsebenzi budget' - once it's gone, it's gone",
            "It's okay to say 'I can help next month'"
          ]
        },
        {
          id: 3, name: 'Future You', description: 'Emergency fund, retirement, savings, investments',
          color: '#4169E1', icon: 'FaShieldAlt', amount: 4000, percentage: 16,
          saItems: [
            { name: 'Emergency Fund', typical: 2000, actual: 2000 },
            { name: 'Retirement Annuity', typical: 1500, actual: 1500 },
            { name: 'Tax-Free Savings', typical: 500, actual: 500 }
          ],
          messages: [
            "Every rand saved is future-you breathing easier.",
            "Retirement may seem far, but compound interest loves early starters.",
            "Your emergency fund is your financial oxygen tank.",
            "RA contributions reduce your tax - smart move!"
          ],
          investmentTips: [
            "Start with R500/month in a Tax-Free Savings Account",
            "Consider a Retirement Annuity for tax benefits (up to 27.5% of income)",
            "Emergency fund first, then investments"
          ]
        },
        {
          id: 4, name: 'Living & Joy', description: 'Entertainment, self-care, hobbies, holidays',
          color: '#FF6B6B', icon: 'FaUmbrellaBeach', amount: 4000, percentage: 16,
          saItems: [
            { name: 'Takeaways/Eating Out', typical: 1500, actual: 1500 },
            { name: 'Movies/Entertainment', typical: 1000, actual: 1000 },
            { name: 'Self-Care/Hair/Beauty', typical: 1000, actual: 1000 },
            { name: 'December Holiday Fund', typical: 500, actual: 500 }
          ],
          messages: [
            "Joy is not a luxury - it's necessary for a full life.",
            "You work hard. You deserve moments that make you smile.",
            "Self-care isn't selfish - it's how you stay strong for others.",
            "December memories are priceless. Plan for them."
          ]
        }
      ]
    });

    setCurrentMessage({
      category: 'Reset',
      message: "Fresh start! Let's create a plan that works for SA reality.",
      icon: <FaUndo />
    });
  };

  // Load data on mount
  useEffect(() => {
    if (currentUser) {
      loadFromFirestore();
    }
  }, [currentUser, loadFromFirestore]);

  // Update percentages when data changes
  useEffect(() => {
    updatePercentages();
  }, [spendingData.monthlyIncome, updatePercentages]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div>Loading your financial plan...</div>
      </div>
    );
  }

  // Chart data
  const pieData = spendingData.categories.map(cat => ({
    name: cat.name, value: cat.amount, color: cat.color
  }));

  const saItemsBarData = spendingData.categories.flatMap(category =>
    category.saItems.map(item => ({
      name: item.name, amount: item.actual, category: category.name, color: category.color
    }))
  );

  // Tax breakdown uses parent data
  const taxBreakdownData = [
    { name: 'Take-Home Pay', amount: takeHomeData.takeHomePay, color: '#10B981' },
    { name: 'Tax', amount: takeHomeData.deductions.tax, color: '#EF4444' },
    { name: 'Retirement', amount: takeHomeData.deductions.retirement, color: '#3B82F6' },
    { name: 'Medical Aid', amount: takeHomeData.deductions.medicalAid, color: '#8B5CF6' },
    { name: 'UIF', amount: takeHomeData.deductions.uif, color: '#F59E0B' }
  ];

  return (
    <div className="gentle-spending-container">
      <div className="gentle-header">
        <h2 className="gentle-title">
          <FaMoneyBillWave className="title-icon" />
          SA Professional Finance Planner
        </h2>
        <p className="gentle-subtitle">
          Realistic financial planning for South African realities. No judgment.
        </p>
      </div>

      {/* Gentle Message Banner */}
      <div className="gentle-message-banner">
        <div className="message-icon">{currentMessage.icon}</div>
        <div className="message-content">
          <h4>{currentMessage.category}</h4>
          <p>{currentMessage.message}</p>
        </div>
      </div>

      {/* Income Calculator — edits update ALL tabs via parent */}
      <div className="income-calculator-section">
        <h3 className="section-title">
          <FaMoneyBillWave /> Income Calculator
        </h3>
        <div className="calculator-grid">
          <div className="calculator-input">
            <label>Your Gross Salary (R)</label>
            <div className="salary-input-wrapper">
              <span className="currency">R</span>
              <input
                type="number"
                value={grossSalary}
                onChange={handleGrossSalaryChange}
                className="salary-input"
                min="0"
                step="1000"
              />
            </div>
            <button 
              className="tax-toggle-btn"
              onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
            >
              {showTaxBreakdown ? 'Hide' : 'Show'} Tax Breakdown
            </button>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '10px' }}>
              💡 This salary is shared across all tabs
            </p>
          </div>
          
          <div className="take-home-display">
            <div className="take-home-amount">
              <span className="take-home-label">Take-Home Pay:</span>
              <span className="take-home-value">
                R {takeHomeData.takeHomePay.toLocaleString()}
              </span>
            </div>
            <p className="take-home-description">
              After tax, UIF, medical aid, and retirement deductions
            </p>
            
            {showTaxBreakdown && (
              <div className="tax-breakdown">
                <h4>📊 Where Your Money Goes:</h4>
                <div className="tax-breakdown-grid">
                  {taxBreakdownData.map((item, index) => (
                    <div key={index} className="tax-item">
                      <span className="tax-name">{item.name}</span>
                      <span className="tax-amount">R {item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Fund Progress */}
      <div className="emergency-fund-section">
        <h3 className="section-title"><FaShieldAlt /> Emergency Fund Progress</h3>
        <div className="emergency-fund-card">
          <div className="emergency-fund-header">
            <div>
              <h4>Safety Net Goal: 3 Months of Expenses</h4>
              <p>Target: R{emergencyFundTarget.threeMonths.toLocaleString()}</p>
            </div>
            <div className="emergency-fund-input">
              <label>Current Savings:</label>
              <div className="fund-input-wrapper">
                <span className="currency">R</span>
                <input
                  type="number"
                  value={spendingData.emergencyFund.current}
                  onChange={(e) => handleEmergencyFundChange(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${emergencyFundProgress}%`, background: '#4169E1' }} />
          </div>
          <div className="progress-text">
            <span>R{spendingData.emergencyFund.current.toLocaleString()} saved</span>
            <span style={{ color: '#4169E1', fontWeight: 700 }}>{emergencyFundProgress.toFixed(1)}%</span>
            <span>Goal: R{emergencyFundTarget.threeMonths.toLocaleString()}</span>
          </div>
          {emergencyFundProgress >= 100 ? (
            <div className="celebration-message">🎉 You've reached your emergency fund goal! Consider aiming for 6 months.</div>
          ) : (
            <div className="encouragement-message">{emergencyFundTarget.message}</div>
          )}
        </div>
      </div>

      {/* December Holiday Planning */}
      <div className="december-planning-section">
        <h3 className="section-title"><FaUmbrellaBeach /> December Holiday Planning</h3>
        <div className="december-planning-card">
          <div className="december-inputs">
            <div className="december-input">
              <label>December Holiday Budget</label>
              <div className="amount-input">
                <span>R</span>
                <input
                  type="number"
                  value={spendingData.decemberHoliday.target}
                  onChange={(e) => handleDecemberTargetChange(parseInt(e.target.value) || 0)}
                  min="0" step="500"
                />
              </div>
            </div>
            <div className="december-result">
              <h4>{decemberSavings.message}</h4>
              <p>Only {decemberSavings.months} months until December!</p>
            </div>
          </div>
          <div className="december-tips">
            <p>💡 <strong>December Reality Check:</strong></p>
            <ul>
              <li>Travel costs increase by 30-50% in December</li>
              <li>Gift budget: R200-500 per close family member</li>
              <li>Food costs: Plan for 20% more than usual</li>
              <li>Start buying non-perishables from October</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="gentle-content-grid">
        {/* Left Column: Categories */}
        <div className="gentle-left-column">
          <div className="categories-section">
            <h3 className="section-title">SA-Specific Spending</h3>
            <p className="section-subtitle">Click category icons for gentle tips. Adjust SA-specific items.</p>
            
            {spendingData.categories.map(category => (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <div className="category-icon" style={{ color: category.color }}
                    onClick={() => generateMessage(category.name, 'general')} title="Click for gentle message">
                    {getIcon(category.icon)}
                  </div>
                  <div className="category-title">
                    <h4>{category.name}</h4>
                    <p className="category-description">{category.description}</p>
                  </div>
                  <div className="category-percentage">{category.percentage}%</div>
                  <div className="category-actions">
                    {category.boundaryTips && (
                      <button className="boundary-tip-btn" onClick={() => generateMessage(category.name, 'boundary')}>
                        <FaCoins /> Tips
                      </button>
                    )}
                    {category.investmentTips && (
                      <button className="investment-tip-btn" onClick={() => generateMessage(category.name, 'investment')}>
                        <FaChartPie /> Tips
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="sa-items-list">
                  {category.saItems.map((item, index) => (
                    <div key={index} className="sa-item">
                      <span className="sa-item-name">{item.name}</span>
                      <div className="sa-item-input">
                        <span className="currency-small">R</span>
                        <input type="number" value={item.actual}
                          onChange={(e) => handleSAItemChange(category.id, item.name, parseInt(e.target.value) || 0)}
                          min="0" step="100" />
                        <span className="typical-amount">(Typical: R{item.typical.toLocaleString()})</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="category-slider">
                  <input type="range" min="0" max={spendingData.monthlyIncome}
                    value={category.amount}
                    onChange={(e) => handleCategoryChange(category.id, parseInt(e.target.value))}
                    className="slider-input" style={{ '--track-color': category.color }} />
                  <div className="slider-labels">
                    <span>R 0</span>
                    <div className="category-amount-display">R {category.amount.toLocaleString()}</div>
                    <span>R {spendingData.monthlyIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Charts & Summary */}
        <div className="gentle-right-column">
          <div className="visualization-section">
            <h3 className="section-title">Your Spending Breakdown</h3>
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80} fill="#8884d8" dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R ${value.toLocaleString()}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="visualization-section">
            <h3 className="section-title">SA-Specific Expenses Detail</h3>
            <div className="bar-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={saItemsBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R ${value.toLocaleString()}`, 'Amount']} labelStyle={{ color: '#333' }} />
                  <Bar dataKey="amount" fill="#8884d8">
                    {saItemsBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-card">
              <h4 className="summary-title">Month-End Summary</h4>
              <div className="summary-item">
                <span>Take-Home Pay:</span>
                <span className="summary-amount income">R {takeHomeData.takeHomePay.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span>Total Allocated:</span>
                <span className="summary-amount allocated">R {totalSpent.toLocaleString()}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item highlight">
                <span>Money Left for Month:</span>
                <span className={`summary-amount ${moneyLeft >= 0 ? 'positive' : 'negative'}`}>
                  R {Math.abs(moneyLeft).toLocaleString()}{moneyLeft < 0 && ' (Over budget)'}
                </span>
              </div>
              {moneyLeft > 0 && (
                <div className="suggestion-box">
                  <p>💡 You have R {moneyLeft.toLocaleString()} unallocated. Consider adding to emergency fund or December savings.</p>
                </div>
              )}
              {moneyLeft < 0 && (
                <div className="warning-box">
                  <p>⚠️ You're over budget by R {Math.abs(moneyLeft).toLocaleString()}. Consider adjusting SA-specific items above.</p>
                </div>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={saveToFirestore} disabled={loading} className="btn-save">
              <FaSave /> {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Plan'}
            </button>
            <button onClick={resetToDefaults} className="btn-reset">
              <FaUndo /> Reset to Defaults
            </button>
            {!currentUser && (
              <div className="login-prompt"><p>💡 Login to save your SA financial plan across devices</p></div>
            )}
          </div>
        </div>
      </div>

      {/* SA Tips */}
      <div className="tips-section">
        <h3 className="tips-title">💡 South African Financial Wisdom</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🤝</div>
            <h4>Umsebenzi with Boundaries</h4>
            <p>"Black Tax" is real. Set a fixed monthly amount instead of ad-hoc giving. It's okay to say "next month."</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🛡️</div>
            <h4>Emergency Fund First</h4>
            <p>Before investments, build 3 months of BASIC expenses (rent, food, transport). This is your financial oxygen.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h4>December Starts in January</h4>
            <p>December expenses break budgets. Start saving in January. R833/month = R10,000 for December.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📈</div>
            <h4>RA Tax Benefits</h4>
            <p>Retirement Annuity contributions reduce taxable income (up to 27.5%). It's like getting a 30% discount on savings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GentleSpendingView;