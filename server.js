const mysql = require('mysql');
const express = require('express');
const cors = require('cors')

const app = express();

app.use(exsssspress.json());
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

app.get('/ListarThreads/:pagina',(req,res)=>{
    mysqlConnection.query('SELECT count(*) as tam FROM thread;',(err,rows,fields)=>{
        if(!err){
            const pages = Math.ceil(rows[0].tam/20)
            const pagepesq = req.params.pagina;
            mysqlConnection.query('SELECT *,(SELECT COUNT(*) FROM threadreplies t2 WHERE t2.thread = t1.Codigo) AS respostas FROM thread t1 LIMIT 20 offset ?;',(pagepesq*20)-20,(err,rows,fields)=>{
            if(!err){
                const ret = [{dados:rows,paginate:pages}]
                res.send(ret);                    
            }else{    
                console.log(err);
            }    
        })
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

app.get('/RespostasThread/:codigo/:page',(req,res)=>{
    mysqlConnection.query('SELECT count(*) as tam FROM threadreplies  where thread = ?;',req.params.codigo,(err,rows,fields)=>{
        if(!err){
            const pages = Math.ceil(rows[0].tam/20)
            const pagepesq = req.params.page;
            mysqlConnection.query('SELECT *,date_format(dataresp,"%d/%m/%y") as dataformatada FROM threadreplies WHERE thread = ? LIMIT 20 offset ?;',[req.params.codigo,(pagepesq*20)-20],(err,rows,fields)=>{
                if(!err){
                    const ret = [{dados:rows,paginate:pages}]
                    res.send(ret);                    
                }else{    
                    console.log(err);
                }    
            })           
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
