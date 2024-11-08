//console.log('jep');
const express = require('express');
const app = express();
// const bodyParser = require('body-parser');

require('dotenv').config();
const PORT = process.env.PORT || 4000;

var cors = require("cors");
 
app.use(
    cors({
      origin: "*",
      credentials:true,
    })
  );
 
// middleware
app.use(express.json());

// Alternative to body-parser (built-in with Express)
app.use(express.urlencoded({ extended: true }));

// // Middleware to parse form data
// app.use(bodyParser.urlencoded({ extended: true }));

// connect to db
const {notesDB} = require('./config/database');
notesDB();

//cloud se connect krna h 
const cloudinary = require("./config/cloudinary");
cloudinary.cloudinaryConnect();


// import router and mount
const notesRouter = require('./routers/notesRouter');
app.use('/api/v1', notesRouter);


// activate application
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`)
})

// default router
app.use("/", (req, res) =>{
    res.send('This is Home Page');
})
