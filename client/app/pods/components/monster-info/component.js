import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this._super(...arguments);
    // const monster = this.get('monster');
    // const {attrs} = monster;
    // const {actions, features, legendary} = attrs;
    // const props = _.omit(monster.attrs, ['name', 'features', 'actions', 'legendary']);

    // this.set('props', _.map(props, objectify));
    // this.set('actions', _.map(actions, objectify));
    // this.set('features', _.map(features, objectify));
    // this.set('legendary', _.map(legendary, objectify));
  },
});

// function objectify(value, key) {
//   return {key: value};
// }
