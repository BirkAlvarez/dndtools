import Ember from 'ember';

export default Ember.Route.extend({
  store: Ember.inject.service(),


  model() {
    const fs = require('fs');
    const store = this.get('store');
    const adventuresPath = './adventures';
    const adventureFiles = fs.readdirSync(adventuresPath);
    const adventures = adventureFiles.filter((filename) => {
      return filename.indexOf('.json') > -1;
    }).map((filename) => {
      const json = JSON.parse(fs.readFileSync(`${adventuresPath}/${filename}`));
      json.file = filename;
      return json;
    });

    adventures.forEach((adventure) => {
      store.createRecord('adventure', adventure);
    });

    return {};
  },
});
