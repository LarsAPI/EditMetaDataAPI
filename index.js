const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// POST endpoint to upload an image and add metadata
app.post('/upload', upload.single('image'), (req, res) => {
  const { file } = req;
  const { artist, copyright, title, keywords } = req.body;

  if (!file) {
    return res.status(400).send('Keine Bilddatei hochgeladen');
  }

const metadata = {
  Artist: artist || 'Unbekannt',
  Copyright: copyright || '2024, Unbekannt',
  Title: title || 'Bildtitel',
  Subject: keywords || '' // XMP-Standard für Keywords
};

  const metadataArgs = Object.entries(metadata)
    .map(([key, value]) => `-${key}="${value}"`)
    .join(' ');

  const originalFilePath = file.path;
  const newFilePath = path.join('uploads', file.originalname);

  const command = `exiftool ${metadataArgs} -overwrite_original -tagsFromFile @ -xmp:all "${originalFilePath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Fehler: ${error.message}`);
      return res.status(500).send(`Fehler beim Hinzufügen von Metadaten: ${error.message}`);
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).send(`Fehler beim Hinzufügen von Metadaten: ${stderr}`);
    }

    fs.rename(originalFilePath, newFilePath, (renameError) => {
      if (renameError) {
        console.error(`Fehler beim Umbenennen der Datei: ${renameError.message}`);
        return res.status(500).send(`Fehler beim Umbenennen der Datei: ${renameError.message}`);
      }

      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(newFilePath)}`;
      res.send({ message: 'Metadaten wurden erfolgreich hinzugefügt', fileUrl });
    });
  });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(port, () => {
  console.log(`ExifTool API läuft auf Port ${port}`);
});
