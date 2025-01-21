const fs = require('fs');

const log = (message) => {
  fs.appendFile('log.txt', `${new Date()}: ${message}\n`, (err) => {
    if (err) console.error(err);
  });
};

module.exports = { log };