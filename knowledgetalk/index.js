const http = require("http");
const https = require("https");
const fs = require("fs");
const trim = require("trim");
const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const mkdirp = require("mkdirp");
const ffmpeg = require("./lib/ffmpeg");
const request = require("request");
const bodyParser = require("body-parser");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.static("upload"));

app.use(bodyParser.urlencoded({ extended: false }));

http.createServer((req, res) => {
   res.writeHead(307, { "Location": "https://" + req.headers['host'] + req.url });
   res.end();
}).listen(80);

// const options = {
//   key: fs.readFileSync("./ssl/knowledgetalk.key"),
//   cert: fs.readFileSync("./ssl/knowledgetalk.pem")
// };

const options = {
  ca: fs.readFileSync("./SSL/ca-bundle.pem"),
  key: fs.readFileSync("./SSL/knowledgepoint.co.kr_20190123E968.key.pem"),
  cert: fs.readFileSync("./SSL/knowledgepoint.co.kr_20190123E968.crt.pem")
};

https.createServer(options, app).listen(443, function() {
  console.log("WebServer Start!!");
});

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/onm", function(req, res) {
  res.redirect("http://knowledgetalk.co.kr:4501");
});

// 190327 ivypark, Temporarily redirect /janus to :3333 (janus test page)
// app.get("/janus", function(req, res) {
//   res.redirect("https://knowledgetalk.co.kr:3333");
// });

app.use("/uploads", express.static("upload"));

const _storage = multer.diskStorage({
  destination: (req, file, callback) => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }
    console.log("###", req.params.roomId);
    today = yyyy + "" + mm + "" + dd;
    let path = `./public/upload/` + today + "/" + req.params.roomId;
    mkdirp(path, function(err) {
      if (err) console.error(err);
      else callback(null, path);
    });
  },
  filename: function(req, file, cb) {
    console.log(file, new Date().valueOf() + path.extname(file.originalname));
    cb(null, new Date().valueOf() + path.extname(file.originalname));
  }
});

const _blobstorage = multer.diskStorage({
  destination: (req, file, callback) => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }
    today = yyyy + "" + mm + "" + dd;
    let path = `./public/upload/` + today + "/" + req.params.roomId;
    mkdirp(path, function(err) {
      if (err) console.error(err);
      else callback(null, path);
    });
  },
  filename: function(req, file, callback) {
    let extname = path.extname(file.originalname);
    if (file.originalname === "blob") {
      extname = ".png";
    }
    callback(null, new Date().valueOf() + extname);
  }
});

const _recordstorage = multer.diskStorage({
  destination: (req, file, callback) => {
    let inputDir = path.join(__dirname, "/public/record/", req.params.recordId);
    mkdirp(inputDir, function(err) {
      if (err) console.error(err);
      else callback(null, inputDir);
    });
  },
  filename: (req, file, callback) => {
    let filePath = path.join(
      __dirname,
      "/public/record/",
      req.params.recordId,
      "recordList.txt"
    );
    let extname;
    fs.exists(filePath, isExist => {
      if (isExist) {
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            throw err;
          }
          extname = `.${data.split("\n").length}.mp4`;
          callback(null, req.params.recordId + extname);
        });
      } else {
        extname = `.1.mp4`;
        callback(null, req.params.recordId + extname);
      }
    });
  }
});

let upload_set = multer({ storage: _storage }).single("uploadFile");
let blob = multer({ storage: _blobstorage }).array("blob", 10);
let record = multer({ storage: _recordstorage }).array("record", 10);

//app.post('/delete_file', upload_set, uploadRouting.delete_file);
//app.post('/upload_pdf', upload_set, uploadRouting.upload_pdf);

// app.post('/upload',upload_set, function (req, res) {
//     console.log(req.file)
// })

app.post("/upload/:roomId", upload_set, function(req, res) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  today = yyyy + "" + mm + "" + dd;

  if (req.file.mimetype == "application/pdf") {
    var sendData = {
      orgname: req.file.originalname,
      roomId: req.params.roomId,
      type: "pdf",
      filename:
        "." +
        "/upload/" +
        today +
        "/" +
        req.params.roomId +
        "/" +
        req.file.filename
    };
    res.send(sendData);
  } else {
    var sendData = {
      orgname: req.file.originalname,
      roomId: req.params.roomId,
      type: "img",
      filename:
        "." +
        "/upload/" +
        today +
        "/" +
        req.params.roomId +
        "/" +
        req.file.filename
    };
    res.send(sendData);
  }
});

