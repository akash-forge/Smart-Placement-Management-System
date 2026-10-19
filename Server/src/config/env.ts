// Central place for secrets/config that were previously hardcoded directly
// inside controllers (e.g. `const JWT_SECRET = 'your-secret-key'` in
// userController.ts).

if (!process.env.JWT_SECRET) {
  // Don't crash local dev if a .env is missing, but make it impossible to
  // miss — a hardcoded fallback secret in production is a real
  // vulnerability (anyone can forge a valid token for any user/role).
  console.warn(
    '[WARN] JWT_SECRET is not set in the environment. Falling back to an ' +
      'insecure default — DO NOT deploy like this. Add JWT_SECRET to your .env file.'
  );
}

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
