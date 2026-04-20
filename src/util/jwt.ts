export interface IJwtPayload {
  sub?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

export function decodeJwt(token: string | null): IJwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = decodeJwt(token);
    if (!payload) return true;
    if (payload.exp) {
      return payload.exp * 1000 > Date.now();
    }
    return true;
  } catch {
    return true;
  }
}

export function getTokenExpirationTime(token: string | null): number | null {
  const payload = decodeJwt(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}