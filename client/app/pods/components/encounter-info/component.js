import _ from 'lodash';
import Ember from 'ember';

export default Ember.Component.extend({
  didReceiveAttrs() {
    this._super(...arguments);
    const {monstersByName} = Ember.ENV.monsters;
    const encounterData = this.get('encounterData');
    if (!encounterData) {
      return;
    }

    const {encounter} = encounterData;
    const monsters = _.keys(encounter).sort().map((id) => {
      return monstersByName[id];
    });
    const initiatives = [];
    _.forEach(encounter, (num, id) => {
      const monster = monstersByName[id];
      const monsterName = monster.name;
      const dex = Math.floor(((monster.attrs.stats.dex || 10) - 10) / 2);

      for (let i = 0; i < num; i++) {
        initiatives.push({
          monsterName,
          roll: _.random(1, 20) + dex
        });
      }
    });

    this.set('monsters', monsters);
    this.set('initiatives', _.sortBy(initiatives, 'roll').reverse());
    this.set('groupInitiative', Math.round(_(initiatives).map('roll').sum() / initiatives.length));
  },
});
