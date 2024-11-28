### 4. index.js:
```javascript
const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// POST endpoint to upload an image and add metadata
app.post('/upload', upload.single('image'), (req, res) => {
  const { file } = req;
  const { artist, copyright, title } = req.body;

  if (!file) {
    return res.status(400).send('Keine Bilddatei hochgeladen');
  }

  const metadata = {
    Artist: artist || 'Unbekannt',
    Copyright: copyright || '2024, Unbekannt',
    Title: title || 'Bildtitel'
  };

  const metadataArgs = Object.entries(metadata)
    .map(([key, value]) => `-${key}="${value}"`)
    .join(' ');

  const command = `exiftool ${metadataArgs} "${file.path}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Fehler: ${error.message}`);
      return res.status(500).send(`Fehler beim Hinzufügen von Metadaten: ${error.message}`);
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).send(`Fehler beim Hinzufügen von Metadaten: ${stderr}`);
    }
    res.send({ message: 'Metadaten wurden erfolgreich hinzugefügt', filePath: file.path });
  });
});

// Start server
app.listen(port, () => {
  console.log(`ExifTool API läuft auf Port ${port}`);
});
```
