const request = require('superagent');
const { scope } = require('../constants');
const AWS = require('aws-sdk');
const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
const sm = new AWS.SecretsManager({
  region: process.env.AWS_REGION,
  // credentials // if running standalone script outside of Lambda
});
const secretId = process.env.AWS_SECRET_ID;

let keys;

const getAuthorizationURL = (redirectUri, clientId) => {
  const baseURL = "https://api.cc.email/v3/idfed";
  const authURL = `${baseURL}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`; 

  return authURL;
}

const getAccessToken = (redirectUri, clientId, clientSecret, code, _callback = () => {}) => {
  const baseUrl = 'https://idfed.constantcontact.com/as/token.oauth2';
  const authUrl = `${baseUrl}?code=${code}&grant_type=authorization_code&scope=${scope}&redirect_uri=${redirectUri}`;
  
  const credentials = new Buffer.from(`${clientId}:${clientSecret}`);
  const authorization = `Basic ${credentials.toString('base64')}`;

  return request
    .post(authUrl)
    .accept('application/json')
    .set('Authorization', authorization)
    .end((err, res) => _callback(err, res));
}

const refreshNewToken = (refreshToken, clientId, clientSecret, _callback = () => {}) => {
  const baseUrl = 'https://idfed.constantcontact.com/as/token.oauth2';
  const authUrl = `${baseUrl}?refresh_token=${refreshToken}&grant_type=refresh_token`;

  const credentials = new Buffer.from(`${clientId}:${clientSecret}`);
  const authorization = `Basic ${credentials.toString('base64')}`;

  return request
    .post(authUrl)
    .accept('application/json')
    .set('Authorization', authorization)
    .end((err, res) => _callback(err, res));
}

const fetchToken = async (_callback = () => {}) => {
  await new Promise((resolve, reject) => {
    sm.getSecretValue({ SecretId: secretId }, (err, result) => {
      if (err) reject(err);
      else resolve(
        keys = JSON.parse(result.SecretString)
      );
    });
  });
  // console.info(keys)
  return _callback(keys);
}

const storeToken = async (response) => {
  keys = response;
  const data = JSON.stringify(response);
  await new Promise((resolve, reject) => {
    sm.putSecretValue({ SecretId: secretId, SecretString: data }, (err, result) => {
      if (err) reject(err);
      else resolve(
        console.log(result)
      );
    });
  });
  // console.info(keys)
  return _callback(keys);
}

module.exports = {
  getAuthorizationURL,
  getAccessToken,
  refreshNewToken,
  storeToken,
  fetchToken,
}
