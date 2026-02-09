// frontend/src/utils/userTypeDetector.js

/**
 * User type detection and management for personalized experience
 * Works with emailValidator.js to provide smart user classification
 */

import { validateEmailForPlatform } from './emailValidator';

/**
 * Detects user type from available user data
 * @param {Object} userData - User data object
 * @param {string} userData.email - User's email
 * @param {string} userData.university - User's university (if provided)
 * @param {string} userData.profession - User's profession (if provided)
 * @param {string} userData.userType - Explicit user type (if set)
 * @returns {Object} Detection result with type, confidence, and source
 */
export const detectUserType = (userData) => {
  const { email, university, profession, userType: explicitType } = userData || {};
  
  // Priority 1: Explicit user type set by user
  if (explicitType && ['student', 'professional', 'learner'].includes(explicitType)) {
    return {
      type: explicitType,
      confidence: 'high',
      source: 'explicit',
      message: `User explicitly selected: ${explicitType}`
    };
  }
  
  // Priority 2: University field indicates student
  if (university && university.trim()) {
    return {
      type: 'student',
      confidence: 'high',
      source: 'university-field',
      institution: university,
      message: `Student at ${university}`
    };
  }
  
  // Priority 3: Profession field indicates professional
  if (profession && profession.trim()) {
    return {
      type: 'professional',
      confidence: 'medium',
      source: 'profession-field',
      profession: profession,
      message: `Professional: ${profession}`
    };
  }
  
  // Priority 4: Email-based detection
  if (email && email.trim()) {
    try {
      const emailValidation = validateEmailForPlatform(email);
      
      if (emailValidation.userType && emailValidation.userType !== 'general') {
        return {
          type: emailValidation.userType,
          confidence: emailValidation.isEducational ? 'high' : 'medium',
          source: 'email-domain',
          institution: emailValidation.institution,
          isEducational: emailValidation.isEducational,
          isProfessional: emailValidation.isProfessional,
          isPersonal: emailValidation.isPersonal,
          message: emailValidation.message
        };
      }
    } catch (error) {
      console.warn('Error in email validation for user detection:', error);
    }
  }
  
  // Priority 5: Default to learner
  return {
    type: 'learner',
    confidence: 'low',
    source: 'default',
    message: 'General learner (default)'
  };
};

/**
 * Gets personalized greeting based on user type
 * @param {string} userType - User type: 'student', 'professional', or 'learner'
 * @param {string} userName - User's name (optional)
 * @returns {string} Personalized greeting message
 */
export const getUserTypeGreeting = (userType, userName = '') => {
  const name = userName || 'there';
  const greetings = {
    student: `🎓 Welcome back, ${name}! Ready to ace your studies today?`,
    professional: `💼 Welcome, ${name}! Let's advance your career.`,
    learner: `👋 Welcome, ${name}! Ready to learn something new?`
  };
  
  return greetings[userType] || greetings.learner;
};

/**
 * Gets features available for specific user type
 * @param {string} userType - User type
 * @returns {Object} Features, discounts, and limitations
 */
export const getUserTypeFeatures = (userType) => {
  const features = {
    student: {
      primary: [
        '🎓 CrunchTime Tutoring with 20% student discount',
        '📚 Assignment Help & Study Groups',
        '📝 CV Reviews & Career Guidance'
      ],
      secondary: [
        '👥 Student Community Access',
        '📅 Exam Preparation Sessions',
        '💼 Internship Opportunities'
      ],
      discounts: ['20% off all tutoring sessions', 'Free CV reviews'],
      limitations: ['Limited to 5 sessions/month on free tier'],
      icon: '🎓',
      color: '#3B82F6' // Blue for students
    },
    professional: {
      primary: [
        '💼 Advanced CV Builder & Tailoring',
        '🤝 Professional Networking',
        '🎯 Career Coaching & Mentorship'
      ],
      secondary: [
        '📈 Industry Insights & Trends',
        '👔 Interview Preparation',
        '🌐 Business Networking Events'
      ],
      discounts: ['Corporate rates available', 'Bulk session discounts'],
      limitations: ['Premium features unlocked at higher tiers'],
      icon: '💼',
      color: '#10B981' // Green for professionals
    },
    learner: {
      primary: [
        '📖 CrunchTime Tutoring (standard rates)',
        '📝 Basic CV Builder',
        '🎯 Skill Development Courses'
      ],
      secondary: [
        '🔔 Learning Reminders',
        '📊 Progress Tracking',
        '💡 Learning Recommendations'
      ],
      discounts: ['Standard pricing applies'],
      limitations: ['All basic features available'],
      icon: '👤',
      color: '#F59E0B' // Amber for general learners
    }
  };
  
  return features[userType] || features.learner;
};

