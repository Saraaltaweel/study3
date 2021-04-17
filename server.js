'use strict';



const express = require('express');
const superagent = require('superagent');
require('dotenv').config();
const app = express();
const methodOverride = require('method-override');

app.use(express.urlencoded({ extended: true }));
app.use(express.static( "./public"));
app.use(methodOverride('_method'));
const PORT = process.env.PORT || 4000;
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
app.set('view engine', 'ejs');


app.get('/',renderForm)
app.post('/search',renderApi)
app.get('/test',apiTow)
app.post('/test', favCollection)
app.get('/mydata',renderMyData)
app.get('/detail/:id',renderDetail)
app.delete('/delete/:id',deleteData)
app.put('/updat/:id',updatData)

function renderForm(req,res){
    res.render('pages/index', {cond: 0})
}

 function renderApi (req,res){
     const api='https://digimon-api.vercel.app/api/digimon';
     superagent.get(api).then(result=>{
         res.render('pages/index',{results:result.body[0],cond: 1})
     })
 }

 function apiTow(req,res){
     const api= 'https://digimon-api.vercel.app/api/digimon';
     superagent.get(api).then(result=>{
         res.render('pages/test',{results:result.body})
     })
 }

 function favCollection(req,res){
    const sql='INSERT INTO myCollection (name, image, level) VALUES($1, $2, $3) RETURNING *';

     const values=[req.body.name,req.body.img,req.body.level];
     client.query(sql,values).then(result=>{
         console.log(result.rows)
         res.render('pages/index',{cond: 0})
     })
 }

function renderMyData(req,res){
    const sql='SELECT * FROM myCollection;';
    client.query(sql).then(result=>{
        res.render('pages/myData',{results:result.rows})
    })
}

function renderDetail(req,res){
    const Id=req.params.id
    const sql = 'SELECT * FROM myCollection WHERE id=$1'
    const value=[Id];
    client.query(sql,value).then(result=>{
        res.render('pages/details',{results:result.rows[0]})
    })


}

function deleteData(req,res){
    const Id=req.params.id;
    const sql='DELETE FROM myCollection WHERE id=$1;';
    const value = [Id];
    client.query(sql,value).then(()=>{
        res.redirect('/')
    })
}

function updatData(req,res){
    const   Id=req.params.id;
    const {name, image, level}=req.body;

    const sql= 'UPDATE myCollection SET name=$1, image=$2, level=$3 WHERE id=$4';
    const value=[name, image, level, Id]
    client.query(sql,value).then(()=>{
        res.redirect(`/updat/${Id}`)
    })
}

 client.connect().then(() => {
    app.listen(PORT, () => console.log(`I'm working at port ${PORT}`))
});