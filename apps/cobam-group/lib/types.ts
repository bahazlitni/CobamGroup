export type {
  StaffSession as StaffAuthUser,
  StaffSessionResponse as StaffMeResponse,
} from "@/features/auth/types";

export type AuthMode = "login" | "signup";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type SignupFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type ForgotPasswordFormValues = {
  email: string;
};

export type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role?: string;
    portal: string;
  };
};

export type Size = "sm" | "md" | "lg" | "xl" | "2xl";

export function sizeToInt(type: string, size: Size): number {
  switch (type) {
    case "Button":
      switch (size) {
        case "sm":
          return 12;
        case "md":
          return 16;
        case "lg":
          return 20;
        case "xl":
          return 24;
        case "2xl":
          return 32;
      }
    default:
      return 0;
  }
}
