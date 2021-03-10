const sql = require('mssql');
const AWS = require('aws-sdk');
const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
const sm = new AWS.SecretsManager({
  region: process.env.AWS_REGION,
  // credentials // if running standalone script outside of Lambda
});
const secretId = process.env.AWS_SECRET_ID;

let creds = {};

const withCreds = async (_callback, values) => {
  await new Promise((resolve, reject) => {
    sm.getSecretValue({ SecretId: secretId }, (err, result) => {
      if (err) reject(err);
      else resolve(
        creds = JSON.parse(result.SecretString)
      );
    });
  });
  console.info(creds)
  return _callback(creds, values);
}

/*
 * Use this to setup Lambda with MS SQL:
 * aws lambda update-function-code --function-name your-function-name-here --zip-file your-zipped-project-directory.zip
 * 
 * Reference: https://stackoverflow.com/a/51675094/2121843
 * 
*/
const insertContact = async (creds, values) => {
    // Take DB Config from environment variables set in Lambda config
    const config = {
        user: creds.username,
        password: creds.password,
        server: creds.host,
        database: creds.dbname,
        options: {
            encrypt: true // Azure
        }
    }

    try {
        // Open DB Connection
        let pool = await sql.connect(config)

        // Query Database
        const query = `INSERT INTO people(
            id,
            firstName,
            lastName,
            email,
            address,
            city,
            state,
            zip
        ) VALUES (
            @id,
            @firstName,
            @lastName,
            @email,
            @address,
            @city,
            @state,
            @zip
        )`;

        let result = await pool
            .request()
            .input('id', sql.VarChar, values.id)
            .input('firstName', sql.VarChar, values.firstName)
            .input('lastName', sql.VarChar, values.lastName)
            .input('email', sql.VarChar, values.emailAddress)
            .input('address', sql.VarChar, values.street)
            .input('city', sql.VarChar, values.city)
            .input('state', sql.VarChar, values.state)
            .input('zip', sql.VarChar, values.zip)
            .query(query);
            
        // Close DB Connection
        pool.close();
        // The results of our query
        console.log("Results:", result.recordset);

        // Use callback if you need to return values from your lambda function.
        // Callback takes (error, response?) as params.
        // _callback(null, result.recordset);
        return result.recordset;
    } catch (err) {
        // Error running our SQL Query
        console.error("ERROR: Exception thrown running SQL", err);
    }

    sql.on('error', err => console.error(err, "ERROR: Error raised in MSSQL utility"));
}

module.exports = {
  insertContact: (values) => withCreds(insertContact, values)
}
