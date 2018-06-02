const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ajax_test');
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

var noteSchema = new mongoose.Schema({
    title:String,
    body:String,
    author:String,
});

var Note = mongoose.model('Note',noteSchema);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname)));


app.get('/notes',(req,res)=>{
    res.sendFile(path.join(__dirname+'/test.html'));
});



app.get('/home',(req,res)=>{
    var data = Note.find((err,data)=>{
        if(err)
        res.status(500).send({ error:error });
        else{
            res.send(data);

        }
    })

});

app.post('/notes',(req,res)=>{
    var note = new Note(req.body,(data)=>{
        console.log(data);
    });
    note.save();
    res.send()
});

app.get('/notes/:id',(req,res)=>{
    var note = Note.findOne({_id:req.params.id},(err,note)=>{
        if(err)
        res.send('error');
        else
        res.send(note);
    });
});

app.post('/notes/:id',(req,res)=>{
    var note = Note.findOneAndUpdate({_id:req.params.id},req.body,
        //returns the new store instead of the old store
        {
          new:true,
          runValidators:true,
        });
        console.log("updated note");
        console.log(note);
});

app.listen(3000,()=>{
    console.log('Server running on port 3000');
});