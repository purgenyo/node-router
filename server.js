const express = require('express');
const app = express();
const port = 3000;


const username = 'onpp_user';
const host = '95.179.241.170';
const password = '123123';

const { Client } = require('pg');
const conStringPri = `postgres://${username}:${password}@${host}/onpp`;
const client = new Client({connectionString: conStringPri});

const { GraphQLClient } = require('graphql-request');
const gclient = new GraphQLClient('http://95.179.241.170:3001/graphql');
app.use(cors());
client.connect();
const getNumber = () => ('TS' + parseInt(Math.random() * 1000) + 'T154');
app.get('/in', (req, res) => {
    let number = req.query.number;
    getUser(number).then((row) => {

        const query = `{
              allPayCalcsList(filter: { userId: { 
                equalTo: ${row.id}} 
              }, orderBy: ID_DESC) {
                exitCheck
                parkingTime
              }
            }
            `;
        gclient.request(query)
            .then(data => {
                if (data.allPayCalcsList && data.allPayCalcsList[0].exitCheck) {
                    let text = 'INSERT INTO onpp.check_in(time_arr, fare, user_id) ' +
                        'VALUES($1, $2, $3) RETURNING *';
                    let values = [new Date(), 5, row.id];
                    client.query(text, values, (err) => {
                        if (err)
                            return res.send(JSON.stringify(err.stack));
                        else
                            return res.send(JSON.stringify({success: 1}));
                    });
                } else
                    return res.send(JSON.stringify({success: 0}));
            });
    })
    .catch(e => {
        console.log(e);
    });
});

app.get('/login', (req, res) => {
    let number =  req.query.number;
    let p_token = req.query.push_token;
    getUser(number)
        .then((row) => {
            let text = 'UPDATE onpp.user SET ' +
                'token = $1' +
                ',push_token = $2' +
                ' WHERE id = $3';
            let user_token = parseInt(Math.random() * 40000).toString();
            let values = [user_token, p_token, row.id];
            client.query(text, values, (err) => {
                if (err)
                    return res.send(JSON.stringify(err.stack));
                else
                    return res.send(JSON.stringify({
                        number: row.number,
                        token: user_token
                    }));
            });
        });
});

app.get('/out', (req, res) => {
    let number =  req.query.number;
    getUser(number)
        .then((row) => {
            let text = 'UPDATE onpp.check_in SET ' +
                'time_dep = $1' +
                ' WHERE id = (select id from onpp.check_in where user_id = $2 ' +
                'and time_dep is null order by id desc limit 1)';

            let values = [new Date(), row.id];
            client.query(text, values, (err) => {
                if (err) {
                    console.log(err);
                    return res.send(JSON.stringify(err.stack));
                }
                else {
                    console.log('success true');
                    return res.send(JSON.stringify({success: 1}));
                }
            });
        })
        .catch(e => {
            return res.send(JSON.stringify(e));
            console.log(e)
        });

});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

const getUser = (number) => {
    return new Promise((resolve, reject) => {
        client.query('SELECT * from onpp.user where number = $1',
            [number], (err, result) => {
                if (result.rows.length)
                    resolve(result.rows[0]);
                else {
                    let text = 'INSERT INTO onpp.user(number) VALUES($1) RETURNING *';
                    let values = [number];
                    client.query(text, values, (err, result) => {
                        resolve(result.rows[0]);
                    })
                }
            });
    });
};