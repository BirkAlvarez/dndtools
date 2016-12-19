const _ = require('lodash');

function nameify(name) {
  return name.split('.')[0]
             .split('_')
             .map(x => _.capitalize(x))
             .join(' ');
}

module.exports = {
  nameify,
};
