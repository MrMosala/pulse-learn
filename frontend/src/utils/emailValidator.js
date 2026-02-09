// frontend/src/utils/emailValidator.js

// South African universities database
const SA_UNIVERSITIES = [
  {
    name: 'University of Cape Town',
    domains: ['uct.ac.za', 'myuct.ac.za'],
    alias: 'UCT'
  },
  {
    name: 'University of Pretoria',
    domains: ['up.ac.za'],
    alias: 'Tuks'
  },
  {
    name: 'University of the Witwatersrand',
    domains: ['wits.ac.za'],
    alias: 'Wits'
  },
  {
    name: 'Stellenbosch University',
    domains: ['sun.ac.za'],
    alias: 'Maties'
  },
  {
    name: 'University of Johannesburg',
    domains: ['uj.ac.za'],
    alias: 'UJ'
  },
  {
    name: 'Rhodes University',
    domains: ['ru.ac.za'],
    alias: 'Rhodes'
  },
  {
    name: 'University of the Western Cape',
    domains: ['uwc.ac.za'],
    alias: 'UWC'
  },
  {
    name: 'North-West University',
    domains: ['nwu.ac.za'],
    alias: 'NWU'
  },
  {
    name: 'University of Limpopo',
    domains: ['ul.ac.za'],
    alias: 'UL'
  },
  {
    name: 'University of Fort Hare',
    domains: ['ufh.ac.za'],
    alias: 'Fort Hare'
  },
  {
    name: 'University of Venda',
    domains: ['univen.ac.za'],
    alias: 'UNIVEN'
  },
  {
    name: 'Walter Sisulu University',
    domains: ['wsu.ac.za'],
    alias: 'WSU'
  },
  {
    name: 'Durban University of Technology',
    domains: ['dut.ac.za'],
    alias: 'DUT'
  },
  {
    name: 'Tshwane University of Technology',
    domains: ['tut.ac.za'],
    alias: 'TUT'
  },
  {
    name: 'University of Zululand',
    domains: ['unizulu.ac.za'],
    alias: 'UniZulu'
  },
  {
    name: 'Nelson Mandela University',
    domains: ['mandela.ac.za'],
    alias: 'NMU'
  },
  {
    name: 'Cape Peninsula University of Technology',
    domains: ['cput.ac.za'],
    alias: 'CPUT'
  },
  {
    name: 'University of the Free State',
    domains: ['ufs.ac.za'],
    alias: 'UFS'
  },
  {
    name: 'University of South Africa',
    domains: ['unisa.ac.za', 'mylife.unisa.ac.za'],
    alias: 'UNISA'
  }
];

// Common corporate email domains
const CORPORATE_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com'
];

// Professional/corporate domains
const PROFESSIONAL_DOMAINS = [
  'co.za',
  'co.za', // South African companies
  'org.za',
  'gov.za', // Government
  'nic.za'
];

export const validateEmailForPlatform = (email, userType = 'auto') => {
  const validation = {
    isValid: false,
    message: '',
    userType: 'learner',
    category: 'general',
    isEducational: false,
    isProfessional: false,
    institution: null,
    warnings: [],
    suggestions: []
  };

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    validation.message = 'Invalid email format';
    return validation;
  }

  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1];
  const warnings = [];

  // Check for South African university
  const university = SA_UNIVERSITIES.find(uni => 
    uni.domains.some(uniDomain => domain.endsWith(uniDomain))
  );

  if (university) {
    validation.isValid = true;
    validation.isEducational = true;
    validation.institution = university.name;
    validation.userType = 'student';
    validation.category = 'student';
    validation.message = `✅ Valid ${university.alias || university.name} student email`;
  } 
  // Check for general .ac.za educational domain
  else if (domain.endsWith('.ac.za')) {
    validation.isValid = true;
    validation.isEducational = true;
    validation.institution = 'South African Educational Institution';
    validation.userType = 'student';
    validation.category = 'student';
    validation.message = '✅ Valid South African educational email';
  }
  // Check for corporate/professional domains
  else if (PROFESSIONAL_DOMAINS.some(proDomain => domain.endsWith(proDomain))) {
    validation.isValid = true;
    validation.isProfessional = true;
    validation.userType = 'professional';
    validation.category = 'professional';
    validation.message = '✅ Valid professional email';
  }
  // Check for common personal domains
  else if (CORPORATE_DOMAINS.includes(domain)) {
    validation.isValid = true;
    validation.userType = 'learner';
    validation.category = 'general';
    validation.message = '✅ Valid email (personal account)';
  }
  // International domains
  else if (domain.includes('.edu.') || domain.endsWith('.edu')) {
    validation.isValid = true;
    validation.isEducational = true;
    validation.institution = 'International Educational Institution';
    validation.userType = 'student';
    validation.category = 'student';
    validation.message = '✅ Valid international educational email';
  }
  // Other corporate domains
  else if (domain.includes('.com') || domain.includes('.org') || domain.includes('.net')) {
    validation.isValid = true;
    validation.isProfessional = true;
    validation.userType = 'professional';
    validation.category = 'professional';
    validation.message = '✅ Valid professional/corporate email';
  }
  // Fallback - any valid email
  else {
    validation.isValid = true;
    validation.userType = 'learner';
    validation.category = 'general';
    validation.message = '✅ Valid email';
  }

  // Determine detected user type based on email characteristics
  const detectedUserType = validation.userType;

  // Check: If user selected student but email is not educational
  if (userType === 'student' && !validation.isEducational) {
    warnings.push('Selected "Student" but email is not from educational institution');
  }

  // Check: If user selected professional but email is not professional
  if (userType === 'professional' && !validation.isProfessional) {
    warnings.push('Selected "Professional" but email is not from corporate domain');
  }

  // Adjust user type based on selection vs auto-detection with proper parentheses
  if (userType === 'auto') {
    validation.userType = detectedUserType;
  } else if ((userType === 'student' && validation.isEducational) || 
             (userType === 'professional' && validation.isProfessional)) {
    // Only use selected type if it matches email domain characteristics
    validation.userType = userType;
  } else if ((userType === 'learner' && !validation.isEducational && !validation.isProfessional) ||
             userType === 'learner') {
    validation.userType = 'learner';
  } else {
    validation.userType = detectedUserType;
    warnings.push(`Selected "${userType}" but email domain suggests "${detectedUserType}"`);
  }

  // Add warnings if any
  validation.warnings = warnings;

  // Add suggestions
  if (validation.isEducational && userType !== 'student') {
    validation.suggestions.push('Consider selecting "Student" as your user type');
  } else if (validation.isProfessional && userType !== 'professional') {
    validation.suggestions.push('Consider selecting "Professional" as your user type');
  }

  return validation;
};

// Helper function to extract institution from email
export const extractInstitutionFromEmail = (email) => {
  if (!email) return null;
  
  const domain = email.toLowerCase().split('@')[1];
  const university = SA_UNIVERSITIES.find(uni => 
    uni.domains.some(uniDomain => domain.endsWith(uniDomain))
  );
  
  return university ? university.name : null;
};

// Check if email is from South African educational institution
export const isSouthAfricanEducationalEmail = (email) => {
  if (!email) return false;
  const domain = email.toLowerCase().split('@')[1];
  return domain.endsWith('.ac.za') || 
         SA_UNIVERSITIES.some(uni => 
           uni.domains.some(uniDomain => domain.endsWith(uniDomain))
         );
};