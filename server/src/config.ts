import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'luxe_super_secret_jwt_access_token_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'luxe_super_secret_jwt_refresh_token_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
};