/**
 * Gets appropriate icon for user type
 * @param {string} userType - User type
 * @returns {string} Emoji icon
 */
export const getUserTypeIcon = (userType) => {
  const icons = {
    student: '🎓',
    professional: '💼',
    learner: '👤'
  };
  return icons[userType] || '👤';
};

/**
 * Gets color scheme for user type (for UI theming)
 * @param {string} userType - User type
 * @returns {Object} Color scheme with primary, secondary, and accent colors
 */
export const getUserTypeColors = (userType) => {
  const colorSchemes = {
    student: {
      primary: '#3B82F6',    // Blue
      secondary: '#60A5FA',   // Light Blue
      accent: '#1D4ED8',      // Dark Blue
      background: '#DBEAFE',  // Very Light Blue
      text: '#1E3A8A'         // Dark Blue Text
    },
    professional: {
      primary: '#10B981',     // Green
      secondary: '#34D399',   // Light Green
      accent: '#047857',      // Dark Green
      background: '#D1FAE5',  // Very Light Green
      text: '#064E3B'         // Dark Green Text
    },
    learner: {
      primary: '#F59E0B',     // Amber
      secondary: '#FBBF24',   // Light Amber
      accent: '#D97706',      // Dark Amber
      background: '#FEF3C7',  // Very Light Amber
      text: '#78350F'         // Dark Amber Text
    }
  };
  
  return colorSchemes[userType] || colorSchemes.learner;
};

/**
 * Suggests user type based on registration data
 * @param {Object} registrationData - User registration data
 * @returns {Object} Suggestion with recommended type and reason
 */
export const suggestUserType = (registrationData) => {
  const { email, university, profession } = registrationData || {};
  
  if (university && university.trim()) {
    return {
      recommendedType: 'student',
      reason: `You mentioned studying at ${university}`,
      confidence: 'high'
    };
  }
  
  if (profession && profession.trim()) {
    return {
      recommendedType: 'professional',
      reason: `You listed your profession as ${profession}`,
      confidence: 'medium'
    };
  }
  
  if (email && email.trim()) {
    try {
      const emailValidation = validateEmailForPlatform(email);
      if (emailValidation.userType && emailValidation.userType !== 'general') {
        return {
          recommendedType: emailValidation.userType,
          reason: emailValidation.message,
          confidence: emailValidation.isEducational ? 'high' : 'medium'
        };
      }
    } catch (error) {
      console.warn('Error in email validation for suggestion:', error);
    }
  }
  
  return {
    recommendedType: 'learner',
    reason: 'General learning account',
    confidence: 'low'
  };
};

/**
 * Checks if user qualifies for student benefits
 * @param {Object} userData - User data
 * @returns {boolean} True if qualifies for student benefits
 */
export const qualifiesForStudentBenefits = (userData) => {
  const detection = detectUserType(userData);
  return detection.type === 'student' && detection.confidence === 'high';
};

/**
 * Gets onboarding tips based on user type
 * @param {string} userType - User type
 * @returns {Array} List of onboarding tips
 */
export const getOnboardingTips = (userType) => {
  const tips = {
    student: [
      'Complete your profile with your university and course details',
      'Explore tutoring sessions in your subject areas',
      'Join study groups related to your courses',
      'Set up exam reminders for upcoming tests'
    ],
    professional: [
      'Upload your CV for professional tailoring',
      'Connect with mentors in your industry',
      'Set career goals and track your progress',
      'Explore networking events and webinars'
    ],
    learner: [
      'Browse available courses and tutoring sessions',
      'Set learning goals for skill development',
      'Explore different subject areas of interest',
      'Connect with other learners for study groups'
    ]
  };
  
  return tips[userType] || tips.learner;
};