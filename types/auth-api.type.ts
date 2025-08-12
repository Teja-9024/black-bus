// types/auth-api.type.ts
import { AuthSession } from './auth-session.type';

export interface ILoginResponse {
  message: string;
  tokens: AuthSession;
  theme?: string;
  user?: {
    id: string;
    email: string;
    role: "owner" | "worker";
    name: string;
    createdAt: string;
  };
}

export interface IRegisterResponse {
  message: string;
}

export interface IVerifyEmailResponse {
  message: string;
  tokens: AuthSession;
  theme?: string;
}

export interface IForgotPasswordResponse {
  message: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export interface IUpdateThemeResponse {
  message: string;
  newTheme: string;
}