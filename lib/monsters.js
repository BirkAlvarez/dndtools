const _ = require('lodash');
const fs = require('fs');
const {MONSTER_DIR} = require('../config');
const {nameify} = require('./utils');
const monsterEtc = require('./monsters_etc');

const monsterFiles = fs.readdirSync(MONSTER_DIR);
const monstersByName = {};
const monstersByCr = {};
const monstersByEnvAndCr = {};

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

  monster.environments = monster.environments || ['all'];
  monster.cr = parseFloat(monster.cr) || 0;
  monster.description = contents.slice(descriptionStart).join('\n');
  monstersByName[id] = monster;

  let cr = monster.cr;
  monstersByCr[cr] = monstersByCr[cr] || [];
  monstersByCr[cr].push(monster);
  monster.environments.forEach((environment) => {
    monstersByEnvAndCr[environment] = monstersByEnvAndCr[environment] || {};
    monstersByEnvAndCr[environment][cr] = monstersByEnvAndCr[environment][cr] || [];
    monstersByEnvAndCr[environment][cr].push(monster);
  });
});

module.exports = {
  monstersByName,
  monstersByEnvAndCr,
  monstersByCr,
};
