const port = 3000;

module.exports = {
  apiKey: process.env.CC_API_KEY,
  secret: process.env.CC_API_SECRET,
  scope: process.env.CC_API_SCOPE,
  redirectUri: encodeURIComponent(`http://localhost:${port}/callback`),
  port
}
