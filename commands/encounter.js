'use strict';

const _ = require('lodash');
const fs = require('fs');
const mdPdf = require('markdown-pdf');
const Table = require('easy-table');
const marked = require('marked');
const TerminalRenderer = require('marked-terminal');

const {monstersByName, monstersByCr, monstersByEnvAndCr} = require('../lib/monsters');
const {PAGEBREAK, mdOptions} = require('../config');
const environments = _.keys(monstersByEnvAndCr);
const possibleDifficulties = ['easy', 'medium', 'hard', 'deadly'];
const difficultyWeights = {
  easy:   30,
  medium: 40,
  hard:   25,
  deadly: 5,
};
const difficultyCounts = [];

_.forEach(difficultyWeights, (weight, difficulty) => {
  for (let i = 0; i < weight; i++) {
    difficultyCounts.push(difficulty);
  }
});

const challengMultiplier = [
  // 1 Monster
  1,
  // 2 Monsters
  1.5,
  // 3-6 Monsters
  2, 2, 2, 2,
  // 7-10 Monsters
  2.5, 2.5, 2.5, 2.5,
  // 11-14 Monsters
  3, 3, 3, 3,
  // 15+ Monsters
  4, 4, 4, 4, 4, 4
];

const monsterCountWeights = [
  // 1
  250,
  // 2
  200,
  // 3-6 Monsters (45%)
  150, 100, 50, 50,
  // 7-10 Monsters (10%)
  10, 10, 5, 5,
  // 11-14 Monsters (5%)
  5, 3, 2, 1,
  // 15+ Monsters (5%)
  1, 1, 1, 1, 1, 1
];
const monsterCounts = []

for (let i = 0; i < monsterCountWeights.length; i++) {
  let weight = monsterCountWeights[i];
  for (let j = 0; j < weight; j++) {
    monsterCounts.push(i + 1);
  }
}

const crXP = {
    0:  10,
0.125:  25,
 0.25:  50,
  0.5:  100,
    1:  200,
    2:  450,
    3:  700,
    4:  1100,
    5:  1800,
    6:  2300,
    7:  2900,
    8:  3900,
    9:  5000,
   10:  5900,
   11:  7200,
   12:  8400,
   13:  10000,
   14:  11500,
   15:  13000,
   16:  15000,
   17:  18000,
   18:  20000,
   19:  22000,
   20:  25000,
   21:  33000,
   22:  41000,
   23:  50000,
   24:  62000,
   25:  75000,
   26:  90000,
   27:  105000,
   28:  120000,
   29:  135000,
   30:  155000
};
const xpCR = _.invert(crXP);

const xpByLevel = {
   1: { easy:   25, medium:   50, hard:   75, deadly:   100 },
   2: { easy:   50, medium:  100, hard:  150, deadly:   200 },
   3: { easy:   75, medium:  150, hard:  225, deadly:   400 },
   4: { easy:  125, medium:  250, hard:  375, deadly:   500 },
   5: { easy:  250, medium:  500, hard:  750, deadly:  1100 },
   6: { easy:  300, medium:  600, hard:  900, deadly:  1400 },
   7: { easy:  350, medium:  750, hard: 1100, deadly:  1700 },
   8: { easy:  450, medium:  900, hard: 1400, deadly:  2100 },
   9: { easy:  550, medium: 1100, hard: 1600, deadly:  2400 },
  10: { easy:  600, medium: 1200, hard: 1900, deadly:  2800 },
  11: { easy:  800, medium: 1600, hard: 2400, deadly:  3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly:  4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly:  5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly:  5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly:  6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly:  7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly:  8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly:  9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};


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
      flag: '-n, --num <num>',
      description: 'Number of encounters to generate (default 1)',
    },
    {
      flag: '-p, --players <playerCount>',
      description: 'Number of players (default 4)',
    },
    {
      flag: '-d, --difficulty <difficulty>',
      description: 'Difficulty',
      autocomplete: possibleDifficulties,
    },
    {
      flag: '-l, --level <level>',
      description: 'Average Player Level (default 1)',
    },
    {
      flag: '-e, --environment <environment>',
      description: 'Filter by environment (default all)',
      autocomplete: environments,
    },
    {
      flag: '-o, --only',
      description: 'Only print the encounter',
    },
    {
      flag: '-m, --matrix',
      description: 'Create an encounter matrix by level and difficulty',
    },
    {
      flag: '-s, --save',
      description: 'Save To Encounter Folder? (using the matrix option or number > 1 makes saves by default)',
    },
    {
      flag: '--save-options',
      description: 'Save these options and use them as the defaults for the current session (does not generate encounter)',
    },
  ],
  action: createEncounter
};

