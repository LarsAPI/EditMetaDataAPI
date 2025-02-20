const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware für Header-Authentifizierung
const authenticate = (req, res, next) => {
  const authHeader = req.headers['x-api-key']; // Auth-Token aus dem Header auslesen
  const API_KEY = 'mein_geheimes_token'; // Setze hier deinen API-Schlüssel

  if (!authHeader || authHeader !== API_KEY) {
    return res.status(403).json({ message: 'Zugriff verweigert. Ungültiger API-Schlüssel.' });
  }

  next(); // Weiter zum nächsten Middleware oder Endpunkt
};

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Funktion zum Löschen alter Dateien
const deleteOldFiles = () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const now = Date.now();
  const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 Tage in Millisekunden

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return console.error(`Fehler beim Lesen des Upload-Ordners: ${err.message}`);
    }

    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          return console.error(`Fehler beim Abrufen der Dateiinformationen: ${err.message}`);
        }

        if (now - stats.mtimeMs > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              return console.error(`Fehler beim Löschen der Datei ${file}: ${err.message}`);
            }
            console.log(`Datei ${file} wurde gelöscht (älter als 3 Tage).`);
          });
        }
      });
    });
  });
};

// Löschen alter Dateien alle 24 Stunden
setInterval(deleteOldFiles, 24 * 60 * 60 * 1000);

// POST endpoint to upload an image and add metadata
app.post('/upload', authenticate, upload.single('image'), (req, res) => {
  const { file } = req;
  const { artist, copyright, title, keywords, description } = req.body;

  if (!file) {
    return res.status(400).send('Keine Bilddatei hochgeladen');
  }

  const metadata = {
    'XMP-dc:Title': title || 'Bildtitel',
    'XMP-dc:Creator': artist || 'Unbekannt',
    'XMP-dc:Description': description || '',
    'XMP-dc:Rights': copyright || '2024, Unbekannt',
    'XMP-dc:Subject': keywords ? keywords.split(',').map(kw => kw.trim()) : []
  };

  const metadataArgs = Object.entries(metadata)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `-${key}="${value.join(', ')}"`;
      }
      return `-${key}="${value}"`;
    })
    .join(' ');

  const originalFilePath = file.path;
  const newFilePath = path.join('uploads', file.originalname);

  const command = `exiftool ${metadataArgs} -overwrite_original "${originalFilePath}"`;

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
