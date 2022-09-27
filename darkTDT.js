var express = require('express');
var fs = require('fs');
var path = require('path');
var axios = require('axios');
const jimp = require('jimp');
var app = express();

app.use(express.static('public'));
app.get('/', function (req, res) {
  res.send('123');
});
app.get('/vec_c/wmts', async function (req, res) {
  // const host = req.hostname;
  // const subdomain = host.split('.')[0];
  const url = `http://t4.tianditu.gov.cn${req.url}`;
  const params = req.query;
  if (!params.TILEMATRIX) {
    res.send('参数缺失！');
    return;
  }
  const imageName = `${params.LAYER}_${params.TILEMATRIX}_${params.TILEROW}_${params.TILECOL}`;
  let savePath = `/images/${imageName}.png`;
  const imagePath = path.join(__dirname + savePath);
  res.set('content-type', { png: 'image/png', jpg: 'image/jpeg' });
  if (fs.existsSync(imagePath)) {
    console.log('exist');
    passImage(res, imagePath);
  } else {
    await saveImage(url, imagePath, res);
    passImage(res, imagePath);
  }
});

var server = app.listen(1234, function () {
  console.log('start');
});

async function saveImage(url, savePath, res) {
  console.log('download');
  const controller = new AbortController();
  try {
    let response = await axios({
      method: 'get',
      // url: decodeURIComponent(url),
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });
    if (response.status === 200 && response.data) {
      let image = await jimp.read(response.data);
      // images3
      await image.invert();
      await image
        .color([
          { apply: 'hue', params: [180] },
          { apply: 'mix', params: ['#003350', 35] },
        ])
        .writeAsync(savePath);
    }
  } catch {
    console.log('wrong');
    res.set({ 'content-type': 'text/plain' });
    res.send('token超出限制，请求失败！');
  }

  //images
  // await image.invert();
  // await image.sepia();
  // await image.color([{ apply: 'hue', params: [180] }]).writeAsync(savePath, (error) => {
  //     console.log(error);
  //   });

  // images1
  // await image.invert();
  // await image
  //   .color([{ apply: 'hue', params: [180] }])
  //   .writeAsync(savePath, (error) => {
  //     console.log(error);
  //   });

  // images2
  // await image.invert();
  // await image
  //   .color([
  //     { apply: 'hue', params: [180] },
  //     { apply: 'mix', params: ['blue', 20] },
  //   ],(err)=>{
  //     console.log(err)
  //   })
  //   .writeAsync(savePath, (error) => {
  //     // console.log(error);
  //   });
}

function passImage(res, imgPath) {
  if (fs.existsSync(imgPath)) {
    res.sendFile(imgPath);
  }
}
