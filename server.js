require( 'zone.js/dist/zone-node');

const express = require('express');
const serviceTokenMiddleware = require('./middleware/service-token');

const app = express();

app.use(express.static(__dirname + '/assets', { index: false }));
app.use('', express.static('dist'));
app.use('/new', express.static('dist'));

app.get('/health', (req, res) => {
    res.status(200).end('ok');
});

app.use(serviceTokenMiddleware);

const dmProxy = require('./proxies/dm');
const icpProxy = require('./proxies/icp');
dmProxy(app);
icpProxy(app);

app.listen(process.env.PORT || 3000, () => {});
