// frontend/src/utils/meetingValidator.js

/**
 * Validates meeting links for various platforms
 * @param {string} url - The meeting link to validate
 * @returns {Object} Validation result with isValid, message, and platform
 */
export const validateMeetingLink = (url) => {
  // 1. Check if input exists
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      message: 'Meeting link is required',
      platform: 'unknown',
      category: 'missing'
    };
  }

  // 2. Trim and clean the URL
  const trimmedUrl = url.trim();
  
  if (trimmedUrl === '') {
    return {
      isValid: false,
      message: 'Meeting link cannot be empty',
      platform: 'unknown',
      category: 'empty'
    };
  }

  // 3. Check if it's a valid URL
  let urlObject;
  try {
    urlObject = new URL(trimmedUrl);
    
    // Ensure it's HTTPS for security
    if (urlObject.protocol !== 'https:') {
      return {
        isValid: false,
        message: 'Meeting links must use HTTPS for security',
        platform: 'unknown',
        category: 'security'
      };
    }
  } catch (error) {
    // If it's not a full URL, it might be just a meeting code
    // Check if it looks like a Google Meet code
    const meetCodePattern = /^[a-z]{3}-[a-z]{4}(-[a-z]{3})?$/i;
    if (meetCodePattern.test(trimmedUrl)) {
      // It's a Google Meet code, format it as a full URL
      return {
        isValid: true,
        message: 'Valid Google Meet code',
        platform: 'Google Meet',
        category: 'google-meet',
        formattedUrl: `https://meet.google.com/${trimmedUrl}`
      };
    }
    
    return {
      isValid: false,
      message: 'Invalid URL format. Please include https:// or use a valid meeting code',
      platform: 'unknown',
      category: 'format'
    };
  }

  const hostname = urlObject.hostname.toLowerCase();
  const fullUrl = urlObject.href;

  // 4. Google Meet validation
  if (hostname === 'meet.google.com') {
    const meetPattern = /meet\.google\.com\/([a-z]{3}-[a-z]{4}(-[a-z]{3})?)/i;
    if (meetPattern.test(fullUrl)) {
      return {
        isValid: true,
        message: 'Valid Google Meet link',
        platform: 'Google Meet',
        category: 'google-meet',
        formattedUrl: fullUrl
      };
    } else {
      return {
        isValid: false,
        message: 'Invalid Google Meet format. Expected: https://meet.google.com/abc-defg-hij',
        platform: 'Google Meet',
        category: 'google-meet-format'
      };
    }
  }

  // 5. Zoom validation
  if (hostname.includes('zoom.us') || hostname.includes('zoom.com')) {
    const zoomPatterns = [
      /zoom\.us\/j\/\d{9,11}/i,
      /zoom\.us\/wc\/join\/\d{9,11}/i,
      /zoom\.us\/meeting\/[a-zA-Z0-9._-]+/i,
      /zoom\.com\/j\/\d{9,11}/i
    ];

    const isValidZoom = zoomPatterns.some(pattern => pattern.test(fullUrl));
    
    if (isValidZoom) {
      return {
        isValid: true,
        message: 'Valid Zoom link',
        platform: 'Zoom',
        category: 'zoom',
        formattedUrl: fullUrl
      };
    } else {
      return {
        isValid: false,
        message: 'Invalid Zoom link format. Should contain meeting ID',
        platform: 'Zoom',
        category: 'zoom-format'
      };
    }
  }

  // 6. Microsoft Teams validation
  if (hostname.includes('teams.microsoft.com') || hostname.includes('teams.live.com')) {
    return {
      isValid: true,
      message: 'Valid Microsoft Teams link',
      platform: 'Microsoft Teams',
      category: 'teams',
      formattedUrl: fullUrl
    };
  }

  // 7. Generic validation for other platforms
  // Check if it looks like a meeting link (contains common meeting words)
  const meetingKeywords = ['meet', 'meeting', 'join', 'video', 'call', 'conference'];
  const hasMeetingKeyword = meetingKeywords.some(keyword => 
    fullUrl.toLowerCase().includes(keyword)
  );

  if (hasMeetingKeyword) {
    return {
      isValid: true,
      message: 'Valid meeting link',
      platform: 'Other',
      category: 'other',
      formattedUrl: fullUrl,
      warning: 'This is not a recognized platform. Please verify the link works.'
    };
  }

  // 8. Generic valid URL (not specifically a meeting link)
  return {
    isValid: true,
    message: 'Valid URL',
    platform: 'Generic',
    category: 'generic',
    formattedUrl: fullUrl,
    warning: 'This does not appear to be a standard meeting link. Please verify.'
  };
};

/**
 * Formats a meeting link for nice display
 * @param {string} link - The meeting link
 * @returns {Object} Display information with icon and text
 */
export const formatMeetingLinkForDisplay = (link) => {
  if (!link) {
    return {
      displayText: 'No meeting link',
      icon: '🔗',
      platform: 'Not set',
      color: '#6B7280' // gray
    };
  }

  const validation = validateMeetingLink(link);
  
  if (!validation.isValid) {
    return {
      displayText: 'Invalid link',
      icon: '❌',
      platform: 'Invalid',
      color: '#EF4444', // red
      warning: true
    };
  }

  // Platform-specific display settings
  const platformSettings = {
    'Google Meet': { icon: '🎥', color: '#00897B' }, // teal
    'Zoom': { icon: '📹', color: '#2D8CFF' }, // blue
    'Microsoft Teams': { icon: '💼', color: '#6264A7' }, // purple
    'Other': { icon: '🔗', color: '#F59E0B' }, // amber
    'Generic': { icon: '🔗', color: '#6B7280' } // gray
  };

  const settings = platformSettings[validation.platform] || platformSettings['Generic'];

  return {
    displayText: `${validation.platform} Meeting`,
    icon: settings.icon,
    platform: validation.platform,
    color: settings.color,
    category: validation.category,
    warning: validation.warning
  };
};

/**
 * Extracts meeting code from link
 * @param {string} link - The meeting link
 * @returns {string} The meeting code or empty string
 */
export const extractMeetingCode = (link) => {
  if (!link) return '';
  
  // Google Meet code
  const googleMeetMatch = link.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}(-[a-z]{3})?)/i);
  if (googleMeetMatch) return googleMeetMatch[1];
  
  // Zoom meeting ID
  const zoomMatch = link.match(/(?:\/j\/|\/wc\/join\/)(\d{9,11})/i);
  if (zoomMatch) return zoomMatch[1];
  
  // Teams meeting ID (simplified)
  const teamsMatch = link.match(/\/meetup-join\/([a-zA-Z0-9._-]+)/i);
  if (teamsMatch) return teamsMatch[1].substring(0, 12) + '...';
  
  return '';
};

/**
 * Generates a test/demo meeting link for development
 * @param {string} platform - Platform name ('google-meet', 'zoom', 'teams')
 * @returns {string} A demo meeting link
 */
export const generateDemoMeetingLink = (platform = 'google-meet') => {
  const generators = {
    'google-meet': () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      const randomChars = (length) => 
        Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return `https://meet.google.com/${randomChars(3)}-${randomChars(4)}-${randomChars(3)}`;
    },
    'zoom': () => {
      const meetingId = Math.floor(100000000 + Math.random() * 900000000);
      return `https://zoom.us/j/${meetingId}`;
    },
    'teams': () => {
      const randomId = Math.random().toString(36).substring(2, 15);
      return `https://teams.microsoft.com/l/meetup-join/19:${randomId}@thread.v2`;
    }
  };
  
  const generator = generators[platform] || generators['google-meet'];
  return generator();
};