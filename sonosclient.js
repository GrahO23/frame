var sonos = require('sonos');
var Q = require('q');
var that;


/*
{
    "host": "192.168.1.107",
    "port": 1400,
    "options": {
        "endpoints": {
            "transport": "/MediaRenderer/AVTransport/Control",
            "rendering": "/MediaRenderer/RenderingControl/Control",
            "device": "/DeviceProperties/Control"
        }
    }
}
*/
var SonosClient = function SonosClient() {
    that = this;
    that.client = null;
    that.sonosDevice = null;
    sonos.search(function(device) {
        // device is an instance of sonos.Sonos
        that.sonosDevice = device;
        console.log("sonos.search: " + JSON.stringify(device));
        that.client = new sonos.Sonos(that.sonosDevice.host, that.sonosDevice.port);

        // that.client.getCurrentState(function(err, track) {
        //     console.log('sonos state: ' + err + ' track: ' + track);
        // });

        // that.client.getVolume(function(vol) {
        //     console.log('sonos volume: ' + vol);
        // });

        // that.client.deviceDescription(function(err, dev) {
        //     console.log('sonos deviceDescription: ' + err + " deviceDescription: " + JSON.stringify(dev));
        // });

        // that.client.getZoneAttrs(function(err, dev) {
        //     console.log('sonos getZoneAttrs: ' + err + " getZoneAttrs: " + JSON.stringify(dev));
        // });

        // that.client.getZoneInfo(function(err, dev) {
        //     console.log('sonos getZoneInfo: ' + err + " getZoneInfo: " + JSON.stringify(dev));
        // });

        // that.client.play(function(err, dev) {
        //     console.log('sonos play: ' + err + " info: " + JSON.stringify(dev));
        // });

        // device.currentTrack('current track: ' + console.log);
    });

};

SonosClient.prototype.mute = function() {
    var deferred = Q.defer();
    console.log('this.client ' + this.client);
    if (that.client) {
        that.client.getMuted(function(err, muted) {
            // console.log('sonos volume: ' + vol + ' muted: ' + muted);
            that.client.setMuted(!muted, function() {
                deferred.resolve({
                    muted: !muted
                });
            });

        });
    } else {
        deferred.resolve(0);
    }
    return deferred.promise;
};

SonosClient.prototype.volume = function() {
    var deferred = Q.defer();
    console.log('this.client ' + this.client);
    if (that.client) {
        that.client.getVolume(function(err, vol) {
            that.client.getMuted(function(err, muted) {
                // console.log('sonos volume: ' + vol + ' muted: ' + muted);
                vol = muted === true ? 0 : vol;
                deferred.resolve({
                    volume: vol,
                    muted: muted
                });
            });
        });
    } else {
        deferred.resolve(0);
    }
    return deferred.promise;
};

SonosClient.prototype.next = function() {
    var deferred = Q.defer();
    console.log('this.client ' + this.client);
    if (that.client) {
        that.client.next(function(err) {
            deferred.resolve({});
        });
    } else {
        deferred.resolve(0);
    }
    return deferred.promise;
};

SonosClient.prototype.previous = function() {
    var deferred = Q.defer();
    console.log('this.client ' + this.client);
    if (that.client) {
        that.client.previous(function(err) {
            deferred.resolve({});
        });
    } else {
        deferred.resolve(0);
    }
    return deferred.promise;
};

SonosClient.prototype.volumeup = function() {
    var deferred = Q.defer();
    console.log('this.client ' + this.client);
    if (that.client) {
        that.client.getVolume(function(err, vol) {
            var v = JSON.parse(vol);
            v+=10;
            if (v > 100) {
                v = 100;
            }
            console.log('volumeup ' + v);
            that.client.setVolume(JSON.stringify(v), function() {});
            deferred.resolve({
                volume: vol
            });

        });
    } else {
        deferred.resolve(0);
    }
    return deferred.promise;
};

SonosClient.prototype.volumedown = function() {
    var deferred = Q.defer();
    console.log('this.client ' + this.client);
    if (that.client) {
        that.client.getVolume(function(err, vol) {
            var v = JSON.parse(vol);
            v-=10;
            if (v < 0) {
                v = 0;
            }
            console.log('volumedown ' + v);
            that.client.setVolume(JSON.stringify(v), function() {});
            deferred.resolve({
                volume: vol
            });

        });
    } else {
        deferred.resolve(0);
    }
    return deferred.promise;
};

SonosClient.prototype.currentTrack = function() {
    var deferred = Q.defer();
    console.log('this.client ' + this.client);
    if (that.client) {
        that.client.currentTrack(function(err, track) {
            console.log('track: ' + JSON.stringify(track));
            deferred.resolve(track);
        });
    } else {
        deferred.resolve(0);
    }
    return deferred.promise;
};




/**
 * Export
 */
module.exports.SonosClient = SonosClient;