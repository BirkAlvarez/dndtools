'use strict';

const _ = require('lodash');
const fs = require('fs');
const mdPdf = require('markdown-pdf');

const config = require('../config');
const ROOT = config.ROOT;
const SPELLS_DIR = config.SPELLS_DIR;
const SPELL_LISTS_DIR = config.SPELL_LISTS_DIR;
const PAGEBREAK = config.PAGEBREAK;
const mdOptions = config.mdOptions;

module.exports = {
  name: 'spells',
  description: 'Generates PDFs of all spells by class and level',
  action: function(args, fn) {
    createPDFs();
    fn();
  }
};


function createPDFs() {
  const classesDir = fs.readdirSync(SPELL_LISTS_DIR);
  const spellFiles = fs.readdirSync(SPELLS_DIR);
  const spells = {};
  const classes = {};


  // Load all spells
  spellFiles.forEach((spellFile) => {
    const spellName = nameify(spellFile);
    spells[spellName] = fs.readFileSync(`${SPELLS_DIR}/${spellFile}`)
                          .toString()
                          .split('\n')
                            .slice(4)
                            .join('\n')
                          .replace(/#/g, '##');
  });


  // Get spells by class and level
  classesDir.forEach((classFolder) => {
    const classname = nameify(classFolder);
    const classSpells = [];
    const classDir = `${SPELL_LISTS_DIR}/${classFolder}`;
    const spellsByLevel = fs.readdirSync(classDir);

    spellsByLevel.forEach((levelFile) => {
      const spellList = fs.readFileSync(`${classDir}/${levelFile}`).toString().split(/\n/);
      const levelSpells = [];

      spellList.forEach((spell) => {
        const spellName = spell.trim();
        const matchingSpell = spells[spellName];
        if (matchingSpell) {
          levelSpells.push(matchingSpell);
        }
      });

      classSpells.push(levelSpells);
    });

    classes[classname] = classSpells;
  });


  // Create the pdf
  const masterPDF = [];

  _.forEach(classes, (classSpells, className) => {
    const outputArr = [];

    classSpells.forEach((spells, level) => {
      outputArr.push(` # ${className}: ${level === 0? 'Cantrips': 'Level ' + level}<hr>`);
      outputArr.push(spells.join('\n\n<hr>\n\n'));
      outputArr.push(PAGEBREAK);
    });

    const outStr = outputArr.join('\n\n');
    masterPDF.push(outStr);
    mdPdf(mdOptions).from.string(outStr).to(`./pdfs/${className}`);
  });

  mdPdf(mdOptions).from.string(masterPDF.join(`\n\n${PAGEBREAK}\n\n`)).to(`./pdfs/All`);
}


function nameify(name) {
  return name.split('.')[0]
             .split('_')
             .map(x => _.capitalize(x))
             .join(' ');
}
