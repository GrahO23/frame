var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    unirest = require('unirest'),
    xml2js = require('xml2js'),
    parser = new xml2js.Parser(),
    Forecast = require('forecast.io'),
    path = require('path'),
    SonosClient = require('./sonosclient.js').SonosClient,
    fs = require('fs');

var configPath = path.resolve(__dirname, 'config.json');
console.log('config path : ' + configPath);
//'/home/pi/projects/OldfieldFrame/config.json'
var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
var ioSocket;
// The number of milliseconds in one day
var oneDay = 86400000;
var FORCAST_IO_API_KEY = config.FORCAST_IO_API_KEY;
//https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE
var latitude = config.latitude;
var longitude = config.longitude;

//http://darkskyapp.github.io/skycons/

var options = {
        APIKey: FORCAST_IO_API_KEY,
        timeout: 4000,
        exclude: 'minutely,hourly,flags,alerts',
        units: 'si'
    },
    forecast = new Forecast(options);


var sonosClient = new SonosClient();


// Use compress middleware to gzip content
// app.use(express.compress());

// Serve up content from public directory
app.use(express.static(__dirname + '/public', {
    maxAge: oneDay
}));

app.get('/tube', function(req, res) {
    console.log("/tube/");
    unirest.get('http://cloud.tfl.gov.uk/TrackerNet/LineStatus').end(function(response) {
        // Except google trims the value passed :/
        if (response) {
            parser.parseString(response.body, function(err, result) {
                result = JSON.stringify(result);
                console.log('Done');
                res.send(result);
            });
        } else {
            res.send({});
        }
    });
});

app.get('/forecast', function(req, res) {
    console.log('forecast');
    getForecast(function(err, data) {
        if (err) {
            // res.status(404).send(err);
        } else {

            var result = JSON.stringify(data);

            console.log('result');

            res.send(result);
        }
    });
});

app.get('/sonos/volume', function(req, res) {
    // console.log('/sonos/volume');
    sonosClient.volume().then(function(volume) {
    res.send(JSON.stringify(volume));
    });

});

app.get('/sonos/mute', function(req, res) {
    // console.log('/sonos/volume');
    sonosClient.mute().then(function() {
    res.send(200);
    });

});

app.get('/sonos/next', function(req, res) {
    // console.log('/sonos/volume');
    sonosClient.next().then(function() {
    res.send(200);
    });

});


app.get('/sonos/previous', function(req, res) {
    // console.log('/sonos/volume');
    sonosClient.next().then(function() {
    res.send(200);
    });

});

app.get('/sonos/volume/up', function(req, res) {
    // console.log('/sonos/volume');
    sonosClient.volumeup().then(function(volume) {
    res.send(JSON.stringify(volume));
    });
});

app.get('/sonos/volume/down', function(req, res) {
    // console.log('/sonos/volume');
    sonosClient.volumedown().then(function(volume) {
    res.send(JSON.stringify(volume));
    });

});


app.get('/sonos/currentTrack', function(req, res) {
    // console.log('/sonos/currentTrack');
    sonosClient.currentTrack().then(function(track) {
        res.send(JSON.stringify(track));
    });

});





app.get('/forecast', function(req, res) {
    console.log('forecast');
    getForecast(function(err, data) {
        if (err) {
            // res.status(404).send(err);
        } else {

            var result = JSON.stringify(data);

            console.log('result');

            res.send(result);
        }
    });
});

function getForecast(cb) {
    forecast.get(latitude, longitude, function(err, res, data) {
        console.log('forecast.get: err: ' + err + 'res: ' + res);
        if (err && err != null) {
            cb && cb(err, undefined);
            return;
        }
        // console.log(JSON.stringify(data.currently, null, 4));
        // console.log(JSON.stringify(data.daily, null, 4));
        cb && cb(err, {
            currently: data.currently,
            daily: data.daily
        });

    });
}

/* Socket.io */
var lastVolume = -1;

function listenForVolumeChanges() {

    // console.log('listenForVolumeChanges');
    sonosClient.volume().then(function(volume) {
        // console.log('lastVolume: ' + lastVolume  + " vol: " + volume);
        if(lastVolume !== volume.volume ) {
            // console.log('vol change: ' + volume );
            lastVolume = volume.volume;
            io.emit('volume change', volume);
        }
        setTimeout( function() {
            listenForVolumeChanges();
        }, 1000);
    });
}
//io.emit('chat message', msg);

io.on('connection', function(socket) {
    ioSocket = socket;
    console.log('a user connected');
    listenForVolumeChanges();
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
// app.listen(process.env.PORT || 3000);

console.log('starting frame...');