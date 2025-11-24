// utils/hash.util.ts
import * as bcrypt from 'bcrypt';

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, encryptedPassword: string) {
  return bcrypt.compare(password, encryptedPassword);
}
