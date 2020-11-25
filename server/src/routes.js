const path = require('path');

module.exports = {
  set(app, express) {
    app.use(express.static(path.resolve(__dirname, '../../client/')));
    app.use(express.json());

    app.get('*', (request, response) => {
      response.sendFile('index.html', {root: path.join(__dirname, '../../client/')});
    });
  },
};
