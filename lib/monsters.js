const _ = require('lodash');
const fs = require('fs');
const {MONSTER_DIR} = require('../config');
const {nameify} = require('./utils');

const monsterFiles = fs.readdirSync(MONSTER_DIR);
const monstersByName = {};
const monstersByCr = {};

monsterFiles.forEach((monsterFile) => {
  const id = monsterFile.replace(/.md$/, '');
  const monsterName = nameify(monsterFile);
  const monster = {id};
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

  monster.cr = parseFloat(monster.cr) || 0;
  monster.description = contents.slice(descriptionStart).join('\n');
  monstersByName[id] = monster;
  monstersByCr[monster.cr] = monstersByCr[monster.cr] || [];
  monstersByCr[monster.cr].push(monster);
});

module.exports = {
  monstersByName,
  monstersByCr,
};
