const csurf = require('csurf');

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

module.exports = csrfProtection;
