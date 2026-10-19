import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  // Fail loudly at boot rather than silently signing/verifying tokens with
  // `undefined`, which would make every token "valid" against no secret.
  throw new Error('JWT_SECRET is not set. Add it to your .env file.');
}

export interface AuthPayload {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'STUDENT' | 'COMPANY';
}

// NOTE: params typed `any` here to match the rest of this codebase's
// existing convention (every controller already does this). Mixing a
// strictly-typed Express middleware (Request/Response/NextFunction) with
// loosely-typed controllers in the same router.get(mw1, mw2, controller)
// call trips up TS's overload resolution for RequestHandler[] — every
// handler in the chain needs a compatible return type (void vs Response),
// which is exactly the TS2769 error you hit. Using `any` sidesteps that
// entirely rather than requiring every controller to be rewritten.

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the
 * decoded payload to `req.user`. Rejects the request with 401 if the header
 * is missing or the token is invalid/expired.
 */
export const verifyToken = (req: any, res: any, next: any) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Reads and verifies the Authorization header if one is present, and
 * returns the decoded payload — or null if there's no header, or it's
 * invalid/expired. Never rejects the request.
 *
 * Used by createStudent/createStaff/createCompany, which must stay public
 * (self-registration has no account yet to authenticate with), but still
 * need to tell the difference between "a student registering themselves"
 * and "an Admin/Staff member adding one through the Add modal" — the
 * latter should be auto-verified, since a trusted role already vetted it.
 */
export const getOptionalUser = (req: any): AuthPayload | null => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(header.split(' ')[1], JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
};

/**
 * Use after verifyToken + requireRole(['ADMIN', 'STAFF']) on any route
 * where Staff is trusted to act on Students (verify/reject/delete). Passes
 * Admin through untouched; for Staff, checks that their OWN account is
 * actually VERIFIED before letting the request through.
 *
 * Previously requireRole(['ADMIN', 'STAFF']) alone only checked that the
 * caller's *role* was Staff — not that an Admin had actually approved that
 * Staff account yet. A brand-new, still-Pending Staff signup could log in
 * and immediately start approving/rejecting/deleting students, which
 * defeats the entire point of Admin having to verify Staff first.
 */
export const requireVerifiedIfStaff = async (req: any, res: any, next: any) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  if (req.user.role !== 'STAFF') {
    next();
    return;
  }

  try {
    const staff = await prisma.staff.findUnique({ where: { userId: req.user.id } });
    if (staff?.verificationStatus !== 'VERIFIED') {
      res.status(403).json({ message: 'Your staff account must be verified by an admin before you can manage students.' });
      return;
    }
    next();
  } catch {
    res.status(500).json({ message: 'Failed to verify staff status' });
  }
};

/**
 * Use after verifyToken to restrict a route to specific roles, e.g.:
 *   router.delete('/:id', verifyToken, requireRole(['ADMIN']), deleteUserById);
 */
export const requireRole = (allowedRoles: AuthPayload['role'][]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
