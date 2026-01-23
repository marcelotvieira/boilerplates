import bcrypt from 'bcryptjs'
import { injectable } from 'inversify'
import { config } from '../../config/env.config.js'

export interface PasswordHasher {
  hash(password: string): Promise<string>
  compare(password: string, hashedPassword: string): Promise<boolean>
}

@injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = config.BCRYPT_ROUNDS

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}
