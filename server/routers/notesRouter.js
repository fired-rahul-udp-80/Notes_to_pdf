const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

// import controllers
const {createNotes,getNotes,deleteNote,sendMail
} = require('../controllers/createNotesController');

router.post('/createNotes',upload.none(),createNotes);
router.get('/getNotes',getNotes);
router.delete('/deleteNotes',deleteNote);

router.post('/sendMail',sendMail);
 

module.exports = router;