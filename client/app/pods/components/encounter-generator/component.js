import _ from 'lodash';
import Ember from 'ember';

const possibleDifficulties = ['easy', 'medium', 'hard', 'deadly'];
const difficultyWeights = {
  easy:   5,
  medium: 8,
  hard:   5,
  deadly: 2,
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



export default Ember.Component.extend({
  init() {
    this._super(...arguments);

    const {monstersByEnvAndCr} = Ember.ENV.monsters;
    this.set('level', 1);
    this.set('levels', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    this.set('playerCount', 3);
    this.set('playerCounts', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    this.set('environment', 'cave');
    this.set('environments', _.keys(monstersByEnvAndCr).sort());
  },

  actions: {
    selectEncounter(encounter) {
      this.set('activeEncounter', encounter);
    },

    generate() {
      const {monstersByName, monstersByEnvAndCr} = Ember.ENV.monsters;
      const level = this.get('level');
      const playerCount = this.get('playerCount');
      const environment = this.get('environment') || 'all';
      const monsterSubList = {};
      const encounterMonsters = {};
      let difficultyArr = difficultyCounts;

      // Create Monster Sub-List
      _.forEach(monstersByEnvAndCr[environment], (monsters, cr) => {
        let selections = monsters.length > 3? 3: monsters.length;
        monsterSubList[cr] = _.shuffle(monsters).slice(0, _.random(1, selections));
      });

      const levelTable = [];

      difficultyArr.forEach((difficulty, index) => {
        const difficultyTable = {
          'd20': index + 1
        };

        const encounterOptions = {
          environment,
          playerCount,
          monsterSubList,
          difficulty,
          level,
        };
        const encounterData = generateEncounter(encounterOptions);
        const {encounter, monsterXp, totalXp, actualXp, quality, rerolls} = encounterData;
        const encounterSummary = _.keys(encounter).sort().map((id) => {
          const monster = monstersByName[id];
          return ` ${monster.name}(${encounter[id]})`;
        });

        _.forEach(encounter, (num, id) => {
          encounterMonsters[id] = encounterMonsters[id] || true;
        });

        difficultyTable.data = encounterData;
        difficultyTable.data.summary = encounterSummary;
        difficultyTable.summary = encounterSummary;
        levelTable.push(difficultyTable);
      });

      this.set('levelTable', levelTable);

      function generateEncounter(options, rerolls = 0) {
        const {monsterSubList, playerCount, difficulty, level, environment, save, only} = options;
        const totalXp = xpByLevel[level][difficulty] * playerCount;
        const encounter = {};

        let monsterCount;
        let multiplier;
        let adjustedXp;

        do {
          monsterCount = monsterCounts[_.random(0, monsterCounts.length - 1)];
          multiplier = challengMultiplier[monsterCount - 1];
          adjustedXp = Math.floor(totalXp / multiplier);
        } while (monsterCount * multiplier * 10 > totalXp);

        let monsterXp = Math.floor(adjustedXp / monsterCount);
        let monsterCr = 0;
        let monsterList;

        for (let i = 0; i < monsterXp; i++) {
          let cr = xpCR[i];
          if (cr && monsterSubList[cr] && monsterSubList[cr].length) {
            monsterCr = cr;
          }
        }
        monsterList = monsterSubList[monsterCr];

        if (monsterList) {
          for (let i = 0; i < monsterCount; i++) {
            const monster = monsterList[_.random(monsterList.length - 1)];
            const id = monster.id;
            encounter[id] = encounter[id] || 0;
            encounter[id]++;
          }
        } else {
          return '';
        }

        const actualXp = _.sum(_.map(encounter, (num, id) => {
          const monster = monstersByName[id];
          return crXP[monster.cr] * num;
        })) * multiplier;

        const quality = actualXp / totalXp;
        if (quality < .76 && rerolls < 50) {
          return generateEncounter(options, rerolls + 1);
        }

        return {
          rerolls,
          actualXp,
          quality,
          monsterCount,
          monsterXp,
          totalXp,
          adjustedXp,
          encounter,
        };
      }
    },
  },
});

