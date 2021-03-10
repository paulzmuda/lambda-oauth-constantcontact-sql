const { insertContact } = require('../api/azure/mssql');
const { newContact } = require('../api/constant-contact/contact-fields');

exports.putNewSQLContactHandler = async (event) => {
  // All log statements are written to CloudWatch
  console.info('received:', event);

  // spoof input from event
  const rando = Math.floor(Math.random()*(999-100+1)+100);
  const input = {
    id: rando,
    emailAddress: `jdoe${rando}@gmail.com`,
    firstName: 'John',
    lastName: 'Doe',
    company: '',
    street: '123 1st Ave.',
    city: 'Chicago',
    state: 'IL',
    zip: '60634'
  }

  const response = await insertContact(newContact(input));

  // All log statements are written to CloudWatch
  // console.info(`response from: ${event.path} statusCode: ${response.status} body: ${JSON.stringify(response.body)}`);
  return response;
}
