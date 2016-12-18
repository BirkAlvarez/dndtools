const _ = require('lodash');
const vorpal = require('vorpal')();
const bulk = require('bulk-require');
const commands = bulk(`${__dirname}/commands`, ['*.js']);

_.forEach(commands, (options, command) => {
  vorpal
    .command(command, options.description)
    .action(options.action);
});

vorpal
  .delimiter('DnD Tools >>')
  .show();
