const { apiRequest } = require('../api/constant-contact');

exports.getContactListCollectionHandler = async (event) => {
  // All log statements are written to CloudWatch
  console.info('received:', event);

  const response = await apiRequest(event);

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.status} body: ${JSON.stringify(response.body)}`);
  return response.body;
};
