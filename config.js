const ROOT = `./5thSRD-master`;
const MONSTER_DIR = `${ROOT}/docs/gamemaster_rules/monsters`;
const SPELLS_DIR = `${ROOT}/docs/spellcasting/spells`;
const SPELL_LISTS_DIR = `${ROOT}/src/spell_lists`;
const PAGEBREAK = '<div style="page-break-after: always;"></div>';

const config = {
  ROOT,
  MONSTER_DIR,
  SPELLS_DIR,
  SPELL_LISTS_DIR,
  PAGEBREAK,
  mdOptions: {
    cssPath: 'css/pdf.css',
    remarkable: {
      html: true,
      breaks: true,
      syntax: ['footnote', 'sup', 'sub']
    }
  }
};

module.exports = config;