function createEncounter(args, fn) {
  console.log('Generating Encounters');

  const encounters = {};
  const timestamp = Date.now();
  const options = _.pick(args.options, ['environment', 'playerCount', 'only']);
  let {num, matrix, difficulty, level} = args.options;
  let difficultyArr;
  let levelArr;

  options.environment = options.environment || 'all';
  options.playerCount = options.playerCount || 4;

  num = parseInt(num) || 1;

  if (num > 1 || matrix) {
    options.save = true;
  }

  if (difficulty) {
    difficultyArr = [difficulty];
  } else if (matrix) {
    difficultyArr = possibleDifficulties;
  } else {
    difficultyArr = [difficultyCounts[_.random(difficultyCounts.length - 1)]]
  }

  if (level) {
    levelArr = [level];
  } else if (matrix) {
    levelArr = Array(20).fill().map((x, i) => i + 1);
  } else {
    levelArr = [1];
  }

  levelArr.forEach((encounterLevel) => {
    difficultyArr.forEach((encounterDifficulty) => {
      const outputArr = [];

      for (let i = 0; i < num; i++) {
        const encounterOptions = _.assign({
          difficulty: encounterDifficulty,
          level: encounterLevel,
        }, options);
        outputArr.push(generateEncounter(encounterOptions));
      }

      if (options.save) {
        const outStr = outputArr.join(`\n\n${PAGEBREAK}\n\n`);
        mdPdf(mdOptions).from.string(outStr).to(`./pdfs/encounters/${options.environment}/${encounterLevel}/${encounterDifficulty}/${timestamp}`, function() {
        });
      }
    });
  });

  fn();
}


function generateEncounter(options) {
  const {playerCount, difficulty, level, environment, save, only} = options;
  const monsterCount = monsterCounts[_.random(0, monsterCounts.length - 1)];
  const totalXp = (xpByLevel[level][difficulty] * playerCount) / challengMultiplier[monsterCount];
  const environmentMonsters = monstersByEnvAndCr[environment];
  const encounter = {};

  let monsterXp = totalXp / monsterCount;
  let monsterCr = 0;
  let monsterList;

  for (let i = 0; i < monsterXp; i++) {
    if (xpCR[i]) {
      monsterCr = xpCR[i];
    }
  }
  monsterList = environmentMonsters[monsterCr];

  if (monsterList) {
    for (let i = 0; i < monsterCount; i++) {
      const monster = monsterList[_.random(monsterList.length - 1)];
      const id = monster.id;
      encounter[id] = encounter[id] || 0;
      encounter[id]++;
    }
  } else {
    return '';
    //encounter.none = 0;
  }

  const encounterSummary = _.map(encounter, (num, id) => {
    const monster = monstersByName[id];
    return ` ${monster.name}(${num})`;
  });


  if (!save) {
    console.log(Table.print([
      {
        level,
        difficulty,
        monsterCount,
        totalXp,
        // monsterXp,
        monsterCr,
        monsters: encounterSummary,
      }
    ]));

    if (!only) {
      _.forEach(encounter, (num, id) => {
        console.log(marked(monstersByName[id].description));
      });
    }
  }

  return `# ${encounterSummary} \n\n<hr>\n\n` +
  _.map(encounter, (num, id) => {
    const description = monstersByName[id].description;
    return description;
  }).join('\n\n<hr>\n\n');
}
