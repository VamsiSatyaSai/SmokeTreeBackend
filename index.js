const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(3000, ()=>{
    console.log('Connected to port');
});

const db = new sqlite3.Database('./persons.db', (err) => {
    if(err) {
        console.log(err.Message);
    }
    else {
        console.log('Database Connected');
    }
});


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`);
    
      // Create Address table with a foreign key referencing the User table
      db.run(`CREATE TABLE IF NOT EXISTS Address (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zipcode TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES User(id)
      )`);
})


app.post('/register', (req, res) => {
    const { name, address, city, state, zipcode } = req.body;
  
    // Step 1: Insert the user into the User table
    db.run(`INSERT INTO User (name) VALUES (?)`, [name], function (err) {
      if (err) {
        console.error('Error inserting user:', err.message);
        res.status(500).send('Server error');
      } else {
        const userId = this.lastID;  // Get the inserted user's ID
  
        // Step 2: Insert the address into the Address table with user_id as the foreign key
        db.run(
          `INSERT INTO Address (user_id, address, city, state, zipcode) VALUES (?, ?, ?, ?, ?)`,
          [userId, address, city, state, zipcode],
          function (err) {
            if (err) {
              console.error('Error inserting address:', err.message);
              res.status(500).send('Server error');
            } else {
              res.status(200).send('User and address registered successfully');
            }
          }
        );
      }
    });
  });