const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuario')

const {OAuth2Client} = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)

const app = express()

app.post('/login', (req, res) => {
    
    let body = req.body

    Usuario.findOne({email: body.email}, (err, usuarioDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message : 'Usuario o contraseña incorrectos'
                }
            })
        }

        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                err: {
                    message : 'Contraseña o usuario incorrectos'
                }
            })
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    })
})

async function verify(token){
    const ticket = await client.verifyIdToken({
        idToken : token,
        audience : process.env.CLIENT_ID
    })

    const payload = ticket.getPayload()
    
    return {
        nombre : payload.name,
        email : payload.email,
        img : payload.picture,
        google : true
    }
}

app.post('/google', async(req, res)=>{
    
    let token = req.body.idtoken
    
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(500).json({
                ok : false,
                err : e
            })
        })

    Usuario.findOne({email : googleUser.email}, (err, usuarioDB) => {
        if(err){
            return this.response.status(500).json({
                ok: false,
                err
            })
        }

        if(usuarioDB){

            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok : false,
                    err : {
                        message : 'Debe usar autenticacion normal'
                    }
                })
            }else{
                let token = jwt.sign({
                    usuario : usuarioDB
                }, process.env.SEED, {expiresIn : process.env.CADUCIDAD_TOKEN})

                return res.json({
                    ok : true,
                    usuario : usuarioDB,
                    token
                })
            }
        }else{
            let usuario = new Usuario({
                nombre : googleUser.nombre,
                email : googleUser.email,
                img : googleUser.img,
                google : googleUser.google,
                password : ':)'
            })

            usuario.save((err, usuarioDb) => {
                if(err){
                    res.status(500).json({
                        ok : false,
                        err
                    })
                }

                let token = jwt.sign({
                    usuario : usuarioDb
                }, process.env.SEED, {expiresIn : process.env.CADUCIDAD_TOKEN})

                return res.json({
                    ok : true,
                    usuario : usuarioDb,
                    token
                })
            })
        }
    })
})



module.exports = app