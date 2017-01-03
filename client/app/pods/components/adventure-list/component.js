import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),


  init() {
    this._super(...arguments);

    const store = this.get('store');
    this.set('adventures', store.peekAll('adventure'));
  },


  actions: {
    saveAdventure(adventure) {
      adventure.saveToFile();
    },
  },
});
