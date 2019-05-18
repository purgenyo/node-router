const express = require('express');
const app = express();
const port = 3000;


const username = 'onpp_user';
const host = '95.179.241.170';
const password = '123123';

const { Client } = require('pg');
const conStringPri = `postgres://${username}:${password}@${host}/onpp`;
const client = new Client({connectionString: conStringPri});
client.connect();
const getNumber = () => ('TS' + parseInt(Math.random() * 1000) + 'T154');
app.get('/in', (req, res) => {
    let output = { number:  getNumber() };
    const text = 'INSERT INTO onpp.user(number) VALUES($1) RETURNING *';
    const values = [output.number];
    client.query(text, values, (err, result) => {
        if (err) {
            res.send(JSON.stringify(err.stack));
        } else {
            res.send(JSON.stringify(output));
        }
    });
});

app.get('/out', (req, res) => {
  let result = {
    number: req.query.number
  };
  res.send(JSON.stringify(result));
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
