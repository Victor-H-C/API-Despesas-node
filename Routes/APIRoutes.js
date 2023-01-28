const express = require('express')
const router = express.Router()
const db = require('../DB')
const bodyParser = require('body-parser')
const { response } = require('express')
const XLSX = require("xlsx");
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const sleep = ms => new Promise(res => setTimeout(res, ms));

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

router.get('/despesas/tipo', (req, res) =>{

    const despesas = {
        "data": [],
        "success": true
    }


    const getData = new Promise((resolve, reject) =>{
        db.query(`SELECT * FROM TB_TipoPagamento`, (err, data) =>{
                            if(err) return err

                            data.forEach(despesa => {
                                despesas.data.push(despesa)
                                resolve()
                            })

                        })
                    })


    getData.then(() =>{
        res.send(despesas)
    })

})

router.get('/despesas/categoria', (req, res) =>{

    const despesas = {
        "data": [],
        "success": true
    }


    const getData = new Promise((resolve, reject) =>{
        db.query(`SELECT * FROM TB_Categorias`, (err, data) =>{
                            console.log(err)
                            if(err) return err

                            data.forEach(despesa => {
                                despesas.data.push(despesa)
                                resolve()
                            })

                        })
                    })


    getData.then(() =>{
        res.send(despesas)
    })

})

router.post('/despesas/categoria', urlencodedParser,  (req, res) =>{

    if(!req.body.nome ||
        !req.body.descricao){
            res.json({"data:": [], "success": false})
    }else{

        const response = {
            "data": [],
            "success": true
        }

        const setDespesa = new Promise((resolve, reject) =>{
            const sql = `INSERT INTO TB_Categorias(Nome, Descricao) 
                        VALUES('${req.body.nome}', '${req.body.descricao}')`
            db.query(sql, (err, data) =>{
                            console.log(err)
                            if(err) return err
                                resolve(true)
                            })
                        })

        const getLastId = new Promise((resolve, reject) =>{
            const sql = `SELECT * FROM TB_Categorias ORDER BY IdCategorias DESC LIMIT 1`
            db.query(sql, (err, data) =>{
                if(err) return err
                    response.data = data
                    resolve(true)
            })
        })

        setDespesa.then((result) =>{
            getLastId.then(() =>{
                res.json(response)
            }).catch((err) =>{
                res.json({"data:": [], "success": false})
            })
        
        }).catch((err) =>{
            console.log(err)
            res.json({"data:": [], "success": false})
        })
    }

})

router.delete('/despesas/categoria', (req, res) =>{

    if(req.body.id){        
        const sql = `DELETE FROM TB_Categorias WHERE IdCategorias = ${req.body.id}`
            
        const deleteData = new Promise((resolve, reject) =>{
                db.query(sql, (err, data) =>{
                if(err) return err
                resolve(true)
            })
        })
        
        deleteData.then((result) =>{
            res.json({"data": req.body.id, "success": true})
        }).catch(() =>{
            res.json({"data": req.body.id, "success": false})
        })
    }else{
        res.json({"data": [], "success": false})
    }
    
})

router.get('/despesas/:id', (req, res) =>{
    const response = {
        "data": [],
        "success": true
    }

    const getData = new Promise((resolve, reject) =>{
        const sql = `SELECT despesa.Id, despesa.Valor, despesa.DataCompra, tipo.Tipo, categoria.Nome, categoria.Descricao, despesa.CEP
        FROM TB_Despesas despesa
        INNER JOIN TB_TipoPagamento tipo ON
        despesa.IdTipoPagamento = tipo.IdTipoPagamento
        INNER JOIN TB_Categorias categoria ON
        despesa.IdCategorias = categoria.IdCategorias WHERE Id = ${req.params.id}` 
        db.query(sql, (err, data) =>{
                            if(data.length != 0){
                                if(!data[0].Id){
                                    response.data = []
                                    response.success = false
                                    resolve(true)
                                }else{
                                    if(data[0].CEP){
                                        const url = 'https://viacep.com.br/ws/'+data[0].CEP+'/json/'
                                        fetch(url)
                                        .then((body) =>{
                                            body.json()
                                            .then((endereco) =>{
                                                response.data = data
                                                response.data[0]['endereco'] = endereco
                                                resolve(true)
                                            })
                                        })
                                    }else{
                                        response.data = data
                                        resolve(true)
                                    }
                                }
                            }else{
                                response.success = false
                                resolve(true)
                            }
                        })
                    })

    getData.then((result) =>{
        res.json(response)
        console.log
    }).catch((err) =>{
        console.log(err)
        res.json({"data:": [], "success": false})
    })
})

router.get('/despesas', (req, res) => {

    const despesas = {
        "data": [],
        "success": true
    }


    const getData = new Promise((resolve, reject) =>{
        db.query(`SELECT despesa.Id, despesa.Valor, despesa.DataCompra, tipo.Tipo, categoria.Nome, categoria.Descricao, despesa.CEP
                FROM TB_Despesas despesa
                INNER JOIN TB_TipoPagamento tipo ON
                despesa.IdTipoPagamento = tipo.IdTipoPagamento
                INNER JOIN TB_Categorias categoria ON
                despesa.IdCategorias = categoria.IdCategorias WHERE YEAR(DataCompra) = YEAR(NOW()) AND MONTH(DataCompra) = MONTH(NOW())`, (err, data) =>{
                            if(err) return err
                            data.forEach(despesa => {
                                despesa.DataCompra = despesa.DataCompra.toLocaleString().replace(',', '').replace('/', '-').replace('/', '-')
                                despesas.data.push(despesa)
                                resolve()
                            })

                        })
                    })


    getData.then(async () =>{

        despesas.data.forEach(despesa => {
            if(despesa.CEP && despesa.CEP.length >= 8){
                fetch('https://viacep.com.br/ws/'+despesa.CEP+'/json')
                .then((body) =>{
                    body.json().then((data) =>{
                        despesa['endereco'] = data
                    })
                })
         
            }
        })
        await sleep(500)

        res.send(despesas)
    })

})

