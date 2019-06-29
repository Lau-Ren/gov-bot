module.exports = function (str) {
    return str.split(',').map((str) => str.trim()).reverse().join(' ');
  }