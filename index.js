const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const api = require('./Routes/APIRoutes')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.route('/').get((req, res) =>{
    res.sendFile(__dirname+ '/Views/home.html')
})


app.use('/api', api)


app.listen(3000)