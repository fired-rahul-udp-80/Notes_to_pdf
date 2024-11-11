const mongoose = require("mongoose"); 

const Notes = require('../models/createNotes');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");
const axios = require('axios');
require('dotenv').config();

async function uploadFileToCloudinary(filePath, folder) {
    const options = { folder };
    console.log("Temp file path:", filePath);

    options.resource_type = "auto";
    try {
        const response = await cloudinary.uploader.upload(filePath, options);
        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        return false;
    }
}

exports.createNotes = async (req, res) => {
    try {
        const { notesTitle, notes } = req.body;
        if (!notesTitle || !notes) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        const fileName = `${notesTitle.split(" ").join("")}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, 'pdfs', fileName);

        // Ensure the 'pdfs' directory exists
        if (!fs.existsSync(path.join(__dirname, 'pdfs'))) {
            fs.mkdirSync(path.join(__dirname, 'pdfs'));
        }

        // Create PDF with styled content
        const createStyledPDF = () => {
            return new Promise((resolve, reject) => {
                const doc = new PDFDocument();
                doc.pipe(fs.createWriteStream(filePath))
                   .on('finish', () => resolve(filePath))
                   .on('error', reject);

                // Header styling
                doc.fontSize(18).fillColor('#000000').text(notesTitle, { align: 'center' }).moveDown(1);

                // Content styling: line breaks, lists, and colors
                const lines = notes.split('\n'); // Split content by lines to handle line breaks

                lines.forEach((line, index) => {
                    if (line.startsWith('- ')) {
                        // List item style
                        doc.fontSize(12).fillColor('#4a4a4a').text(`• ${line.slice(2)}`, {
                            indent: 20, // Indentation for list items
                        });
                    } else {
                        // Standard line style with paragraph spacing
                        doc.fontSize(12).fillColor('#000000').text(line.trim(), {align:'justify', lineGap: 4 });
                    }

                    // Add extra space between list items and normal text lines
                    if (index < lines.length - 1) {
                        doc.moveDown(0.5);
                    }
                });

                doc.end();
            });
        };

        await createStyledPDF();

        // Upload to Cloudinary
        fs.access(filePath, fs.constants.F_OK, async (err) => {
            if (err) {
                console.error(`${filePath} does not exist or cannot be accessed`, err);
                return res.status(400).json({
                    success: false,
                    message: 'File not found for Cloudinary upload',
                    error: err
                });
            }

            const response = await uploadFileToCloudinary(filePath, "CnotesApplication");
            if (!response) {
                return res.status(500).json({ success: false, message: "Failed to upload to Cloudinary" });
            }

            // Save file details to MongoDB
            const newPdf = new Notes({ fileName, filePath: response.secure_url });
            const DBresponse = await newPdf.save();
            if (!DBresponse) {
                return res.status(400).json({ success: false, message: "Failed to save PDF to MongoDB" });
            }

            // Delete the local file after upload
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Failed to delete local file:", unlinkErr);
                } else {
                    console.log("Local file deleted successfully");
                }
            });

            res.status(201).json({
                success: true,
                message: "PDF created, uploaded, and deleted locally successfully",
                pdfData: DBresponse
            });
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err });
    }
};





exports.getNotes = async(req, res) =>{ 
    try{

        await Notes.find({}).then( d =>{
            res.status(200).json({
                success:true,
                message: "Notes fetched successfully",
                data:d
            })
        }).catch( e =>{
            res.status(400).json({
                success:false,
                message:'Occur problem to fetch notes',
                problem:e
            })
        })
    }
    catch(err){
        console.log(err);
        res.status(400).json({
            success:false,
            message:'Error in fetching notes',
            error:err
        });
    }

}

exports.sendMail = async(req, res) =>{
    try{
        const { id, userEmail } = req.body;  // 'id' should  be in array of id
        console.log(id,userEmail);

        if(id == " " || !userEmail){
            return res.status(400).json({ success: false, message: 'Please provide id and email'});
        };
         
        const attachments = [];
     
        // Fetch and process each ID in the array
        for (const singleId of id) {

            // Check if the ID is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(singleId)) {
                return res.status(400).json({ success: false, message: `Invalid ID format: ${singleId}` });
            }
         
            const pdfData = await Notes.findById(mongoose.Types.ObjectId(singleId));
            if (!pdfData) {
                return res.status(404).json({ success: false, message: `PDF not found for ID: ${singleId}` });
            }

            // Temporary path to save the PDF
            const pdfPath = `./${pdfData.fileName}.pdf`;
             
            // Download the PDF from Cloudinary
            const response = await axios({
                url: pdfData.filePath,
                method: 'GET',
                responseType: 'stream',
            });

            // Save the file locally
            const writer = fs.createWriteStream(pdfPath);
            response.data.pipe(writer);

            // Wait for the file to be completely written
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            // Add the downloaded PDF to attachments
            attachments.push({
                filename: `${pdfData.fileName}.pdf`,
                path: pdfPath, // Local path of the downloaded PDF
            }); 
        }
       
        // set up Nodemailer for gmail
         
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS,
            },
        });
        
        // Email options with PDF attachement
        const mailOptions ={
            from:process.env.EMAIL_USER,
            to:userEmail,
            subject: 'PDF Attachement',
            html : `<p>Please find the attachment PDF document</p>
                    <p>Best regards</p>
                    <p>Maintain By : <strong>Rahul Kumar|| NIU</strong></p>
                    <p>Website : http://itsrahulkumar.netlify.app</p>`,
            attachments,
            
             
            
        };
         
        // Send the email
        const result = await transporter.sendMail(mailOptions);

        // Cleanup: Delete the temporary PDFs after sending
        attachments.forEach((attachment) => {
            fs.unlinkSync(attachment.path);
        });

        if(result){
            return res.status(200).json({
                success:true,
                message: 'Email sent successfully with PDF attachment',
            })
        }

    }catch(err){
        console.log("Error in sending mail");
        return res.status(400).json({
            success: false,
            message: err.message,
        })
    }
}


 
// const { cloudinary } = require('../utils/cloudinary'); // Cloudinary setup file

exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.body;

        // Fetch the note from the database
        const note = await Notes.findById(id);
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        // Delete the file from Cloudinary
        const cloudinaryPublicId = note.filePath.split('/').pop().split('.')[0]; // Extract Cloudinary Public ID
        await cloudinary.uploader.destroy(`CnotesApplication/${cloudinaryPublicId}`, { resource_type: "image" }); // Replace "image" if you used another type

        // Delete from local file system if it exists
        const localFilePath = path.join(__dirname, '../pdfs', note.fileName);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        // Delete the record from MongoDB
        await Notes.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Note and PDF file deleted successfully" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};


