const log = require('./index'); // change to require('updatable-log')
const chalk = require('chalk');
const delay = require('delay');

async function run() {
  log.info(chalk.blue('running with quiet = false'));
  await exampleApp({ quiet: false });

  log.info();

  log.info(chalk.blue('running with quiet = true'));
  await exampleApp({ quiet: true });
}

async function exampleApp({ quiet }) {
  // ignore logging, except from log.important() and log.error()
  log.quiet = quiet;

  log.info(chalk.green('E X A M P L E - A P P'));
  log.info('v1.2.0');

  for (let page = 0; page < 40; page++) {
    await fetchData(page);
  }

  log.clear();
  console.log('call log.clear() before printing with the built-in console.log()');

  try {
    printResult();
  } catch (e) {
    log.error(e);
  }
}

async function fetchData(page) {
  log.update('fetching data from:', `http://get-data.com?page=${page}`);
  await delay(100);

  if (page === 10) {
    log.warn('invalid data, skipping page', page);
  }
}

function printResult() {
  log.important(
    JSON.stringify(
      {
        age: 6,
        name: 'Ender Wiggin',
      },
      null,
      2
    )
  );

  this.willThrow.a.null.pointer.exception();
}

run();
