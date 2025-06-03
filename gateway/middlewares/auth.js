import jwt from 'jsonwebtoken';

// Middleware to extract userId from JWT and attach it to the request
export const authenticate = (req, res, next) => {
   console.log('Received headers:', req.headers); // Debug logging
  const authHeader = req.headers.authorization;
    console.log('AUTH HEADER:',authHeader); // Debug logging
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
    // authenticate.js (Gateway)
 
  console.log('Token:', token); // Verify token extraction
  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use the same secret as your auth service
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authenticateSeller = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(req.headers);
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded user_type:', decoded.user_type); // Debug log

    // Verify user_type exists and is an array
    if (!Array.isArray(decoded.user_type)) {
      return res.status(403).json({ message: 'Invalid user type format' });
    }

    // Check if user_type includes 'Seller'
    if (!decoded.user_type.includes('Seller')) {
      return res.status(403).json({ message: 'Seller privileges required' });
    }
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.user_type // Optional: Keep the array or extract 'Seller'
    };
    
    next();
  } catch (err) {
    return res.status(403).json({ 
      message: 'Invalid or expired token',
      error: err.message // Optional: Include error details for debugging
    });
  }
};