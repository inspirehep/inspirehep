const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const appVersion = require('./package.json').version;

const versionFilePath = path.join(__dirname + '/src/environments/version.ts');

const versionFileContent = `export const version = '${appVersion}';
`;

fs.writeFile(versionFilePath, versionFileContent, { flat: 'w' }, (error) => {
  if (error) {
    return console.log(colors.red(error));
  }
});