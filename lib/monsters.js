const _ = require('lodash');
const fs = require('fs');
const {MONSTER_DIR} = require('../config');
const {nameify} = require('./utils');
const monsterEtc = require('./monsters_etc');

const monsterFiles = fs.readdirSync(MONSTER_DIR);
const monstersByName = {};
const monstersByCr = {};
const monstersByEnvAndCr = {};

const knownAttributes = {
  'armor class': 'ac',
  'hit points': 'hp',
  'saving throws': 'saving_throws',
  'damage immunities': 'damage_immunities',
  'damage resistances': 'damage_resistances',
  'condition immunities': 'condition_immunities',
  speed: 'skills',
  skills: 'skills',
  senses: 'senses',
  languages: 'languages',
  challenge: 'challenge',
};

monsterFiles.forEach((monsterFile) => {
  const id = monsterFile.replace(/.md$/, '');
  const monsterName = nameify(monsterFile);
  const monster = _.assign({id}, _.omit(monsterEtc[id], ['name', 'cr']));
  const contents = fs.readFileSync(`${MONSTER_DIR}/${monsterFile}`)
    .toString()
    .split('\n');
  let descriptionStart = 0;

  _.forEach(contents, (line, index) => {
    if (line.trim() === '') {
      descriptionStart = index;
      return false;
    } else {
      const property = line.split(':');
      monster[property[0].trim()] = property[1].trim();
    }
  });

  const descriptionLines = contents.slice(descriptionStart);

  monster.environments = monster.environments || ['all'];
  monster.cr = parseFloat(monster.cr) || 0;
  monster.description = descriptionLines.join('\n');
  monstersByName[id] = monster;
  monster.attrs = parseDescription(descriptionLines);

  let cr = monster.cr;
  monstersByCr[cr] = monstersByCr[cr] || [];
  monstersByCr[cr].push(monster);
  monster.environments.forEach((environment) => {
    monstersByEnvAndCr[environment] = monstersByEnvAndCr[environment] || {};
    monstersByEnvAndCr[environment][cr] = monstersByEnvAndCr[environment][cr] || [];
    monstersByEnvAndCr[environment][cr].push(monster);
  });
});

//console.log(monstersByName.ice_devil);

module.exports = {
  monstersByName,
  monstersByEnvAndCr,
  monstersByCr,
};


function parseDescription(lines) {
  const obj = {
    actions: {},
    legendary: {},
    features: {},
  };
  let status = 'attr';
  let currentBlock;

  lines.forEach((line, index) => {
    line = line.replace(/[\n\r]+/g, ' ').trim();

    // Actions / Legendary Actions
    if (line.indexOf('###') === 0) {
      commitCurrentBlock();
      if (line.toLowerCase().indexOf('legendary') > -1) {
        status = 'legendary';
      }
      else if (line.toLowerCase().indexOf('actions') > -1) {
        status = 'actions';
      }
    }
    // Monster Name
    else if (line.indexOf('#') === 0) {
      commitCurrentBlock();
      obj.name = line.replace(/#/g, '');
    }
    // Stats
    else if (line.indexOf('|') === 0) {
      commitCurrentBlock();
      status = 'stats';
    }
    // Attribute
    else if (line.indexOf('*') === 0) {
      commitCurrentBlock();

      if (['legendary', 'actions'].indexOf(status) === -1) {
        status = 'attr';
      }

      const splitLine = line.replace(/^\*+/g, '').split(/\*+/);
      let attr = splitLine[0].trim().replace(/\./g, '');

      if (knownAttributes[attr.toLowerCase()]) {
        attr = knownAttributes[attr.toLowerCase()];
      } else if (status === 'attr') {
        status = 'feature';
      }

      currentBlock = {
        attr,
        value: splitLine[1].trim(),
      };
    }
    // Continued Attribute
    else if (currentBlock) {
      currentBlock.value += ` ${line}`;
    }
    // Ignored Non-empty Line
    else if (line) {
      commitCurrentBlock();
      switch (status) {
        case 'legendary':
          obj.legendary._description = line;
          break;
        case 'actions':
          obj.actions._description = line;
          break;
      }
    }
  });

  commitCurrentBlock();


  function commitCurrentBlock() {
    if (currentBlock) {
      switch (status) {
        case 'attr':
          obj[currentBlock.attr] = currentBlock.value;
          break;
        case 'feature':
          obj.features[currentBlock.attr] = currentBlock.value;
          break;
        case 'legendary':
          obj.legendary[currentBlock.attr] = currentBlock.value;
          break;
        case 'actions':
          obj.actions[currentBlock.attr] = currentBlock.value;
          break;
        case 'stats':
          break;
      }
      currentBlock = null;
    }
  }


  return obj;
}
