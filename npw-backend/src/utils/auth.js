const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, user) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '7d' });
       
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
                
    });
    return token;
};

const generateOTP=()=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports={generateTokenAndSetCookie,generateOTP};