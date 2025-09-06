// lib/utils/validation.ts

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // As per the error message "Password should be at least 6 characters"
  return password.length >= 6;
};

export const isValidUsername = (username: string): boolean => {
  // Example validation: 3-20 characters, alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const isValidDisplayName = (displayName: string): boolean => {
  // Example validation: 2-50 characters
  return displayName.length >= 2 && displayName.length <= 50;
};

export const getPostLoginRedirectPath = (returnTo?: string | string[]): string => {
  if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
    return returnTo;
  }
  return '/';
};
