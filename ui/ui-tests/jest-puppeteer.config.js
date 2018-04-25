module.exports = {
  server: {
    command: 'http-server ../build',
    port: 8080,
  },
  launch: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  },
};
