const stream = require('stream');
const fs = require('fs');
const {BrotliDecompress} = require('brotli/dec/decode');

const unbr = (srcPaths, dstPath) => {
  if (!Array.isArray(srcPaths)) {
    srcPaths = [srcPaths];
  }
  let index = 0;

  let fd = null;
  const rs = new stream.Readable();
  rs.read = (buf, i, count) => {
    if (fd === null) {
      if (index < srcPaths.length) {
        fd = fs.openSync(srcPaths[index]);
      }
    }
    const bytesRead = fs.readSync(fd, buf, i, count);
    if (bytesRead > 0) {
      pos += bytesRead;
      return bytesRead;
    } else {
      fs.closeSync(fd);
      fd = null;
      index++;
      return rs.read(buf, i, count);
    }
  };
  const ws = new stream.Writable();
  ws.buffer = new Uint8Array(0);
  const fd2 = fs.openSync(dstPath, 'w');
  ws.write = (buf, count) => {
    fs.writeSync(fd2, buf, 0, count);
    return count;
  };

  BrotliDecompress(rs, ws);
  fs.closeSync(fd2);
};
module.exports = unbr;