router.post('/despesas', urlencodedParser,  (req, res) =>{

    if(!req.body.valor ||
        !req.body.data ||
        !req.body.idcategorias ||
        !req.body.idtipopagamento ||
        !req.body.cep){
            res.json({"data:": [], "success": false})
    }else{

        const response = {
            "data": [],
            "success": true
        }

        const setDespesa = new Promise((resolve, reject) =>{
            const sql = `INSERT INTO 
                        TB_Despesas(Valor, DataCompra, IdCategorias, IdTipoPagamento, CEP) 
                        VALUES(${req.body.valor}, '${req.body.data}', ${req.body.idcategorias}, ${req.body.idtipopagamento}, ${req.body.cep})`
            db.query(sql, (err, data) =>{
                        if(err) return err
                                resolve(true)
                            })
                        })

        const getLastId = new Promise((resolve, reject) =>{
            const sql = `SELECT * FROM TB_Despesas ORDER BY ID DESC LIMIT 1`
            db.query(sql, (err, data) =>{
                if(err) return err
                    response.data = data
                    resolve(true)
            })
        })

        setDespesa.then((result) =>{
            getLastId.then(() =>{
                res.json(response)
            }).catch((err) =>{
                res.json({"data:": [], "success": false})
            })
        
        }).catch((err) =>{
            console.log(err)
            res.json({"data:": [], "success": false})
        })
    }

})

router.delete('/despesas', (req, res) =>{

    if(req.body.id){        
        const sql = `DELETE FROM TB_Despesas WHERE Id = ${req.body.id}`
            
        const deleteData = new Promise((resolve, reject) =>{
                db.query(sql, (err, data) =>{
                if(err) return err
                resolve(true)
            })
        })
        
        deleteData.then((result) =>{
            res.json({"data": req.body.id, "success": true})
        }).catch(() =>{
            res.json({"data": req.body.id, "success": false})
        })
    }else{
        res.json({"data": [], "success": false})
    }
    
})

router.put('/despesas', (req, res) =>{

    const response = {
        "data": [],
        "success": true
    }

    if(req.body.id){
        
        if(!req.body.valor ||
            !req.body.data ||
            !req.body.idcategorias ||
            !req.body.idtipopagamento){
                res.json({"data": req.body.id, "success": false})
            }else{
                
                const updateDespesa = new Promise((resolve, reject) =>{
            
                    const sql = `UPDATE TB_Despesas
                    SET Valor = ${req.body.valor}, DataCompra = '${req.body.data}', IdCategorias = ${req.body.idcategorias}, IdTipoPagamento = ${req.body.idtipopagamento}  
                    WHERE Id = ${req.body.id}`
            
                    db.query(sql, (err, data) =>{
                        if(err){
                            console.log('Update: ' + err)
                            reject()
                        }
                        resolve(true)
                    })

                })

                const getData = new Promise((resolve, reject) =>{
                    const sql = `SELECT * FROM TB_Despesas WHERE Id = ${req.body.id}` 
                    db.query(sql, (err, data) =>{
                                        console.log(data + 'a')

                                        if(err){
                                            console.log('GetUpdated: ' + err)
                                            reject()  
                                        } 
                                        
                                        data.forEach(despesa => {
                                            response.data.push(despesa)
                                            resolve(true)
                                        });
                                    })
                                })

                updateDespesa.then(() =>{
                    getData.then(() =>{
                        res.json(response)
                    })
                })

            }

    }else{
        res.json({"data": [], "success": false})
    }

})

router.patch('/despesas', (req, res) =>{

    const response = {
        "data": [],
        "success": true
    }

    if(req.body.id){
        
        if(!req.body.valor ||
            !req.body.data ||
            !req.body.idcategorias ||
            !req.body.idtipopagamento){
                res.json({"data": req.body.id, "success": false})
            }else{
                
                const updateDespesa = new Promise((resolve, reject) =>{
            
                    const sql = `UPDATE TB_Despesas
                    SET Valor = ${req.body.valor}, DataCompra = '${req.body.data}', IdCategorias = ${req.body.idcategorias}, IdTipoPagamento = ${req.body.idtipopagamento}  
                    WHERE Id = ${req.body.id}`
            
                    db.query(sql, (err, data) =>{
                        if(err){
                            console.log('Update: ' + err)
                            reject()
                        }
                        resolve(true)
                    })

                })

                const getData = new Promise((resolve, reject) =>{
                    const sql = `SELECT * FROM TB_Despesas WHERE Id = ${req.body.id}` 
                    db.query(sql, (err, data) =>{
                                        if(err){
                                            console.log('GetUpdated: ' + err)
                                            reject()  
                                        } 
                                        
                                        data.forEach(despesa => {
                                            response.data.push(despesa)
                                            resolve(true)
                                        });
                                    })
                                })

                updateDespesa.then(() =>{
                    getData.then(() =>{
                        res.json(response)
                    })
                })

            }

    }else{
        res.json({"data": [], "success": false})
    }

})

module.exports = router