# EditMetaDataAPI

### 5. README.md:

# ExifTool API

Dies ist eine einfache REST API, die das Hinzufügen von Metadaten zu Bilddateien ermöglicht.
Die API läuft in einem Docker-Container und verwendet das ExifTool, um die Metadaten zu schreiben.

## Voraussetzungen
- Docker und Docker Compose müssen installiert sein.

## Installation und Ausführung
1. Klonen Sie das Repository:
   bash
   git clone https://github.com/LarsAPI/EditMetaDataAPI
   cd EditMetaDataAPI
   

3. Starten Sie die Anwendung:
   bash
   docker compose up -d
   

4. Die API sollte nun auf `http://editmetadataapi.linala.de/upload` laufen.

## API Endpunkte
- **POST /upload**: Ermöglicht das Hochladen einer Bilddatei und das Hinzufügen von Metadaten.
  - **Parameter**:
    - `image`: Die hochzuladende Bilddatei (erforderlich).
    - `artist`, `copyright`, `title`, `description`, `copyright`, `keywords`: Optional - die Metadaten, die zur Bilddatei hinzugefügt werden sollen.
   
- **Image Formats**
  - PNG
  - JPEG

## Beispiel
Verwenden Sie `curl`, um eine Anfrage zu senden:
bash
curl -X POST -F "image=@/path/to/your/image.jpg" -F "artist=Dein Name" -F "copyright=2024, Dein Name" -F "title=Bildtitel" http://editmetadataapi.linala.de/upload

