/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

class ImageSnapshotDiffReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  // eslint-disable-next-line class-methods-use-this
  onTestResult(test, testResult) {
    if (
      process.env.CI &&
      testResult.numFailingTests &&
      testResult.failureMessage.match(/different from snapshot/)
    ) {
      const parsedTestPath = path.parse(test.path);
      const diffOutputDir = path.join(
        parsedTestPath.dir,
        '__image_snapshots__',
        '__diff_output__'
      );
      const dasherizedTestFileName = parsedTestPath.base.replace(/\./g, '-');
      const diffFilePaths = fs
        .readdirSync(diffOutputDir)
        .filter(file => file.startsWith(dasherizedTestFileName));
      diffFilePaths.forEach(diffFilePath => {
        const diffAsBase64 = fs
          .readFileSync(path.join(diffOutputDir, diffFilePath))
          .toString('base64');
        console.log(`BASE64 for ${diffFilePath}:`);
        console.log(diffAsBase64);
        console.log('===========================');
      });
    }
  }
}

module.exports = ImageSnapshotDiffReporter;
