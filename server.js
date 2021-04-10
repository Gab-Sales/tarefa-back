const mysql = require('mysql');
const express = require('express');
const cors = require('cors')

const app = express();

app.use(express.json());
app.use(cors())

const mysqlConnection = mysql.createConnection("mysql://be2d68396299c6:ce2b94d2@us-cdbr-east-03.cleardb.com/heroku_e798ae2abab01cb?reconnect=true");

mysqlConnection.connect(function(err){
    if(err){
        console.error('error connecting'+err.stack);
        return;
    }
    console.log('connected as id'+mysqlConnection.threadId); 
});

app.listen(process.env.PORT || 3000);

app.get('/ListarThreads',(req,res)=>{
    mysqlConnection.query('SELECT *,(SELECT COUNT(*) FROM threadreplies t2 WHERE t2.thread = t1.Codigo) AS respostas FROM thread t1;',(err,rows,fields)=>{
        if(!err){
            res.send(rows);
        }else{    
            console.log(err);
        }    
    })
});

app.get('/DetalharThread/:codigo',(req,res)=>{
    const val = req.params.codigo;
    mysqlConnection.query('SELECT *,(SELECT COUNT(*) FROM threadreplies t2 WHERE t2.thread = t1.Codigo) AS respostas,date_format(datainsercao,"%d/%m/%y") as dataformatada FROM thread t1 where t1.codigo = ?;',req.params.codigo,(err,rows,fields)=>{
        if(!err){
            res.send(rows);
        }else{    
            console.log(err);
        }    
    })
});

app.post('/CriarThread',(req,res)=>{
    const val = req.body;
    mysqlConnection.query('insert into thread (titulo,conteudo,nome,datainsercao) values(?,?,?,?)',[val.titulo,val.conteudo,val.nome,new Date()],(err,rows,fields)=>{
        if(!err){
            res.send({mensagem:'inserido com sucesso!'});
        }else{    
            console.log(err);
        }    
    })
})

app.post('/ResponderThread',(req,res)=>{
    const val = req.body;
    mysqlConnection.query('insert into threadreplies (thread,resposta,nome,dataresp) values(?,?,?,?)',[val.thread,val.resposta,val.nome,new Date()],(err,rows,fields)=>{
        if(!err){
            res.send({mensagem:'inserido com sucesso!'});
        }else{    
            console.log(err);
        }    
    })
})

app.get('/RespostasThread/:codigo',(req,res)=>{
    const val = req.params.codigo;
    mysqlConnection.query('SELECT *,date_format(dataresp,"%d/%m/%y") as dataformatada FROM threadreplies  where thread = ?;',req.params.codigo,(err,rows,fields)=>{
        if(!err){
            res.send(rows);
        }else{    
            console.log(err);
        }    
    })
});

app.delete('/DeleteThread/:codigo',(req,res)=>{
    mysqlConnection.query('delete from thread where codigo = ?',req.params.codigo,(err,rows,fields)=>{
        if(!err){
            mysqlConnection.query('delete from threadreplies where thread = ?',req.params.codigo,(err,rows,fields)=>{
                if(!err){
                    res.send({mensagem:'Deletado com sucesso!'});
                }else{    
                    console.log(err);
                }    
            });
        }else{    
            console.log(err);
        }    
    })
})

app.delete('/DeleteThreadResp/:codigo',(req,res)=>{
    mysqlConnection.query('delete from threadreplies where codigo = ?',req.params.codigo,(err,rows,fields)=>{
        if(!err){
            res.send({mensagem:'deletado com sucesso!'});
        }else{    
            console.log(err);
        }    
    })
})

setInterval(function () {
    mysqlConnection.query('SELECT 1');
}, 5000);