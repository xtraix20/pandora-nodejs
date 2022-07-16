import express, { query } from 'express'
import { Server as WebSocketServer } from 'socket.io'
import http from 'http'
import { v4 as uuid } from 'uuid'

let notes = [];
//database
const {Pool }= require('pg')
const config ={
    user: 'postgres',
    host: 'localhost',
    password:'Campeon2013',
    database:'pandora'
};

const pool = new Pool(config);

const getHumedad= async ()=>{
    try {
        const res= await pool.query('select * from Humedad');
    console.log(res);
    } catch (e) {
        console.log(e);
        
    }
};

const insertMonoxido=async ()=>{
    try {
        const text = 'INSERT INTO Monoxido( Fecha, Hora, Monoxido) VALUES ($1,$2, $3 ) '
        const values = ['21/01/2022','7:00', '65']



        const res = await pool.query(text, values)
        console.log(res);
        pool.end();

    } catch (e) {
        console.log(e);
        
    }
}

const deleteMonoxido = async ()=>{
    const text = 'DELETE FROM Monoxido WHERE Fecha = $1';
    const value = ['21/01/2022'];

    const res = await pool.query(text, value);
    console.log(res)
};

const editMonoxido = async ()=>{
    const text ='UPDATE Monoxido SET Fecha =$1 WHERE Fecha = $2'
    const values = ['02/05/2022', 'ssss'];
    const res=await pool.query(text, values);
    console.log(res);
}



editMonoxido();
//deleteMonoxido();
//insertMonoxido();
//getHumedad();






//socket
const app = express()
const Server = http.createServer(app)
const io = new WebSocketServer(Server)

app.use(express.static(__dirname + '/public'))


io.on('connection', (socket) => {
    console.log('nueva conexion:', socket.id)

    socket.emit('server:loadnotes',notes)


    socket.on('client:newnote', newNote => {
        const note = { ...newNote, id: uuid() }
        
        notes.push(note)
        io.emit('server:newnote', note)
    })

    socket.on('client:deletenote', noteId => {
       notes= notes.filter((note) => note.id !== noteId);
       io.emit('server:loadnotes', notes)
    })

    socket.on('client:getnote', noteId => {
        const note = notes.find(note => note.id == noteId)
        socket.emit('server:selectednote', note)
    })
    socket.on('client:updatenote', (updatedNote) =>{
        notes = notes.map((note)=>{
            if(note.id==updatedNote.id){
                note.title = updatedNote.title
                note.description=updatedNote.description
            }
            return note
        })
       io.emit('server:loadnotes', notes)
    })

})
Server.listen(3000)
console.log('Server on port', 3000)