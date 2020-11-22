//https://vk.com/dev/upload_files

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

async function sendPhoto() {
  const id_group = process.env.IDGROUP;
  const token_vk = process.env.TOKEN;

  let formData = new FormData();

  //call method photos.getWallUploadServer to get the link for upload photo
  const uploadServer = await axios.get('https://api.vk.com/method/photos.getWallUploadServer', {
    params: {
      group_id: id_group,
      access_token: token_vk,
      v: '5.126',
    },
  });

  //create the stream from filysystem
  const stream = fs.createReadStream(`${__dirname}/image.jpg`);

  //creating an image in the format multipart/form-data.
  formData.append('photo', stream);

  let resUplServ = await axios.post(uploadServer.data.response.upload_url, formData, {
    headers: formData.getHeaders(),
  });
  //upload an image to the server. Get JSON-object.
  const arrayPhoto = await axios.get('https://api.vk.com/method/photos.saveWallPhoto', {
    params: {
      group_id: id_group,
      photo: resUplServ.data.photo,
      server: resUplServ.data.server,
      hash: resUplServ.data.hash,
      access_token: token_vk,
      v: '5.126',
    },
  });

  //field for text in the post
  const message = 'anything text';
  //creating the correct link for the request
  const ownerPart = arrayPhoto.data.response[0].owner_id;
  const idPart = arrayPhoto.data.response[0].id;
  const accessPart = arrayPhoto.data.response[0].access_key;
  const attachments = { media_id: `photo${ownerPart}_${idPart}_${accessPart}` };

  //send to the public group
  const wallPost = await axios.get('https://api.vk.com/method/wall.post', {
    params: {
      owner_id: `-${id_group}`,
      from_group: 1,
      message: message,
      attachments: attachments.media_id,
      access_token: token_vk,
      v: '5.126',
    },
  });
}

sendPhoto();
