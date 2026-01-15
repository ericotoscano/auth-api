export type EmailType = "verification" | "resetPassword";

export type EmailPayload = { email: string; token: string };

export type EmailTemplateParams = {
  title: string;
  intro: string;
  actionText: string;
  actionUrl: string;
  expiresInMinutes?: number;
  footerNote?: string;
};