app.post("/blob/:roomId", blob, function(req, res) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  today = yyyy + "" + mm + "" + dd;

  var sendData = {
    orgname: req.files[0].originalname + "-" + req.files[0].filename,
    roomId: req.params.roomId,
    type: "img",
    filename:
      "." +
      "/upload/" +
      today +
      "/" +
      req.params.roomId +
      "/" +
      req.files[0].filename
  };
  res.send(sendData);
});

app.post("/record/:recordId", record, function(req, res) {
  let inputDir = path.join(__dirname, "/public/record/", req.params.recordId);
  let inputPath = path.join(inputDir, req.params.recordId);
  let listPath = path.join(inputDir, "recordList.txt");
  let inputText;

  mkdirp(inputDir, err => {
    if (err) {
      throw err;
    }
    fs.exists(listPath, isExist => {
      if (isExist) {
        fs.readFile(listPath, "utf8", (err, data) => {
          if (err) {
            throw err;
          }
          inputText = `File './${req.params.recordId}.${
            data.split("\n").length
          }.mp4'\n`;

          fs.appendFile(listPath, inputText, "utf8", err => {
            if (err) {
              throw err;
            }
            // ffmpeg.merge()
            res.send("rec upload\n" + inputText);
          });
        });
      } else {
        inputText = `File './${req.params.recordId}.1.mp4'\n`;
        fs.writeFile(listPath, inputText, "utf8", err => {
          if (err) {
            throw err;
          }
          // ffmpeg.merge()
          res.send("rec upload\n" + inputText);
        });
      }
    });
  });
});

app.get("/record/:recordId", (req, res) => {
  let filePath = path.join(
    __dirname,
    "/public/record/",
    req.params.recordId,
    "recordList.txt"
  );
  fs.exists(filePath, isExist => {
    if (isExist) {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          throw err;
          res.status(404).end();
        }
        records = data.split("\n");
        records.length = records.length - 1;
        res.send(records);
      });
    } else {
      res.status(404).end();
    }
  });
});

app.post("/chat/:chatId", (req, res) => {
  let inputDir = path.join(__dirname, "/public/chat/", req.params.chatId);
  let inputPath = path.join(inputDir, req.params.chatId);
  let listPath = path.join(inputDir, "chatLogs.txt");
  let inputText = JSON.stringify(req.body.chats);

  mkdirp(inputDir, err => {
    if (err) {
      throw err;
      res.status(404).end();
    }
    fs.writeFile(listPath, inputText, "utf8", err => {
      if (err) {
        throw err;
        res.status(404).end();
      }
      // ffmpeg.merge()
      res.send("chat upload");
    });
  });
});

app.get("/chat/:chatId", (req, res) => {
  let filePath = path.join(
    __dirname,
    "/public/chat/",
    req.params.chatId,
    "chatLogs.txt"
  );
  fs.exists(filePath, isExist => {
    if (isExist) {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          throw err;
          res.status(404).end();
        }
        res.send(data);
      });
    } else {
      res.status(404).end();
    }
  });
});

// const captcha_url = "https://openapi.naver.com/v1/captcha/";
// const client_id = '8WK22SpuFAXrkppQvbg2';
// const client_secret = '6MNhqHR89c';
// const api_headers = {
//     'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret
// }

// app.get('/captcha/nkey', function (req, res) {
//     let api_url = captcha_url + 'nkey?code=0';
//     let options = {
//         url: api_url,
//         headers: api_headers
//     };
//     request.get(options, function (err, response, body) {
//         if (err) {
//             console.log(``,err);
//             res.status(response.statusCode).end();
//         }
//         if (response.statusCode == 200) {
//             res.send(body);
//         }
//     });
// });

// app.get('/captcha/image/:key', function (req, res) {
//     let api_url = captcha_url + 'ncaptcha.bin?key=' + req.params.key;
//     let options = {
//         url: api_url,
//         headers: api_headers
//     };
//     request.get(options).pipe(res);
// });

// app.get('/captcha/result/:key/:value', function (req, res) {
//     var api_url = 'https://openapi.naver.com/v1/captcha/nkey?code=1&key=' + req.params.key + '&value=' + req.params.value;
//     var options = {
//         url: api_url,
//         headers: api_headers
//     };
//     request.get(options, function (err, response, body) {
//         if (err) {
//             console.log(err);
//             res.status(response.statusCode).end();
//         }
//         if (response.statusCode == 200) {
//             res.send(body);
//         }
//     });
// });
