//Puerto

process.env.PORT = process.env.PORT || 3000

//Entorno

process.env.NODE_ENV = process.env.NODE_ENV || 'dev' 

//Base de Datos

let urlDB
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
}else{
    urlDB = 'mongodb+srv://samsara:RFOXAHiCyPF4eDLt@cluster0.xq0h4.mongodb.net/cafe?retryWrites=true&w=majority'
}
console.log(process.env.NODE_ENV)
process.env.URLDB = urlDB