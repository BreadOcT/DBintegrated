const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL!');
  
  connection.query('SHOW DATABASES LIKE "halal_finance"', (err, results) => {
    if (err) {
      console.error('Query error:', err.message);
    } else {
      console.log('Databases matching "halal_finance":', results);
      if (results.length === 0) {
        console.log('Database "halal_finance" DOES NOT EXIST.');
      }
    }
    connection.end();
  });
});
