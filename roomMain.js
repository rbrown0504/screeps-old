var CreepHandler = require('creepHandler');
var creepUtility = require('creepUtility');

function roomMain(room, roomController) {
    this.room = room;
    this.roomController = roomController;
    this.creeps = [];
    this.structures = this.room.find(
        FIND_MY_STRUCTURES,
        {
            filter: filterExtensions
        }
    );

    this.creepUtility = new creepUtility(this.room);
    this.creepHandler = new CreepHandler(this.creepUtility);

    this.spawns = [];
    for(var n in Game.spawns) {
        var s = Game.spawns[n];
        if(s.room == this.room) {
            this.spawns.push(s);
        }
    }
}

roomMain.prototype.loadCreeps = function() {
    var creeps = this.room.find(FIND_MY_CREEPS);
    //console.log('JSON Creeps: ' + JSON.stringify(creeps));
    for(var n in creeps) {
        var c = this.creepHandler.load(creeps[n]);
        console.log('JSON Creeps LOAD: ' + JSON.stringify(c));
        if(c) {
            this.creeps.push(c);
        }
    }
    console.log('***********************************************');
    //this.handleResources('harvester');
    //this.handleBuilders();
};

roomMain.prototype.handleResources = function(type) {
    var sources = this.creepUtility.getSources();
    var perSource = Math.ceil(this.creepUtility.getType(type).total/sources.length);
    var counter = 0;
    var source = 0;
    console.log('***' + this.creeps.length);
    for(var i = 0; i < this.creeps.length; i++) {
        var creep = this.creeps[i];
        console.log(JSON.stringify(creep));
        if(creep.remember('role') != type) {
            continue;
        }

        if(!sources[source]) {
            continue;
        }

        creep.remember('source', sources[source].id);
        console.log('***' + sources[source].id);
        counter++;
        if(counter >= perSource) {
            counter = 0;
            source++;
        }
    }
};
roomMain.prototype.handleBuilders = function() {
    var builderStats = this.creepUtility.getType('builder');
    if(this.spawns.length == 0) {
        for(var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i];
            if(creep.remember('role') != 'builder') {
                continue;
            }

            creep.remember('forceControllerUpgrade', false);
        }
        return;
    }
    if(builderStats <= 3) {
        for(var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i];
            if(creep.remember('role') != 'builder') {
                continue;
            }
            creep.remember('forceControllerUpgrade', false);
        }
    } else {
        var c = 0;
        for(var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i];
            if(creep.remember('role') != 'builder') {
                continue;
            }
            creep.remember('forceControllerUpgrade', true);
            c++;
            if(c == 2) {
                break;
            }
        }
    }
}

module.exports = roomMain;

function filterExtensions(structure) {
    if(structure.structureType == STRUCTURE_EXTENSION) {
        return true;
    }

    return false;
}