/*
* Use this file to define which fields to use, which list to populate and to define your custom fields.
*/

const listId = '12345';

const newContact = (input) => ({
  email_address: {
    address: input.emailAddress,
  },
  first_name: input.firstName,
  last_name: input.lastName,
  company_name: input.company,
  create_source: 'Contact',
  custom_fields: [
    {
      custom_field_id: '',
      value: '',
    },
  ],
  street_addresses: [
    {
      kind: 'home',
      street: input.street,
      city: input.city,
      state: input.state,
      postal_code: input.zip
    }
  ],
  list_memberships: [ listId ]
});

module.exports = {
  newContact,
}
