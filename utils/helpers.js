const fs = require("fs");
const crypto = require("crypto");

module.exports = {
  loadFrom: (name, path) => {
    // loads modules from dir to global namespace
    let elements = fs.readdirSync(`${global.basepath}/${path}`);
    global[name] = elements.reduce((acc, elem) => {
      let elemName = elem.replace(".js", "");
      acc[elemName] = require(`${global.basepath}/${path}/${elem}`);
      return acc;
    }, {});
  },
  randomString: length => crypto.randomBytes(length).toString("hex"),

  randomNumber: (min, max) => Math.floor(Math.random() * (max - min)) + min,

  encryptCode: val => new Buffer(val).toString('base64'),

  decryptCode: val => new Buffer(val, 'base64').toString('ascii')
};
