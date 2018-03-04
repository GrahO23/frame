const {DeviceDiscovery , Sonos} = require('sonos');
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
    DeviceDiscovery((device) => {
        console.log('found device at ' + device.host)
        console.log("sonos: " + JSON.stringify(device));
        that.sonosDevice = device;
        // that.client = new Sonos(that.sonosDevice.host, that.sonosDevice.port);
      })


};

SonosClient.prototype.mute = async function() {
    // var deferred = Q.defer();
    console.log('this.client ' +that.sonosDevice);

    const muted = await that.sonosDevice.getMuted()
    that.sonosDevice.setMuted(!muted)
    // `${ that.sonosDevice.host} now muted`
};

SonosClient.prototype.volume = async function() {
    const vol = await that.sonosDevice.getVolume()
    const muted = await that.sonosDevice.getMuted()
    return {volume : vol , muted : muted}
};

SonosClient.prototype.next = function() {
    return that.sonosDevice.next();
};

SonosClient.prototype.previous = function() {
    return that.sonosDevice.previous();

};

SonosClient.prototype.volumeup = async function() {
    const volume = await that.sonosDevice.getVolume()
    var v = JSON.parse(volume);
    v+=10;
    if (v > 100) {
        v = 100;
    }
    return that.sonosDevice.setVolume(v);
};

SonosClient.prototype.volumedown = async function() {

    const volume = await that.sonosDevice.getVolume()
    var v = JSON.parse(volume);
    v-=10;
    if (v < 0) {
        v = 0;
    }
    return that.sonosDevice.setVolume(v);
};

SonosClient.prototype.currentTrack = async function() {
    const track = await that.sonosDevice.currentTrack()
    return track
};




/**
 * Export
 */
module.exports.SonosClient = SonosClient;