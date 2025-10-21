// utils/validators.ts

export const Validators = {
  // Email validation
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Password validation (min 6 chars, at least one letter and one number)
  password: (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
  },
  
  // Confirm password validation
  confirmPassword: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },
  
  // Required field validation
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },
  
  // Minimum length validation
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },
  
  // Maximum length validation
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },
  
  // Phone number validation (basic)
  phone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },
  
  // URL validation
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Number validation
  number: (value: string): boolean => {
    return !isNaN(Number(value)) && isFinite(Number(value));
  },
  
  // Date validation (YYYY-MM-DD)
  date: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  },
};

export default Validators;