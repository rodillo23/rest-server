require('./config/config')

const express = require('express')
const mongoose = require('mongoose')

const app = express()

const bodyParser = require('body-parser')

//middlewares-> funciones que se disparan cada que pasa por aqui el codigo
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(require('./routes/usuario'))

mongoose.connect(
    process.env.URLDB, 
    {useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex: true, useFindAndModify: false}, 
    (err, res) => {
        if (err) throw new err;
        console.log('Base de Datos ONLINE');
})

app.listen(process.env.PORT, ()=> {
    console.log('Escuchando en el puerto', process.env.PORT)
})