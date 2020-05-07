const express = require('express');
const path = require('path');
const app = express();
const Solids = require('./routes/api/solids').Solids;
const printJobs = require('./routes/api/printjobs').Jobs;

// set favicon path
var favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname, 'public', 'images/favicon.ico')));

// set views path and engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// home route
app.get('/', (req, res) => {
  res.render('home', { Solids, printJobs });
});

// about route
app.get('/about', (req, res) => {
  res.render('about');
});

// api routes
app.use('/api/solids', require('./routes/api/solids').router);
app.use('/api/printjobs', require('./routes/api/printjobs').router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Listening on Port: ${PORT}\nhttp://localhost:${PORT}/`)
);
