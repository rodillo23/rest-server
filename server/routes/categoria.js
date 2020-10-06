const express = require('express')
const Categoria = require('../models/categoria')
const _ = require('underscore')

let {verificaToken, verificaAdmin_Role} = require('../middlewares/autenticacion')

const app = express()

app.get('/categoria', verificaToken, (req, res) => {
    
    let usuarioConsulta = req.usuario

    Categoria.find({})
    .populate('usuario', 'nombre email')
    .sort('descripcion')
    .exec((err, categoriasDB) => {
        
        if(err) {
            return res.status(400).json({
                ok : false,
                err
            })
        }

        Categoria.countDocuments({}, (err, conteo) => {
            res.json({
                ok: true,
                categorias : categoriasDB,
                registros : conteo,
                solicito : usuarioConsulta
            })
        })
    })
}) 

app.get('/categoria/:id', verificaToken, (req, res) => {
    
    let id = req.params.id

    Categoria.findById(id, (err, categoria) => {
        if(err){
            return res.status(400).json({
                ok : false,
                err
            })
        }

        if(!categoria){
            return res.status(500).json({
                ok: false,
                err : {
                    message : 'El id no es correcto'
                }
            })
        }

        return res.json({
            ok : true,
            name : categoria
        })
    })
})

app.post('/categoria', verificaToken,(req, res) => {
    let body = req.body
    let usuario = req.usuario
    
    let categoria = new Categoria({
        descripcion : body.descripcion,
        usuario : usuario._id
    })

    categoria.save((err, categoria) => {
        if(err) {
            return res.status(500).json({
                ok : false,
                err
            })
        }

        if(!categoria){
            return res.status(400).json({
                ok : false,
                err
            })
        }

        res.json({
            ok : true,
            categoria
        })
    })
})

app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id
    let body = _.pick(req.body, ['descripcion'])

    Categoria.findByIdAndUpdate(id, body, {new : true, runValidators : true}, (err, categoria) => {
        if(err) {
            return res.status(500).json({
                ok : false,
                err
            })
        }

        if(!categoria){
            return res.status(400).json({
                ok : false,
                err
            })
        }

        res.json({
            ok : true,
            categoria
        })
    })
})

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res)=>{
    let id = req.params.id

    Categoria.findByIdAndRemove(id, (err, categoria) => {
        if(err) {
            return res.status(500).json({
                ok : false,
                err
            })
        }

        if(!categoria){
            return res.status(400).json({
                ok : false,
                err : {
                    message : 'Categoria no se encuentra en la BD'
                }
            })
        }

        res.json({
            ok: true,
            eliminado : categoria
        })
    })
})


module.exports = app