const fs = require('fs');
const path = require("path");
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

// Configuring Cloudinary 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// The actual middleware dealing with the uploading
const uploadToCloudinary = async (req, res, next) => {
    try {
        // Parsing the references from the request body
        const references = JSON.parse(req.body.references);

        //Removing the references from the request body 
        delete req.body.references;

        // Creating an object with the document type as the key, and the the file as the value
        const files = {};
        
        for(const documentType in references){
            files[documentType] = (Array.from(req.files).filter((file)=> file.originalname === references[documentType]))[0]
        }
        
        // Looping through each documentType:file pair
        for (const documentType in files) {

            // Getting the file from the pair
            const file = files[documentType];

            // Making a temporary file to upload it to Cloudinary
            const tempFilePath = path.join(__dirname, `../temp/${file.originalname}`); 

            // Writing the file buffer to the temporary file
            await writeFileAsync(tempFilePath, file.buffer);

            // Uploading the file to Cloudinary and storing the return URL in the request 
            const result = await cloudinary.uploader.upload(tempFilePath, {timeout:120000}); 
            req.body[documentType] = result.secure_url; 

            // Deleting the temporary local file after upload
            fs.unlinkSync(tempFilePath);
        }
        
        next();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "File upload failed", error: `Error: ${err}` });
    }
};

module.exports = uploadToCloudinary;
