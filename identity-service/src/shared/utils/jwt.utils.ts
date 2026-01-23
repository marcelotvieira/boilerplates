import { sign, verify } from 'jsonwebtoken'
import { createHash } from 'crypto'
import { config } from '../../config/env.config.js'

export interface TokenPayload {
  userId: string
  tenantId: string
  email: string
  role: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  refreshTokenHash: string
  refreshTokenExpiresAt: Date
}

export interface AuthSuccessResponse {
  user: {
    id: string
    email: string
    fullName: string
    role: string
    emailVerified: boolean
  }
  tenant: {
    id: string
    name: string
    status: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

export class JwtUtils {
  private static getJwtSecret(): string {
    const secret = config.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET not configured')
    }
    return secret
  }

  private static getRefreshSecret(): string {
    return config.JWT_REFRESH_SECRET || this.getJwtSecret()
  }

  /**
   * Gera par de tokens (access + refresh) para autenticação
   */
  static generateTokenPair(payload: TokenPayload): TokenPair {
    // Access Token (configurável via env)
    const accessToken = sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        email: payload.email,
        role: payload.role
      },
      this.getJwtSecret(),
      {
        expiresIn: config.JWT_ACCESS_TOKEN_EXPIRATION as any,
        issuer: 'identity-service'
      }
    )

    // Refresh Token (configurável via env)
    const refreshToken = sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        type: 'refresh'
      },
      this.getRefreshSecret(),
      {
        expiresIn: config.JWT_REFRESH_TOKEN_EXPIRATION as any,
        issuer: 'identity-service'
      }
    )

    // Hash do refresh token para armazenamento seguro
    const refreshTokenHash = this.hashToken(refreshToken)

    // Calcular expiração do refresh token (7 dias por padrão)
    const refreshTokenExpiresAt = new Date()
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7)

    return {
      accessToken,
      refreshToken,
      refreshTokenHash,
      refreshTokenExpiresAt
    }
  }

  /**
   * Gera apenas Access Token (para refresh)
   */
  static generateAccessToken(payload: TokenPayload): string {
    return sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        email: payload.email,
        role: payload.role
      },
      this.getJwtSecret(),
      {
        expiresIn: config.JWT_ACCESS_TOKEN_EXPIRATION as any,
        issuer: 'identity-service'
      }
    )
  }

  /**
   * Verifica e decodifica um token JWT
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = verify(token, this.getJwtSecret()) as any
      return {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        email: decoded.email,
        role: decoded.role
      }
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Verifica refresh token
   */
  static verifyRefreshToken(token: string): { userId: string; tenantId: string } {
    try {
      const decoded = verify(token, this.getRefreshSecret()) as any
      return {
        userId: decoded.userId,
        tenantId: decoded.tenantId
      }
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }

  /**
   * Verifica se um token é válido sem lançar erro
   */
  static isTokenValid(token: string): boolean {
    try {
      verify(token, this.getJwtSecret())
      return true
    } catch {
      return false
    }
  }

  /**
   * Hash de token para armazenamento seguro
   */
  static hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex')
  }

  /**
   * Configurações seguras para cookies de refresh token
   */
  static getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      path: '/'
    }
  }

  /**
   * Cria resposta padronizada de autenticação
   * Usado tanto no login quanto no registro completo
   */
  static createAuthResponse(
    user: {
      id: string
      email: string
      fullName: string
      role: string
      emailVerified: boolean
    },
    tenant: {
      id: string
      name: string
      status: string
    },
    tokens: TokenPair
  ): AuthSuccessResponse {
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 1800 // 30 minutos em segundos
      }
    }
  }
}
