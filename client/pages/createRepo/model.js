const AbstractModel = require("../abstractModel");

class Model extends AbstractModel {
  createRepo(name) {
    return this.fetch('/api/v1/repo/create', 'POST', {
      name: name
    })
      .catch(err => {
        console.error(err);
      });
  }
}

module.exports = Model;
