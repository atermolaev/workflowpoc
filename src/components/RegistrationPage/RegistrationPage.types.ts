export type UserRole = 'customer' | 'layout' | 'editor' | 'designer';

export interface RegistrationFormData {
  login: string;
  password: string;
  role: UserRole;
}
