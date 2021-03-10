const request = require('superagent');
const {
  apiKey,
  secret,
} = require('./constants');
const {
  fetchToken,
  refreshNewToken,
  storeToken,
 } = require('./oauth');


let attempts = 0;

const useAuth = async (_callback, params = {}) => await fetchToken((authToken) => _callback(authToken, params));

const getNewToken = (refreshToken, _callback, params = {}) => {
  return refreshNewToken(refreshToken, apiKey, secret, (error, response) => {
    if (error) {
      console.log(error.status);
      return Error;
    }
    if (response && response.status === 200 && response.text) {
      console.log(response.status);
      storeToken(JSON.parse(response.text)); // @todo Catch failed write op
      return useAuth(_callback, params);
    } else {
      console.log(response.status);
      return useAuth(_callback, params);
    }
  });
}

const sendRequest = async (token, options = { method: '', path: '', body: '' }) => {
  const baseUrl = 'https://api.cc.email/v3';
  return request(options.method, `${baseUrl}${options.path}`)
    .accept('application/json')
    .set('Authorization', `Bearer ${token.access_token}`)
    .send(options.body)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.info(err);
      const unauthorized = (err.message == 'Unauthorized');
      if (unauthorized && attempts < 3) {
        attempts++;
        if (token.refresh_token) {
          return getNewToken(token.refresh_token, sendRequest, options) 
        } else {
          console.info('No refresh token found. Need to re-auth manually using the authClientServer.')
          return 'No refresh token found. Need to re-auth manually using authClientServer';
        }
      }
      return err;
    })
}

const myParams = (getParams) => {
  if (!getParams || Object.keys(getParams).length === 0) {
    return '';
  }

  let string = '';
  let keys = Object.keys(getParams);
  keys.forEach((key, i ,arr) => {
    i === 0 ? string += '?' : '';
    string += key + '=' + getParams[key];
    i + 1 === arr.length ? '' : string += '&'
  });

  return string;
}

const apiRequest = (token, lambdaEvent = { method: 'GET', path: '/', getParams: {}, body: {}}) => sendRequest(token, {
  method: lambdaEvent.method,
  path: `${lambdaEvent.path}${myParams(lambdaEvent.getParams)}`,
  body: lambdaEvent.body
});

module.exports = {
  apiRequest: (lambdaEvent) => useAuth(apiRequest, lambdaEvent)
}
