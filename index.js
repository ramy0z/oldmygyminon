const createApp = require('./app')
const PORT = process.env.PORT || 3000;
createApp()
  .then(app => app.listen(PORT, () => {console.log(`Our app is running on port ${ PORT }`)}))
 // .then(app => app.listen(port) , console.log('server started on port', port))