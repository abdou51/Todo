const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv/config');
const errorHandler = require('./helpers/errorHandler');
const cors = require('cors');
const morgan = require('morgan');

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(morgan('tiny'));


const usersRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');


const api = process.env.API_URL;
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/todos`, todoRoutes);;


//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'TODO'
})
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch((err)=> {
    console.log(err);
})

app.use(errorHandler);
const port = process.env.PORT || 2000;
app.listen(port, ()=>{

    console.log('server is running http://localhost:3000');
})