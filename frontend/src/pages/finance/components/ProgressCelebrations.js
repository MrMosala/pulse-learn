// frontend/src/pages/finance/components/ProgressCelebrations.js
import React, { useState } from 'react';
import { FaTrophy, FaStar, FaChartLine, FaFire, FaMedal, FaAward, FaGem } from 'react-icons/fa';

function ProgressCelebrations({ userType = 'student' }) {
  const [savedAmount, setSavedAmount] = useState(0);
  const [goalAmount, setGoalAmount] = useState(500);
  
  // Define themes for each user type
  const themes = {
    student: {
      color: '#8A2BE2',
      bgColor: 'rgba(138, 43, 226, 0.1)',
      title: 'Campus Wins',
      icon: '🎓',
      achievements: [
        { id: 1, title: 'First R50 saved!', emoji: '💰', date: '2026-01-15', completed: true },
        { id: 2, title: '1 week of packed lunch', emoji: '🍱', date: '2026-01-22', completed: true },
        { id: 3, title: 'First business profit', emoji: '💼', date: '2026-01-30', completed: false },
        { id: 4, title: 'Saved R100 for shoes', emoji: '👟', date: '2026-02-15', completed: false },
      ],
      quickAchievements: [
        { emoji: '💰', title: 'Saved R50', value: 50 },
        { emoji: '👟', title: 'Saved R100 for shoes', value: 100 },
        { emoji: '📱', title: 'Saved R200 for airtime', value: 200 },
        { emoji: '🛒', title: 'Saved R300 for groceries', value: 300 },
      ],
      tips: [
        { emoji: '💰', text: 'Save R10/day = R300/month' },
        { emoji: '🍱', text: 'Pack lunch 3×/week = Save R180/month' },
        { emoji: '🚶', text: 'Walk instead of taxi 2×/week = Save R100/month' },
        { emoji: '📱', text: 'Buy airtime weekly vs daily = Save R50/month' },
      ]
    },
    learner: {
      color: '#2E8B57',
      bgColor: 'rgba(46, 139, 87, 0.1)',
      title: 'School Success',
      icon: '📚',
      achievements: [
        { id: 1, title: 'Got permission for business', emoji: '✅', date: '2026-01-15', completed: true },
        { id: 2, title: 'First R100 from hustle', emoji: '💰', date: '2026-01-22', completed: true },
        { id: 3, title: 'Saved for school trip', emoji: '🏫', date: '2026-01-30', completed: false },
        { id: 4, title: 'Helped family with R200', emoji: '❤️', date: '2026-02-15', completed: false },
      ],
      quickAchievements: [
        { emoji: '🍬', title: 'Sweet sales profit', value: 50 },
        { emoji: '📝', title: 'Stationery business', value: 100 },
        { emoji: '📱', title: 'Airtime reselling', value: 200 },
        { emoji: '🏫', title: 'School trip savings', value: 300 },
      ],
      tips: [
        { emoji: '✅', text: 'Always get permission first' },
        { emoji: '👥', text: 'Partner with friends for bigger profits' },
        { emoji: '📊', text: 'Track small profits daily' },
        { emoji: '🎯', text: 'Set small, achievable goals' },
      ]
    },
    professional: {
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.1)',
      title: 'Month-End Milestones',
      icon: '💼',
      achievements: [
        { id: 1, title: 'First budget created', emoji: '📊', date: '2026-01-15', completed: true },
        { id: 2, title: 'Emergency fund started', emoji: '🛡️', date: '2026-01-22', completed: true },
        { id: 3, title: 'Family support planned', emoji: '👨‍👩‍👧‍👦', date: '2026-01-30', completed: false },
        { id: 4, title: 'Car maintenance saved', emoji: '🚗', date: '2026-02-15', completed: false },
        { id: 5, title: '3-month savings streak', emoji: '🔥', date: '2026-02-28', completed: false },
      ],
      quickAchievements: [
        { emoji: '🛡️', title: '1 month emergency fund', value: 5000 },
        { emoji: '🚗', title: 'Car service saved', value: 2000 },
        { emoji: '👨‍👩‍👧‍👦', title: 'Family support budget', value: 3000 },
        { emoji: '💰', title: 'Tax-free savings', value: 1000 },
      ],
      tips: [
        { emoji: '📅', text: 'Review budget every payday' },
        { emoji: '🤝', text: 'Family support needs boundaries too' },
        { emoji: '🚗', text: 'Carpool 2×/week = Save R800/month' },
        { emoji: '💡', text: 'Small consistent savings beat big irregular ones' },
      ]
    }
  };

  const theme = themes[userType];
  const [achievements, setAchievements] = useState(theme.achievements);
  const progressPercentage = Math.min(100, (savedAmount / goalAmount) * 100);

  const addAchievement = () => {
    const newAchievement = {
      id: achievements.length + 1,
      title: 'New milestone!',
      emoji: userType === 'professional' ? '🏆' : '🎉',
      date: new Date().toISOString().split('T')[0],
      completed: true
    };
    setAchievements([newAchievement, ...achievements]);
  };

  const markAsComplete = (id) => {
    setAchievements(achievements.map(achievement => 
      achievement.id === id ? { ...achievement, completed: true } : achievement
    ));
  };

  // Add professional icons
  const getIconForProfessional = (achievement) => {
    const iconMap = {
      'budget': <FaChartLine />,
      'emergency': <FaGem />,
      'family': <FaStar />,
      'car': <FaMedal />,
      'streak': <FaFire />,
      'default': <FaAward />
    };
    
    if (achievement.title.includes('budget')) return iconMap.budget;
    if (achievement.title.includes('emergency')) return iconMap.emergency;
    if (achievement.title.includes('family')) return iconMap.family;
    if (achievement.title.includes('car')) return iconMap.car;
    if (achievement.title.includes('streak')) return iconMap.streak;
    return iconMap.default;
  };

  return (
    <div 
      className="progress-celebrations"
      style={{
        background: theme.bgColor,
        border: `2px solid ${theme.color}20`,
        borderRadius: '15px',
        padding: '25px',
        margin: '20px 0'
      }}
    >
      {/* Header with user-specific title */}
      <div className="celebrations-header" style={{ marginBottom: '25px' }}>
        <h2 style={{ 
          color: theme.color, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '1.8rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>{theme.icon}</span>
          {theme.title}
        </h2>
        <p style={{ color: '#666', marginTop: '5px' }}>
          {userType === 'professional' 
            ? 'Celebrate your financial progress, no matter how small' 
            : 'Track and celebrate your money wins!'}
        </p>
      </div>

      {/* Progress Bar - Professional has higher default goals */}
      <div className="progress-section">
        <h3 style={{ color: theme.color, marginBottom: '15px' }}>
          {userType === 'professional' ? '🏆 Savings Goal Tracker' : '🎯 Your Savings Goal'}
        </h3>
        <div className="progress-goal">
          <div className="goal-inputs" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="goal-input">
              <label style={{ display: 'block', color: '#555', marginBottom: '5px' }}>
                Saved so far
              </label>
              <div className="amount-input" style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  background: theme.color, 
                  color: 'white', 
                  padding: '10px', 
                  borderTopLeftRadius: '8px', 
                  borderBottomLeftRadius: '8px',
                  fontWeight: 'bold'
                }}>
                  R
                </span>
                <input
                  type="number"
                  value={savedAmount}
                  onChange={(e) => setSavedAmount(Number(e.target.value))}
                  min="0"
                  max={userType === 'professional' ? '50000' : '10000'}
                  style={{
                    padding: '10px',
                    border: `2px solid ${theme.color}40`,
                    borderLeft: 'none',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    width: '100%',
                    fontSize: '1.1rem'
                  }}
                />
              </div>
            </div>
            <div className="goal-input">
              <label style={{ display: 'block', color: '#555', marginBottom: '5px' }}>
                Goal amount
              </label>
              <div className="amount-input" style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  background: theme.color, 
                  color: 'white', 
                  padding: '10px', 
                  borderTopLeftRadius: '8px', 
                  borderBottomLeftRadius: '8px',
                  fontWeight: 'bold'
                }}>
                  R
                </span>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  min="1"
                  max={userType === 'professional' ? '100000' : '10000'}
                  style={{
                    padding: '10px',
                    border: `2px solid ${theme.color}40`,
                    borderLeft: 'none',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    width: '100%',
                    fontSize: '1.1rem'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-bar-container" style={{
            height: '25px',
            background: '#e0e0e0',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${progressPercentage}%`, 
                height: '100%',
                background: theme.color,
                transition: 'width 0.5s ease'
              }}
            ></div>
          </div>
          
          <div className="progress-text" style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#555',
            fontWeight: '500'
          }}>
            <span>R{savedAmount.toLocaleString()} saved</span>
            <span style={{ color: theme.color, fontWeight: '700', fontSize: '1.1rem' }}>
              {progressPercentage.toFixed(0)}%
            </span>
            <span>Goal: R{goalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Achievement Buttons */}
      <div className="quick-achievements" style={{ margin: '30px 0' }}>
        <h3 style={{ color: theme.color, marginBottom: '15px' }}>
          {userType === 'professional' ? '💼 Quick Financial Wins' : '🎯 Quick Milestones'}
        </h3>
        <div className="quick-achievement-buttons" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginTop: '15px'
        }}>
          {theme.quickAchievements.map((achievement, index) => (
            <button
              key={index}
              className="quick-achievement-btn"
              onClick={() => {
                setSavedAmount(achievement.value);
                if (savedAmount >= achievement.value && !achievements.find(a => a.title.includes(achievement.title))) {
                  addAchievement();
                }
              }}
              style={{
                background: 'white',
                border: `2px solid ${theme.color}40`,
                borderRadius: '10px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 5px 15px ${theme.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="achievement-emoji" style={{ fontSize: '1.8rem' }}>
                {achievement.emoji}
              </span>
              <span className="achievement-text" style={{ 
                color: '#333', 
                fontWeight: '600',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                {achievement.title}
              </span>
              <span style={{ 
                color: theme.color, 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                R{achievement.value.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-section">
        <div className="achievements-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: theme.color }}>
            {userType === 'professional' ? '🏆 Financial Milestones' : '🏆 Your Achievements'}
          </h3>
          <button 
            className="add-achievement-btn"
            onClick={addAchievement}
            style={{
              background: theme.color,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            + Add Custom Achievement
          </button>
        </div>
        
        <div className="achievements-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.completed ? 'completed' : 'pending'}`}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                borderLeft: `5px solid ${achievement.completed ? theme.color : '#ccc'}`,
                boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
              }}
            >
              <div className="achievement-icon" style={{ fontSize: '2rem' }}>
                {userType === 'professional' ? getIconForProfessional(achievement) : achievement.emoji}
              </div>
              
              <div className="achievement-content" style={{ flex: 1 }}>
                <strong style={{ 
                  color: achievement.completed ? '#333' : '#666',
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '1.1rem'
                }}>
                  {achievement.title}
                </strong>
                <span className="achievement-date" style={{ 
                  color: '#888', 
                  fontSize: '0.85rem' 
                }}>
                  {achievement.date}
                </span>
              </div>
              
              <div className="achievement-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {!achievement.completed && (
                  <button 
                    className="complete-btn"
                    onClick={() => markAsComplete(achievement.id)}
                    style={{
                      background: theme.color,
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    Mark Complete
                  </button>
                )}
                <div className="achievement-status" style={{ fontSize: '1.2rem' }}>
                  {achievement.completed ? '✅' : '⏳'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="progress-tips" style={{ marginTop: '30px' }}>
        <h3 style={{ color: theme.color, marginBottom: '15px' }}>
          {userType === 'professional' ? '💡 Professional Money Tips' : '💡 Quick Wins'}
        </h3>
        <div className="tip-list" style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px'
        }}>
          {theme.tips.map((tip, index) => (
            <div 
              key={index} 
              className="tip-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '12px 0',
                borderBottom: index < theme.tips.length - 1 ? '1px solid #eee' : 'none'
              }}
            >
              <span className="tip-emoji" style={{ fontSize: '1.5rem' }}>
                {tip.emoji}
              </span>
              <span style={{ color: '#555', fontSize: '0.95rem' }}>
                {tip.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Celebration Message */}
      {progressPercentage >= 100 && (
        <div className="celebration-message" style={{
          background: `linear-gradient(135deg, ${theme.color}20, ${theme.color}10)`,
          border: `2px dashed ${theme.color}`,
          borderRadius: '12px',
          padding: '20px',
          marginTop: '25px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: theme.color, marginBottom: '10px' }}>
            🎉 {userType === 'professional' ? 'Month-End Master!' : 'Goal Achieved!'}
          </h3>
          <p style={{ color: '#555' }}>
            {userType === 'professional' 
              ? 'You\'ve mastered your monthly budget! Time to set a new financial goal.' 
              : 'Congratulations! You reached your savings goal. Set a new one to keep growing!'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProgressCelebrations;