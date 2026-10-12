export type User = { id: string; username: string; email: string };

/** What register and login answer with: the user and the token pair. */
export type Session = { user: User; access: string; refresh: string };

export type Credentials = { email: string; password: string };

/** One field error as the backend sends it: a message and a stable code the web app translates. */
export type FieldError = { message: string; code: string };
export type FieldErrors = Partial<Record<'email' | 'password' | 'non_field_errors', FieldError[]>>;
