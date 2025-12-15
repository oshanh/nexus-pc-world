const csurf = require('csurf');

const csrfProtection = csurf({
  cookie: {
    httpOnly: false, // allow frontend to read the token cookie or request token via endpoint
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

module.exports = csrfProtection;
