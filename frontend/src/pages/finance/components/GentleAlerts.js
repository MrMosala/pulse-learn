// frontend/src/pages/finance/components/GentleAlerts.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaHeart, FaSmile, FaExclamationTriangle, 
  FaCheckCircle, FaBell, FaTimes,
  FaHome, FaUsers, FaShieldAlt, FaUmbrellaBeach,
  FaGasPump, FaMoneyBillWave, FaChartLine
} from 'react-icons/fa';
import { db } from '../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import '../styles/gentle-alerts.css';

// Alert types with their icons and colors
const ALERT_TYPES = {
  success: { icon: FaCheckCircle, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  warning: { icon: FaExclamationTriangle, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  info: { icon: FaBell, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  celebration: { icon: FaHeart, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
  encouragement: { icon: FaSmile, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' }
};

// Category icons mapping
const CATEGORY_ICONS = {
  'Basic Needs': FaHome,
  'Family & Umsebenzi': FaUsers,
  'Future You': FaShieldAlt,
  'Living & Joy': FaUmbrellaBeach,
  'Transport': FaGasPump,
  'Income': FaMoneyBillWave,
  'Savings': FaChartLine
};

// Gentle, encouraging messages - SA context
const GENTLE_MESSAGES = {
  budgetWarning: (category, percent, amount) => [
    `You've used ${percent}% of your ${category} budget. Still ${30 - new Date().getDate()} days left.`,
    `Your ${category} is at ${percent}%. Want to adjust anything? No pressure.`,
    `R${amount} left for ${category} this month. You've got this.`,
    `The ${category} budget is ${percent}% used. Small adjustments now help later.`
  ],
  
  savingsMilestone: (amount, target) => [
    `You've saved R${amount} for your emergency fund! That's ${Math.round(amount/target*100)}% of your goal.`,
    `R${amount} saved. Future you is smiling.`,
    `Every rand saved is a step toward peace of mind. R${amount} so far.`,
    `Your emergency fund is growing. R${amount} ready for life's surprises.`
  ],
  
  familySupport: (count, amount) => [
    `You're supporting ${count} family members this month. That's R${amount}. What an honor.`,
    `R${amount} to family. You're building generational wealth.`,
    `${count} people counting on you. You're doing amazing.`,
    `Family first. You're showing up for the people who matter.`
  ],
  
  decemberPlanning: (monthsLeft, monthly) => [
    `${monthsLeft} months until December. Save R${monthly}/month for a peaceful holiday.`,
    `December starts now. R${monthly}/month gets you there.`,
    `Future you will thank you for starting early. ${monthsLeft} months to go.`
  ],
  
  transportSavings: (saved) => [
    `You saved R${saved} on transport this month! Carpooling works.`,
    `R${saved} saved by sharing rides. That's groceries for a week.`,
    `Your transport choices saved R${saved}. Small changes, big impact.`
  ],
  
  generalEncouragement: [
    `You're doing better than you think. Keep going.`,
    `Financial freedom is a journey. You're on the right path.`,
    `Every small choice adds up. Today's decisions matter.`,
    `You've got this. One day at a time.`,
    `Be kind to yourself. Progress, not perfection.`
  ],

  welcomeBack: (name) => [
    `Welcome back, ${name}! Your financial plan is waiting.`,
    `Good to see you, ${name}. Let's check your progress.`,
    `You're back! Your money has been resting while you were away.`
  ],

  achievement: (achievement) => [
    `🎉 You reached ${achievement}! Celebrate this win.`,
    `Amazing! ${achievement} completed. What's next?`,
    `You did it! ${achievement}. Take a moment to appreciate yourself.`
  ]
};

const GentleAlerts = () => {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user's financial data and generate alerts
  const loadUserData = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'professionalFinance', currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const newAlerts = [];

        // Check gentle spending data
        if (data.gentleSpending) {
          const spending = data.gentleSpending;
          
          // Budget warnings (over 80%)
          spending.categories?.forEach(cat => {
            const percent = cat.percentage || 0;
            if (percent > 80) {
              const messages = GENTLE_MESSAGES.budgetWarning(
                cat.name, 
                percent, 
                (cat.amount || 0).toLocaleString()
              );
              newAlerts.push({
                id: `budget-${cat.id}-${Date.now()}`,
                type: 'warning',
                title: `${cat.name} Budget`,
                message: messages[Math.floor(Math.random() * messages.length)],
                icon: CATEGORY_ICONS[cat.name] || FaExclamationTriangle,
                timestamp: new Date().toISOString(),
                actionable: true,
                actionText: 'Adjust Budget',
                actionLink: '/finance?tab=spending'
              });
            }
          });

          // Emergency fund milestones
          if (spending.emergencyFund) {
            const current = spending.emergencyFund.current || 0;
            const target = spending.emergencyFund.target || 1;
            const percent = Math.round((current / target) * 100);
            
            if (percent >= 25 && percent < 30) {
              newAlerts.push({
                id: `emergency-25-${Date.now()}`,
                type: 'celebration',
                title: 'Emergency Fund Milestone',
                message: `You've reached 25% of your emergency fund goal! R${current.toLocaleString()} saved.`,
                icon: FaShieldAlt,
                timestamp: new Date().toISOString()
              });
            } else if (percent >= 50 && percent < 55) {
              newAlerts.push({
                id: `emergency-50-${Date.now()}`,
                type: 'celebration',
                title: 'Halfway There!',
                message: `50% to your emergency fund goal! R${current.toLocaleString()} saved. Keep going!`,
                icon: FaShieldAlt,
                timestamp: new Date().toISOString()
              });
            } else if (percent >= 100) {
              newAlerts.push({
                id: `emergency-100-${Date.now()}`,
                type: 'success',
                title: 'Emergency Fund Complete!',
                message: `You've reached your emergency fund goal! Consider aiming for 6 months now.`,
                icon: FaCheckCircle,
                timestamp: new Date().toISOString()
              });
            }
          }

          // December holiday planning
          if (spending.decemberHoliday) {
            const monthsUntilDec = new Date().getMonth() <= 11 ? 12 - new Date().getMonth() : 12;
            if (monthsUntilDec <= 6 && monthsUntilDec > 0) {
              const messages = GENTLE_MESSAGES.decemberPlanning(
                monthsUntilDec,
                (spending.decemberHoliday.monthlySave || 0).toLocaleString()
              );
              newAlerts.push({
                id: `december-${Date.now()}`,
                type: 'info',
                title: 'December Planning',
                message: messages[Math.floor(Math.random() * messages.length)],
                icon: FaUmbrellaBeach,
                timestamp: new Date().toISOString(),
                actionable: true,
                actionText: 'Plan Holiday',
                actionLink: '/finance?tab=spending'
              });
            }
          }
        }

        // Check family support data
        if (data.familySupport) {
          const family = data.familySupport;
          const memberCount = family.familyMembers?.length || 0;
          const totalAmount = family.familyMembers?.reduce((sum, m) => {
            const amount = m.amount || 0;
            const freq = m.frequency === 'yearly' ? amount/12 : 
                        m.frequency === 'quarterly' ? amount/3 : amount;
            return sum + (freq || 0);
          }, 0) || 0;

          if (memberCount > 0) {
            const messages = GENTLE_MESSAGES.familySupport(memberCount, Math.round(totalAmount).toLocaleString());
            newAlerts.push({
              id: `family-${Date.now()}`,
              type: 'encouragement',
              title: 'Family Support',
              message: messages[Math.floor(Math.random() * messages.length)],
              icon: FaUsers,
              timestamp: new Date().toISOString(),
              actionable: true,
              actionText: 'Review Support',
              actionLink: '/finance?tab=family'
            });
          }
        }

        // Check wallet resting data
        if (data.walletResting) {
          const wallet = data.walletResting;
          
          // RA tax saving tip
          if (wallet.selectedOption === 'ra' && wallet.monthlyAmount > 0) {
            const taxSaving = Math.round(wallet.monthlyAmount * 0.3); // Approximate
            newAlerts.push({
              id: `ra-tax-${Date.now()}`,
              type: 'info',
              title: 'RA Tax Benefit',
              message: `Your R${wallet.monthlyAmount}/month RA saves you about R${taxSaving}/month in tax. That's free money!`,
              icon: FaChartLine,
              timestamp: new Date().toISOString()
            });
          }
        }

        // Add a general encouragement alert if no specific alerts
        if (newAlerts.length === 0) {
          const randomMsg = GENTLE_MESSAGES.generalEncouragement[
            Math.floor(Math.random() * GENTLE_MESSAGES.generalEncouragement.length)
          ];
          newAlerts.push({
            id: `encouragement-${Date.now()}`,
            type: 'encouragement',
            title: 'Just Checking In',
            message: randomMsg,
            icon: FaSmile,
            timestamp: new Date().toISOString()
          });
        }

        // Limit to 3 most recent alerts
        setAlerts(newAlerts.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading data for alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load alerts on mount and when user changes
  useEffect(() => {
    loadUserData();

    // Refresh alerts every 5 minutes
    const interval = setInterval(loadUserData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadUserData]);

  // Dismiss an alert
  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Clear all alerts
  const clearAllAlerts = () => {
    setAlerts([]);
  };

  if (loading || alerts.length === 0) {
    return null; // Don't show anything if no alerts
  }

  return (
    <div className="gentle-alerts-container">
      <div className="alerts-header">
        <h3>
          <FaBell /> Gentle Reminders
        </h3>
        <button onClick={clearAllAlerts} className="clear-all-btn" title="Clear all">
          <FaTimes />
        </button>
      </div>

      <div className="alerts-list">
        {alerts.map(alert => {
          const AlertIcon = alert.icon || ALERT_TYPES[alert.type]?.icon || FaBell;
          const alertColor = ALERT_TYPES[alert.type]?.color || '#8B5CF6';
          const alertBg = ALERT_TYPES[alert.type]?.bg || 'rgba(139, 92, 246, 0.1)';

          return (
            <div 
              key={alert.id} 
              className="alert-item"
              style={{ backgroundColor: alertBg, borderLeftColor: alertColor }}
            >
              <div className="alert-icon" style={{ color: alertColor }}>
                <AlertIcon />
              </div>

              <div className="alert-content">
                <div className="alert-title" style={{ color: alertColor }}>
                  {alert.title}
                </div>
                <div className="alert-message">
                  {alert.message}
                </div>
                
                {alert.actionable && (
                  <a href={alert.actionLink} className="alert-action" style={{ color: alertColor }}>
                    {alert.actionText} →
                  </a>
                )}
                
                <div className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <button 
                className="dismiss-btn" 
                onClick={() => dismissAlert(alert.id)}
                title="Dismiss"
              >
                <FaTimes />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GentleAlerts;