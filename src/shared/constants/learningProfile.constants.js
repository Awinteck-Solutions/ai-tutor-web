export const EDUCATION_LEVELS = [
  { value: 'primary', label: 'Primary / elementary school' },
  { value: 'lower_secondary', label: 'Lower secondary / middle school' },
  { value: 'upper_secondary', label: 'Upper secondary / high school' },
  { value: 'undergraduate', label: 'Undergraduate / college' },
  { value: 'postgraduate', label: 'Postgraduate / graduate' },
  { value: 'professional', label: 'Professional / continuing education' },
  { value: 'other', label: 'Other' },
];

export const STUDENT_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to the topic — explain basics clearly' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some background — balanced depth and pace' },
  { value: 'advanced', label: 'Advanced', description: 'Strong foundation — deeper and more challenging' },
];

export const AGE_GROUPS = [
  { value: 'under_13', label: 'Under 13' },
  { value: '13_17', label: '13–17' },
  { value: '18_24', label: '18–24' },
  { value: '25_34', label: '25–34' },
  { value: '35_plus', label: '35+' },
  { value: 'prefer_not_say', label: 'Prefer not to say' },
];

export const LEARNING_GOALS = [
  { value: 'exam_preparation', label: 'Exam preparation' },
  { value: 'homework_help', label: 'Homework help' },
  { value: 'skill_building', label: 'Skill building' },
  { value: 'career_development', label: 'Career development' },
  { value: 'personal_interest', label: 'Personal interest' },
  { value: 'language_learning', label: 'Language learning' },
];

export const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'IE', label: 'Ireland' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'GH', label: 'Ghana' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'IN', label: 'India' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'PH', label: 'Philippines' },
  { value: 'SG', label: 'Singapore' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'CN', label: 'China' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'EG', label: 'Egypt' },
  { value: 'OTHER', label: 'Other' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'French', label: 'French' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Mandarin', label: 'Mandarin Chinese' },
  { value: 'Other', label: 'Other' },
];

export const getCountryLabel = (code) =>
  COUNTRIES.find((country) => country.value === code)?.label ?? code;
