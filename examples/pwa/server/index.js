const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../client')));
// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Route to handle image upload
app.post('/upload', (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'No image provided.' });
    }

    // Extract the Base64 part of the data URL
    // const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(image, 'base64');

    // Save the image to disk
    const filename = `image_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, 'uploads', filename);

    // Ensure the uploads directory exists
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
    }

    fs.writeFile(filepath, buffer, (err) => {
        if (err) {
            console.error('Failed to save image:', err);
            return res.status(500).json({ error: 'Failed to save image.' });
        }

        console.log('Image saved:', filename);
        res.json({ message: 'Image uploaded successfully!', filename });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});