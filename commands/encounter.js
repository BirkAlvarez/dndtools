'use strict';

const _ = require('lodash');
const fs = require('fs');
const mdPdf = require('markdown-pdf');
const Table = require('easy-table');
const marked = require('marked');
const TerminalRenderer = require('marked-terminal');

const {monstersByName, monstersByCr} = require('../lib/monsters');
const {PAGEBREAK, mdOptions} = require('../config');

marked.setOptions({
  // Define custom renderer
  renderer: new TerminalRenderer()
});


module.exports = {
  cmd: 'encounter [monsters...]',
  autocomplete: _.keys(monstersByName),
  description: 'Generate a random set of encounters',
  options: [
    {
      flag: '-n, --number <number>',
      description: 'Number of encounters to generate (default 1)',
    },
    {
      flag: '-p, --players <player_count>',
      description: 'Number of players (default 4)',
    },
    {
      flag: '-d, --difficulty <difficulty>',
      description: 'Difficulty',
      autocomplete: ['easy', 'medium', 'hard', 'deadly'],
    },
    {
      flag: '-l, --level <level>',
      description: 'Average Player Level (default 1)',
    },
    {
      flag: '-t, --terrain <terrain>',
      description: 'Filter by terrain',
      autocomplete: ['snow', 'swamp', 'cave', 'grass', 'mountain'],
    },
    {
      flag: '-m, --matrix',
      description: 'Create an encounter matrix by level and difficulty',
    },
    {
      flag: '-s, --save',
      description: 'Save To Encounter Folder?',
    },
    {
      flag: '--save-options',
      description: 'Save these options and use them as the defaults for the current session (does not generate encounter)',
    },
  ],
  action: createEncounter
};

function createEncounter(args, fn) {
  const encounter = {
  };
  console.log('Generating Encounter');
  //console.log(args);
  args.monsters.forEach((monster) => {
    console.log(marked(monstersByName[monster].description));
  });
  fn();
}
