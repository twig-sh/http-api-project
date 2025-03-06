const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const documentation = fs.readFileSync(`${__dirname}/../client/documentation.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const getIndex = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(index, 'utf-8'),
  });

  res.write(index);
  res.end();
};

const getDocumentation = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(documentation, 'utf-8'),
  });

  res.write(documentation);
  res.end();
};

const getCSS = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/css',
    'Content-Length': Buffer.byteLength(css, 'utf-8'),
  });

  res.write(css);
  res.end();
};

module.exports = {
  getIndex,
  getDocumentation,
  getCSS,
};
