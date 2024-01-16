// server.js
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: "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" });


const upload = multer({ dest: "/public" });

app.post('/upload',upload.single('audio'),async (req,res) => {
  try {
    const fileName = Date.now() + req.file.originalname;

    fs.renameSync(req.file.path,fileName);

    const audioFile = fs.createReadStream(`${fileName}`);
    const transcription = await crateTranscription(audioFile);
    console.log(transcription);
    if (!transcription) {
      throw new Error("Transcription failed");
    }
    return res.status(200).json({ message: "File received" });

    // const decodedData = Buffer.from(base64data.split(",")[1],'base64');

    // decodedDataString = decodedData.toString();

    // const arrayBuffer = new ArrayBuffer(decodedData.length);

    // const view = new Uint8Array(arrayBuffer);

    // for (let i = 0; i < decodedData.length; i++) {
    //   view[i] = decodedDataString.charCodeAt(i);
    // }
    // if (view.byteLength > 0) {
    //   const sampleRate = 44100;
    //   writeUint8ArrayToMP3(view,`./public/output.mp3`,sampleRate);
    // }

    // try {
    //   fs.createWriteStream(`./public/${fileName}`);
    //   fs.writeFileSync(`./public/${fileName}`,view);
    //   // const content = fs.createReadStream(`./public/${fileName}`);

    //   // content.on("data",(chunkData) => {
    //   //   console.log(chunkData);
    //   // });

    //   // content.on("end",() => {
    //   //   console.log("Nothing to read");
    //   // });
    //   // console.log(content);
    // } catch (error) {
    //   console.log(error);
    // }


    // const blob = new Blob([arrayBuffer],{ type: 'audio/mp3' });

    // console.log(base64data);

    // const audioFile = await uploadAudioToCloudinary(base64data);
    // console.log(audioFile);
    // if (!audioFile) {
    //   throw new Error("Audio File not available");
    // }


    // const audioBuffer = Buffer.from(base64Audio,'base64');
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



    // fs.writeFileSync(`./public/${fileName}`,buffer);
    // fs.writeFileSync(`./public/${fileName}`,base64Audio);



    // Convert the WAV file to MP3
    // ffmpeg(`./public/${fileName}`)
    //   .audioCodec('libmp3lame')
    //   .toFormat('mp3')
    //   .on('end',() => {
    //     console.log('Conversion finished.');

    //     // Send the converted MP3 file to the client
    //     const mp3FilePath = `./public/${fileName.replace('.wav','.mp3')}`;
    //     const mp3Buffer = fs.readFileSync(mp3FilePath);
    //     res.contentType('audio/mp3');
    //     res.send(mp3Buffer);
    //   })
    //   .on('error',(err) => {
    //     console.error('Error:',err);
    //     res.status(500).json({ error: 'Error converting audio to MP3' });
    //   })
    //   .save(`./public/${fileName.replace('.wav','.mp3')}`);


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// function writeUint8ArrayToMP3(uint8Array,outputFilePath,sampleRate,channels) {
//   const encoder = new lame.Encoder({
//     channels: channels || 2, // Specify the number of audio channels (default is 2)
//     bitDepth: 16, // Specify the bit depth (default is 16)
//     sampleRate: sampleRate || 44100, // Specify the sample rate (default is 44100 Hz)
//     bitRate: 192 // Specify the bit rate (default is 192 kbps)
//   });

//   const writableStream = fs.createWriteStream(outputFilePath);

//   // Pipe the Uint8Array to the encoder and then to the file
//   encoder.pipe(writableStream);
//   encoder.end(Buffer.from(uint8Array));

//   writableStream.on('finish',() => {
//     console.log(`MP3 file written to ${outputFilePath}`);
//   });
// }


function uploadAudioToCloudinary(audio) {
  return new Promise((resolve,reject) => {
    cloudinary.uploader.upload(audio,{
      resource_type: "video",transformation: [
        { audio_codec: "mp3",bit_rate: "44k" }
      ]
    },function (error,result) {
      if (result && result.secure_url) {
        return resolve(result.secure_url);
      }
      return reject(error);
    });
  });
}

function crateTranscription(audioFile) {
  return new Promise((resolve,reject) => {
    openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    }),function (error,result) {
      if (result && result.text) {
        return resolve(result.text);
      }
      return reject(error);
    };
  });
}


app.listen(PORT,() => {
  console.log(`Server is running on port ${PORT}`);
});
