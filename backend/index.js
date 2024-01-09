// server.js
const express = require('express');
const ffmpeg = require('ffmpeg');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');

app.use(bodyParser.json());
app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());

app.post('/upload',upload.single('audio'),async (req,res) => {
  try {
    const base64Audio = req.body.audio;
    const audioBuffer = Buffer.from(base64Audio,'base64');

    console.log(base64Audio);



    const fileName = `audio-${Date.now()}.mp3`;
    // // Save the uploaded audio as a WAV file
    // fs.writeFile(`./public/${fileName}`,audioBuffer,(err) => {
    //   if (err)
    //     console.log(err);
    //   else {
    //     console.log("File written successfully\n");
    //     console.log("The written has the following contents:");
    //     console.log(fs.readFileSync("books.txt","utf8"));
    //   }
    // });

    try {
      const file = fs.createWriteStream(`./public/${fileName}`);
      file.write(base64Audio,'base64');
      file.end();
    } catch (error) {
      console.log(error);
    }


    // Convert the WAV file to MP3
    ffmpeg(`./public/${fileName}`)
      .audioCodec('libmp3lame')
      .toFormat('mp3')
      .on('end',() => {
        console.log('Conversion finished.');

        // Send the converted MP3 file to the client
        const mp3FilePath = `./public/${fileName.replace('.wav','.mp3')}`;
        const mp3Buffer = fs.readFileSync(mp3FilePath);
        res.contentType('audio/mp3');
        res.send(mp3Buffer);
      })
      .on('error',(err) => {
        console.error('Error:',err);
        res.status(500).json({ error: 'Error converting audio to MP3' });
      })
      .save(`./public/${fileName.replace('.wav','.mp3')}`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT,() => {
  console.log(`Server is running on port ${PORT}`);
});
