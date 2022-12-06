const chalk = require('chalk');

module.exports = {
  write(msg, type = 'info') {
    if (type == 'error') {
      msg = chalk.red('ERROR: ') + msg;
    } else if (type == 'ok') {
      msg = chalk.green('OK: ') + msg;
    } else {
      msg = chalk.cyan(type.toUpperCase() + ': ') + msg;
    }

    console.log(msg);
  }
};
