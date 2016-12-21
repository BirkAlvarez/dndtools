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

    this.set('monsters', monsters);
  },
});
