const express = require('express')
const fileUpload = require('express-fileupload')
const Usuario = require('../models/usuario')
const Producto = require('../models/producto')
const app = express()

const fs = require('fs')
const path = require('path')

//cuando llamamos esta funcion, los archivos que se carguen caen dentro de request.files
app.use(fileUpload())

app.put('/upload/:tipo/:id', (req, res) => {

    //obtenemos el id del usuario y el tipo de imagen que hace referencia a productos o usuarios
    let tipo = req.params.tipo
    let id = req.params.id

    //comprobamos si se cargo algun archivo dentro de req.files
    if (!req.files) {
        return res.status(400).json({
            ok :false,
            err: {
                message : 'No se ha seleccionado ningún archivo'
            }
        })
    }

    //validar tipo de imagen
    let tiposValidos = ['productos', 'usuarios']
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok : false,
            err : {
                message : `${tipo} no es un tipo permitido, los tipos permitidas son: ` + tiposValidos.join(', '),
            }
        })
    }

    //validamos extension
    let archivo = req.files.archivo
    let nombreSeparado = archivo.name.split('.')
    let extension = nombreSeparado[nombreSeparado.length - 1]

    let extensionesValidas = ['png', 'jpg', 'jpeg', 'gif']

    //si es menor que cero quiere decir que no se encontro una extension valida  
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok : false,
            err : {
                message : `${extension} no es una extension valida, Selecciona : ` + extensionesValidas.join(', '),
                ext : extension
            }
        })
    }

    //creamos el nombre del archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    //lo movemos a la carpeta correspondiente
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
                    
        //la imagen ya es cargada, ahora la asignamos a un usuario o producto
        if(tipo == 'usuarios'){
            guardarImagenUsuario(id, res, nombreArchivo)
        }else{
            guardarImagenProducto(id, res, nombreArchivo)
        }
        

    })
})

function guardarImagenProducto(id, res, nombreArchivo){
    Producto.findById(id, (err, productoDb) => {
        if(err){
        eliminarImagen('productos', nombreArchivo)
            return res.status(500).json({
                ok : false,
                err
            })
        }

        if(!productoDb){
        eliminarImagen('productos', nombreArchivo)
            return res.status(400).json({
                ok : false,
                err : {
                    message : 'El producto no existe en la BD'
                }
            })
        }

        eliminarImagen('productos', productoDb.img)

        productoDb.img = nombreArchivo
        productoDb.save((err, productoGuardado) => {
            res.json({
                ok : true,
                message : 'Imagen guardada correctamente',
                producto : productoGuardado,
                imagen : nombreArchivo
            })
        })
    })
}

function guardarImagenUsuario(id, res, nombreArchivo){
    
    Usuario.findById(id, (err, usuarioDb) => {

        if (err) {
            eliminarImagen('usuarios', nombreArchivo)
            return res.status(500).json({
                ok : false,
                err
            })
        }

        if(!usuarioDb){
        eliminarImagen('usuarios', nombreArchivo)
            return res.status(400).json({
                ok : false,
                err : {
                    message : 'El usuario no se encuentra en la BD'
                }
            })
        }
        
        eliminarImagen('usuarios', usuarioDb.img)

        usuarioDb.img = nombreArchivo
        usuarioDb.save((err, usuarioGuardado) => {
            res.json({
                ok : true,
                message : 'Imagen guardada correctamente',
                usuario : usuarioGuardado,
                img : nombreArchivo
            })
        })
    })
}

function eliminarImagen(tipo, nombreImagen){
    //creamos el path del archivo a eliminar
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`)

    //confirmamos si el path existe y lo borramos
    console.log(fs.existsSync(pathImagen))
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen)
    }
}

module.exports = app

