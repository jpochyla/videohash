exports.fromFile = hashFromFile;

function hashFromFile(file, cb){
  var hash = new Hash();
  var chunksz = 65535;

  hash.size(file.size);
  head(function(){
    tail(function(){
      hash.rollup();
      cb(hash.hex());
    });
  });

  function head(cb){
    chunk(0, chunksz, cb);
  }

  function tail(cb){
    chunk(file.size < chunksz ? 0 : file.size - chunksz, file.size, cb);
  }

  function chunk(start, end, cb){
    readBytes(file, start, end, function(bytes){
      hash.chunk(bytes);
      cb();
    });
  }
}

function readBytes(file, start, end, cb){
  var reader = new FileReader();
  var slice = file.webkitSlice || file.mozSlice || file.slice;
  var blob = slice.call(file, start, end);
  reader.onload = function(ev){
    cb(ev.target.result);
  };
  reader.readAsBinaryString(blob);
}

function Hash(){
  this.buf = new Array(8);
}

Hash.prototype.size = function(size){
  var b = this.buf;
  for (var i = 0; i < 8; i++, size >>= 8) {
    b[i] = size & 0xFF;
  }
};

Hash.prototype.chunk = function(chunk){
  for (var i = 0, len = chunk.length; i < len; i++) {
    this.buf[i % 8] += chunk.charCodeAt(i);
  }
};

Hash.prototype.rollup = function(){
  for (var i = 0, b = this.buf; i < 8; i++) {
    if (i < 7) b[i + 1] += b[i] >> 8;
    b[i] = b[i] & 0xFF;
  }
};

Hash.prototype.hex = function(){
  var str = '';
  for (var i = 7; i >= 0; i--) {
    str += this.buf[i].toString(16);
  }
  return str;
};
