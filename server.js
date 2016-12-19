const _ = require('lodash');
const vorpal = require('vorpal')();
const bulk = require('bulk-require');
const commands = bulk(`${__dirname}/commands`, ['*.js']);

_.forEach(commands, (options) => {
  const cmd = vorpal.command(options.cmd, options.description)

  if (options.autocomplete) {
    cmd.autocomplete(options.autocomplete);
  }

  if (options.options) {
    options.options.forEach((commandOption) => {
      let {flag, description, autocomplete} = commandOption;
      cmd.option(flag, description, autocomplete);
    });
  }

  cmd.action(options.action);
});

vorpal
  .delimiter('DnD Tools >>')
  .show();
