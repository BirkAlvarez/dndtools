import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  file: DS.attr(),

  saveToFile() {
    const fs = require('fs');
    const adventuresPath = './adventures';
    const data = this.toJSON();
    const filename = data.file;
    delete data.file;

    fs.writeFileSync(`${adventuresPath}/${filename}`, JSON.stringify(data));
  },
});
