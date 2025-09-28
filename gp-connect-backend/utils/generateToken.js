import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development_only';
  return jwt.sign({ id }, secret, {
    expiresIn: '1h',
  });
};

export default generateToken;
