export type EmailType = 'verification' | 'resetPassword';

export type EmailPayload = { email: string; token: string };
