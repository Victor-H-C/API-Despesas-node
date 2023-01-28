const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const api = require('./Routes/APIRoutes')
const excel = require("exceljs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.route('/excel').get((req, res) =>{

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Despesas");

    worksheet.columns = [
        { header: "Id", key: "Id", width: 5 },
        { header: "Valor", key: "Valor", width: 25 },
        { header: "DataCompra", key: "DataCompra", width: 25 },
        { header: "Tipo", key: "Tipo", width: 10 },
        { header: "Nome", key: "Nome", width: 10 },
        { header: "Descricao", key: "Descricao", width: 10 },
    ]

    fetch('http://localhost:3000/api/despesas')
    .then((body) =>{
        body.json()
        .then((data) =>{
            worksheet.addRows(data.data)
        }).finally(() =>{
            res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "despesas.xlsx"
            )
        
            return workbook.xlsx.write(res).then(function () {
            res.status(200).end();
            })
            
        })
    })



})

app.route('/').get((req, res) =>{
    res.sendFile(__dirname + '/views/home.html')
})

app.use('/api', api)


app.listen(3000)