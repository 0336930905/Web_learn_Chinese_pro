const { OAuth2Client } = require('google-auth-library');
const googleConfig = require('../config/google');

const client = new OAuth2Client(
  googleConfig.clientID,
  googleConfig.clientSecret,
  googleConfig.callbackURL
);

async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: googleConfig.clientID,
  });
  const payload = ticket.getPayload();
  return payload;
}

module.exports = {
  client,
  verifyGoogleToken,
};
