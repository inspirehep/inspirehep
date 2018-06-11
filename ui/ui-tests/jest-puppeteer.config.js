module.exports = {
  server: {
    command: 'node ./server.js',
    port: 8080,
  },
  launch: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};
