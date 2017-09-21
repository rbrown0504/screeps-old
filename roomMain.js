/*Sourced from: screeps-ai https://github.com/beije/screeps-ai, any additional modifications made by myself.*/
var Deposits = require('Deposits');
var Constructions = require('Constructions');
var CreepHandler = require('creepHandler');
var creepUtility = require('creepUtility');

function roomMain(room, roomController) {
    this.room = room;
    this.roomController = roomController;
    this.depositManager = new Deposits(this.room);
    this.constructionManager = new Constructions(this.room);
    this.creeps = [];
    this.structures = this.room.find(
        FIND_MY_STRUCTURES,
        {
            filter: filterExtensions
        }
    );

    this.creepUtility = new creepUtility(this.room);
    this.creepHandler = new CreepHandler(this.creepUtility, this.depositManager, this.constructionManager);

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
    
    for(var n in creeps) {
        //console.log('creeps: ' + JSON.stringify(creeps[n]));
        var c = this.creepHandler.load(creeps[n]);
        //console.log('creeps: ' + JSON.stringify(c));
        if(c) {
            this.creeps.push(c);
        }
    }
    this.handleResources('roleMiner');
    //this.handleBuilders();
};

roomMain.prototype.askForReinforcements = function() {
    console.log(this.room.name + ': ask for reinforcements.');
    this.roomController.requestReinforcement(this);
};

roomMain.prototype.sendReinforcements = function(room) {
    if(!Memory[this.room.name]) {
        Memory[this.room.name] = {};
    }
    var alreadySending = false;
    for(var i = 0; i < this.creepUtility.creeps.length; i++) {
        var creep = this.creepUtility.creeps[i];
        if(creep.memory.targetRoom == room.room.name) {
            alreadySending = true;
            break;
        }
    }
    if(alreadySending) {
        console.log(this.room.name + ': already given reinforcements');
        return;
    }
    if(this.creepUtility.getTotalPopulation() < this.creepUtility.getMaxPopulation()*0.8) {
        console.log(this.room.name + ': Not enough resources ' + '(' + this.creepUtility.getTotalPopulation() + '/' + this.creepUtility.getMaxPopulation()*0.8 + ')');
        return;
    }

    var sentType = [];
    for(var i = 0; i < this.creepUtility.creeps.length; i++) {
        var creep = this.creepUtility.creeps[i];
        if(creep.ticksToLive < 1000) {
            continue;
        }
        if(sentType.indexOf(creep.memory.role) == -1) {
            sentType.push(creep.memory.role);
            console.log('sending: ' + creep.memory.role);
            creep.memory.targetRoom = room.room.name;
        }
    }
}

roomMain.prototype.populate = function() {
    if(this.depositManager.spawns.length == 0 && this.creepUtility.getTotalPopulation() < 10) {
        this.askForReinforcements()
    }

    for(var i = 0; i < this.depositManager.spawns.length; i++) {
        var spawn = this.depositManager.spawns[i];
        if(spawn.spawning) {
            continue;
        }

        if((this.depositManager.energy() / this.depositManager.energyCapacity()) > 0.2) {
            var types = this.creepUtility.getTypes()
            for(var i = 0; i < types.length; i++) {
                var ctype = this.creepUtility.getType(types[i]);
                if(this.depositManager.deposits.length > ctype.minExtensions) {
                    if((ctype.goalPercentage > ctype.currentPercentage && ctype.total < ctype.max) || ctype.total == 0 || ctype.total < ctype.max*0.75) {
                        this.creepHandler.new(types[i], this.depositManager.getSpawnDeposit());
                        break;
                    }
                }
            }
        }
    }


};


roomMain.prototype.handleResources = function(type) {
    var sources = this.creepUtility.getSources();
    var perSource = Math.ceil(this.creepUtility.getType(type).total/sources.length);
    var counter = 0;
    var source = 0;
    //console.log('***' + this.creeps.length);
    for(var i = 0; i < this.creeps.length; i++) {
        var creep = this.creeps[i];
        if(creep.remember('role') != type) {
            continue;
        }

        if(!sources[source]) {
            continue;
        }

        creep.remember('source', sources[source].id);
        //console.log('***' + sources[source].id);
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