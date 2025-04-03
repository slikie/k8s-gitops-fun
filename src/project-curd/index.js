const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 23224;
const IMAGE_DIR = path.join(__dirname, 'images');
const METADATA_FILE = path.join(IMAGE_DIR, 'image_metadata.json');

// Function to get current hour
function getCurrentHour() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
}

// Function to read metadata
async function readMetadata() {
  try {
    const metadataContent = await fs.readFile(METADATA_FILE, 'utf8');
    return JSON.parse(metadataContent);
  } catch (error) {
    return {};
  }
}

// Function to write metadata
async function writeMetadata(metadata) {
  await fs.mkdir(IMAGE_DIR, { recursive: true });
  await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

// Function to download image
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

// Serve the image for current hour
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


app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started in port ${PORT}`);
});
