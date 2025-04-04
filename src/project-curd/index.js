const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const IMAGE_DIR = "/app/images/"
const METADATA_FILE = path.join(IMAGE_DIR, 'image_metadata.json');

function getCurrentHour() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
}

async function readMetadata() {
  try {
    const metadataContent = await fs.readFile(METADATA_FILE, 'utf8');
    return JSON.parse(metadataContent);
  } catch (error) {
    return {};
  }
}

async function writeMetadata(metadata) {
  await fs.mkdir(IMAGE_DIR, { recursive: true });
  await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

async function downloadImage(hour) {
  try {
    const response = await axios({
      method: 'get',
      url: 'https://picsum.photos/1200',
      responseType: 'arraybuffer'
    });

    await fs.mkdir(IMAGE_DIR, { recursive: true });

    const filename = `image_${hour}.jpg`;
    const filepath = path.join(IMAGE_DIR, filename);

    await fs.writeFile(filepath, response.data);

    // Update metadata
    const metadata = await readMetadata();
    metadata[hour] = filename;
    await writeMetadata(metadata);

    console.log(`Downloaded image for hour: ${hour}`);
    return filename;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

app.get('/pic', async (req, res) => {
  try {
    const currentHour = getCurrentHour();
    const metadata = await readMetadata();

    // Check if image exists for current hour
    let filename = metadata[currentHour];
    
    if (!filename) {
      // Download new image if not exists
      filename = await downloadImage(currentHour);
    }

    if (!filename) {
      return res.status(500).send('Failed to get image');
    }

    const imagePath = path.join(IMAGE_DIR, filename);
    
    // Check if file exists
    await fs.access(imagePath);
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(404).send('Image not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
