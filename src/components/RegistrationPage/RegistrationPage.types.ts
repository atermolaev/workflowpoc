import type { UserRole } from '@/globals/types';

export type { UserRole };

export interface RegistrationFormData {
  login: string;
  password: string;
  role: UserRole;
}
