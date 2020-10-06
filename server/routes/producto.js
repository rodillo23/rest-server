const express = require('express')
const _ = require('underscore')
const {verificaToken} = require('../middlewares/autenticacion')
const Producto = require('../models/producto')

const app = express()

app.get('/producto', verificaToken, (req, res) => {
    Producto.find({})
    .skip(0)
    .limit(5)
    .sort('nombre')
    .populate('categoria', 'descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok : false,
                err
            })
        }

        Producto.countDocuments((err, conteo) =>{
            res.json({
                ok : true,
                productos : productoDB,
                registros : conteo
            })
        })
    })
})

app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id

    Producto.findById(id)
    .populate('categoria', 'descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, producto) => {
        if(err) {
            return res.status(500).json({
                ok : false,
                err
            })
        }

        if(!producto){
            return res.status(400).json({
                ok : false,
                err : {
                    message : 'El producto no de encuentra en la BD'
                }
            })
        }

        res.json({
            ok : true,
            producto
        })
    })
})


app.post('/producto', verificaToken, (req, res) => {
    let usuario = req.usuario
    let body = req.body

    let producto = new Producto({
        nombre : body.nombre,
        precioUni : body.precioUni,
        descripcion : body.descripcion,
        disponible : body.disponible,
        categoria : body.categoria,
        usuario : usuario._id
    })

    producto.save((err, producto) => {
        if(err){
            return res.status(500).json({
                ok : false,
                err
            })
        }

        res.status(201).json({
            ok : true,
            producto
        })

    })

})

app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria'])

    Producto.findByIdAndUpdate(id, body,{new: true},(err, producto) => {
        if(err){
            return res.status(500).json({
                ok : false,
                err
            })
        }

        if(!producto){
            return res.status(400).json({
                ok : false,
                err :{
                    message : 'El producto no se encuentra en la BD'
                }
            })
        }

        res.json({
            ok : true,
            producto
        })
    })
})

app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id
    let estado = {
        disponible : false
    }

    Producto.findByIdAndUpdate(id, estado, {new : true}, (err, producto) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if(!producto){
            return res.status(400).json({
                ok : false,
                err :{
                    message : 'El producto no se encuentra en la BD'
                }
            })
        }

        res.json({
            ok: true,
            producto
        })
    })
})

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino
    let regex = new RegExp(termino, 'i')
    
    Producto.find({nombre : regex})
    .populate('categoria', 'nombre')
    .exec((err, productoDb) => {
        if (err) {
            return res.status(500).json({
                ok : false,
                err
            })
        }

        if (productoDb == "") {
            return res.status(400).json({
                ok : false,
                err : {
                    message : 'No se encontraron coincidencias'
                }
            })
        }

        res.json({
            ok : true,
            productoDb
        })
    })
})
module.exports = app