const express = require('express');
const app = express();
const port = 3000;

const getNumber = () => {
  return 'TS' + parseInt(Math.random() * 1000) + 'T154';
};

/*

await client.connect()

const res = await client.query('SELECT $1::text as message', ['Hello world!'])
console.log(res.rows[0].message) // Hello world!
await client.end();*/


app.get('/in', (req, res) => {
  let number = getNumber();
  let result = {
      number: number
  };
  res.send(JSON.stringify(result));
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
