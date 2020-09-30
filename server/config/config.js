//Puerto

process.env.PORT = process.env.PORT || 3000

//Entorno

process.env.NODE_ENV = process.env.NODE_ENV || 'dev' 

//Vencimiento Token

process.env.CADUCIDAD_TOKEN = 60*60*24*30

//Seed Semilla de autenticacion

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo'

//Base de Datos

let urlDB
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
}else{
    urlDB = process.env.MONGO_URI
}
console.log(process.env.NODE_ENV)
process.env.URLDB = urlDB

//Google CLient Id

process.env.CLIENT_ID = process.env.CLIENT_ID || '618763515187-mdbamkdar4162ol0of05ag2f14bs7d71.apps.googleusercontent.com'