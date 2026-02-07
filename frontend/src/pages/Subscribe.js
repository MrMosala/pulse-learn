// frontend/src/pages/Subscribe.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function Subscribe() {
  const { userProfile } = useAuth();
  const [selectedPlan] = useState('gold');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      color: '#6B7280',
      icon: '🎯',
      tagline: 'Get started with basic features',
      badge: 'CURRENT PLAN',
      features: [
        { text: 'Access to free courses', included: true },
        { text: '1 CV review per month', included: true },
        { text: 'Basic budget tracker', included: true },
        { text: 'Community forum access', included: true },
        { text: 'Limited assignment uploads (2/month)', included: false },
        { text: 'Priority support', included: false },
        { text: 'Video lessons', included: false },
        { text: '1-on-1 tutoring', included: false },
        { text: 'Financial coaching', included: false }
      ]
    },
    gold: {
      name: 'Gold',
      price: { monthly: 149, yearly: 1499 },
      color: '#F59E0B',
      icon: '👑',
      tagline: 'Most popular for students',
      badge: 'POPULAR',
      features: [
        { text: 'All video lessons', included: true },
        { text: '3 CV reviews per month', included: true },
        { text: 'Advanced budget planner', included: true },
        { text: 'Meal planning features', included: true },
        { text: '5 assignment uploads/month', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Interview preparation guide', included: false },
        { text: 'Unlimited tutoring sessions', included: false },
        { text: 'LinkedIn optimization', included: false }
      ]
    },
    platinum: {
      name: 'Platinum',
      price: { monthly: 299, yearly: 2999 },
      color: '#8B5CF6',
      icon: '💎',
      tagline: 'Complete success package',
      badge: 'PREMIUM',
      features: [
        { text: 'Everything in Gold', included: true },
        { text: 'Unlimited CV reviews', included: true },
        { text: '1-on-1 financial coaching', included: true },
        { text: 'Personalized interview prep', included: true },
        { text: 'LinkedIn profile optimization', included: true },
        { text: 'Unlimited assignment uploads', included: true },
        { text: '2 hours live tutoring/month', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Career mentorship sessions', included: true }
      ]
    }
  };

  const currentPlan = userProfile?.subscriptionTier || 'free';
  const currentPlanData = plans[currentPlan];

  const handleSubscribe = async (plan) => {
    setIsProcessing(true);
    try {
      // In a real app, this would integrate with Stripe or another payment processor
      console.log(`Subscribing to ${plan} plan, ${billingCycle} billing`);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      alert(`🎉 Successfully subscribed to ${plans[plan].name} plan!`);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Subscription error:', error);
      alert('❌ Error processing subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSavings = (plan) => {
    const monthly = plans[plan].price.monthly * 12;
    const yearly = plans[plan].price.yearly;
    return Math.round(((monthly - yearly) / monthly) * 100);
  };

  return (
    <DashboardLayout>
      <div className="subscribe-page-content">
        {/* Page Header */}
        <div className="subscribe-header">
          <h1>✨ Upgrade Your Success</h1>
          <p className="subtitle">Choose the perfect plan for your academic and career journey</p>
          <div className="current-plan-banner">
            <div className="current-plan-info">
              <span className="current-label">Current Plan:</span>
              <span className="current-plan-name" style={{ color: currentPlanData.color }}>
                {currentPlanData.icon} {currentPlanData.name.toUpperCase()}
              </span>
            </div>
            {currentPlan !== 'platinum' && (
              <a href="#compare" className="upgrade-link">
                ⚡ Upgrade for more features
              </a>
            )}
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="billing-toggle-section">
          <div className="billing-toggle">
            <button
              className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`toggle-option ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="savings-badge">Save up to 16%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="plans-grid">
          {Object.entries(plans).map(([key, plan]) => (
            <div 
              key={key}
              className={`plan-card ${key === selectedPlan ? 'selected' : ''} ${key === currentPlan ? 'current' : ''}`}
              style={{ borderColor: plan.color }}
            >
              {plan.badge && (
                <div className="plan-badge" style={{ backgroundColor: plan.color }}>
                  {plan.badge}
                </div>
              )}
              
              <div className="plan-header">
                <div className="plan-icon" style={{ color: plan.color }}>
                  {plan.icon}
                </div>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-tagline">{plan.tagline}</p>
              </div>

              <div className="plan-pricing">
                <div className="price-display">
                  <span className="currency">R</span>
                  <span className="price">
                    {billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="period">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <div className="yearly-savings">
                    Save {getSavings(key)}% vs monthly
                  </div>
                )}
                {billingCycle === 'monthly' && plan.price.monthly > 0 && (
                  <div className="equivalent">
                    ≈ R{Math.round(plan.price.monthly / 4)} per week
                  </div>
                )}
              </div>

              <div className="plan-features">
                <h4>What's included:</h4>
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index} className={feature.included ? 'included' : 'excluded'}>
                      <span className="feature-icon">
                        {feature.included ? '✅' : '❌'}
                      </span>
                      <span className="feature-text">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-actions">
                {key === currentPlan ? (
                  <button className="current-plan-btn" disabled>
                    ⭐ Current Plan
                  </button>
                ) : (
                  <button
                    className={`subscribe-btn ${isProcessing ? 'processing' : ''}`}
                    onClick={() => handleSubscribe(key)}
                    disabled={isProcessing}
                    style={{ backgroundColor: plan.color }}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-small"></span>
                        Processing...
                      </>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}
                {key !== 'free' && (
                  <button className="details-btn">
                    📋 View full details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div id="compare" className="comparison-section">
          <h2>📊 Plan Comparison</h2>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Gold</th>
                  <th>Platinum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Video Lessons</td>
                  <td>Limited</td>
                  <td>✅ All Access</td>
                  <td>✅ All Access</td>
                </tr>
                <tr>
                  <td>CV Reviews/Month</td>
                  <td>1</td>
                  <td>3</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Assignment Uploads</td>
                  <td>2/month</td>
                  <td>5/month</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Budget Planner</td>
                  <td>Basic</td>
                  <td>Advanced</td>
                  <td>Advanced + Coaching</td>
                </tr>
                <tr>
                  <td>Tutoring Hours</td>
                  <td>-</td>
                  <td>-</td>
                  <td>2h/month</td>
                </tr>
                <tr>
                  <td>Priority Support</td>
                  <td>-</td>
                  <td>Email</td>
                  <td>24/7 Chat & Email</td>
                </tr>
                <tr>
                  <td>Career Mentorship</td>
                  <td>-</td>
                  <td>-</td>
                  <td>✅ Included</td>
                </tr>
                <tr>
                  <td>Interview Prep</td>
                  <td>-</td>
                  <td>Guide</td>
                  <td>1-on-1 Sessions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>❓ Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Can I change plans later?</h3>
              <p>Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately.</p>
            </div>
            <div className="faq-item">
              <h3>Is there a free trial?</h3>
              <p>All paid plans come with a 7-day free trial. No credit card required to start the trial.</p>
            </div>
            <div className="faq-item">
              <h3>How are assignments handled?</h3>
              <p>Our expert tutors review each submission and provide detailed solutions and explanations within your chosen timeframe.</p>
            </div>
            <div className="faq-item">
              <h3>Can I get a refund?</h3>
              <p>We offer a 30-day money-back guarantee for all annual subscriptions if you're not satisfied.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept credit/debit cards, PayPal, and bank transfers for South African students.</p>
            </div>
            <div className="faq-item">
              <h3>Is my data secure?</h3>
              <p>Yes! All your data is encrypted and secure. We never share your personal information with third parties.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-card">
            <h2>🚀 Ready to accelerate your success?</h2>
            <p>Join thousands of students who have transformed their academic and career journeys with Pulse Learn.</p>
            <div className="cta-stats">
              <div className="stat">
                <div className="stat-number">4.8</div>
                <div className="stat-label">Average Rating</div>
              </div>
              <div className="stat">
                <div className="stat-number">2,500+</div>
                <div className="stat-label">Students Helped</div>
              </div>
              <div className="stat">
                <div className="stat-number">98%</div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
            </div>
            <button className="cta-button" onClick={() => handleSubscribe('gold')}>
              ⚡ Start Your 7-Day Free Trial
            </button>
            <p className="cta-note">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Subscribe;