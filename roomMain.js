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
    this.handleResources('roleHarvester');
    //this.handleBuilders();
    //this.handleCarriers();
};

roomMain.prototype.askForReinforcements = function() {
    console.log(this.room.name + ' : ask for reinforcements.');
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
    //console.log('roomMain.population: ' + this.creepUtility.getTotalPopulation());
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
            console.log('# defined roles: ' + types.length);
            for(var i = 0; i < types.length; i++) {
                var ctype = this.creepUtility.getType(types[i]);
                //console.log('roomMain.populate.role: ' + types[i]);
                /*console.log('roomMain.goalPercentage: ' + ctype.goalPercentage);
                console.log('roomMain.currentPopulation: ' + this.creepUtility.getTotalPopulation());
                console.log('roomMain.MaxPopulation: ' + this.creepUtility.getMaxPopulation());
                console.log('roomMain.roleTotal:' + ctype.total);
                console.log('roomMain.curr %:' + ((ctype.total / this.creepUtility.getMaxPopulation())*100));*/
                if (types[i] !== 'roleSoldier'  && types[i] !== 'roleClaimer' && types[i] !== 'roleLDHarvester') {
                   // console.log('asdfasdfasdfvrtebsvdds else');
                    //i use containers with a miner that doesn't move. save container detail in game when ready
                    if (types[i] == 'roleHarvester') {
                        //only spawn harvesters if miners aren't already occupying sources
                        var sources = this.creepUtility.getSources();
                        if (sources.length == 1) {
                            //only spawn harvesters if miners aren't already occupying sources
                            var minerTargets = _.sum(Game.creeps, (c) => c.memory.role == 'roleMiner' && c.memory.source == spawn.memory.container);
                            if (minerTargets > 0) continue;
                            this.creepHandler.new(types[i], this.depositManager.getSpawnDeposit(),undefined);
                            break;
                        } else if (sources.length == 2) {
                            //only spawn harvesters if there are no miners present
                            //console.log('roomMain.twoSources');
                            var minerTargets = _.sum(Game.creeps, (c) => c.memory.role == 'roleMiner' && c.memory.source == spawn.memory.container);
                            var minerTargets1 = _.sum(Game.creeps, (c) => c.memory.role == 'roleMiner' && c.memory.source == spawn.memory.container1);
                            /*console.log(minerTargets);
                            console.log(minerTargets1);*/
                            if (minerTargets == 0 && minerTargets1 == 0 && spawn.memory.container !== undefined) {
                                //if miners die, spawn harvesters
                                this.creepHandler.new(types[i], this.depositManager.getSpawnDeposit(),undefined);
                                break;
                            } else if (spawn.memory.container == undefined){
                                //if no container defined spawn harvester
                                this.creepHandler.new(types[i], this.depositManager.getSpawnDeposit(),undefined);
                                break;
                            }
                        } else {
                            console.log('all else');
                            this.creepHandler.new(types[i], this.depositManager.getSpawnDeposit(),undefined);
                            break;
                        }
                    } else if (types[i] == 'roleMiner') {
                        //only create miner when there is at least one container memory entry in a spawn
                        //the container id stored in spawn memory is the closest source id to the container
                        if (spawn.memory.container == undefined) continue;
                        //set source for each new creep created, there is one miner per container at any given time
                        if (spawn.memory.container !== undefined) {
                            var minerTargets = _.sum(Game.creeps, (c) => c.memory.role == 'roleMiner' && c.memory.source == spawn.memory.container);
                            if (minerTargets<1) {
                                this.creepHandler.new(types[i], this.depositManager.getSpawnDeposit(),spawn.memory.container);  
                                break;
                            }
                            
                        }
                        if (spawn.memory.container1 !== undefined) {
                            var minerTargets = _.sum(Game.creeps, (c) => c.memory.role == 'roleMiner' && c.memory.source == spawn.memory.container1);    
                            if (minerTargets<1) {
                                this.creepHandler.new(types[i], this.depositManager.getSpawnDeposit(),spawn.memory.container1);  
                                break;
                            }
                        }
                        if (spawn.memory.container2 !== undefined) {
                            var minerTargets = _.sum(Game.creeps, (c) => c.memory.role == 'roleMiner' && c.memory.source == spawn.memory.container2);    
                            if (minerTargets<1) {
                                this.creepHandler.new(types[i], this.depositManager.getSpawnDeposit(),spawn.memory.container2);  
                                break;
                            }
                        }
                    } else {
                        //console.log('everything else');
                        if (    (ctype.goalPercentage > ((ctype.total / this.creepUtility.getMaxPopulation())*100)) && (ctype.total < ctype.max) || ctype.total == 0 || ctype.total < ctype.max*0.75 ) {
                            this.creepHandler.new(types[i], this.depositManager.getSpawnDeposit(),undefined);
                            break;
                        }
                    }
                } 
                
                //console.log('roomMain.populate: ' + this.depositManager.deposits.length);
                //console.log('roomMain.extensions: ' + ctype.minExtensions);
                //console.log('roomMain.goalPercentage: ' + ctype.goalPercentage);
                //console.log('roomMain.currentPercentage: ' + ctype.currentPercentage);
                /*if(this.depositManager.deposits.length > ctype.minExtensions) {
                    
                }*/
            }
        }
    }


};

roomMain.prototype.handleCarriers = function() {
    var counter = 0;
    var builders = [];
    var carriers = [];
    for(var i = 0; i < this.creeps.length; i++) {
        var creep = this.creeps[i];
        if(creep.remember('role') == 'roleBuilder') {
            builders.push(creep.creep);
        }
        if(creep.remember('role') != 'roleCarrier') {
            continue;
        }
        carriers.push(creep);
        if(!creep.getDepositFor()) {
            if(counter%2) {
                // Construction
                creep.setDepositFor(1);
            } else {
                // Population
                creep.setDepositFor(2);
            }
        }

        counter++;
    }
    counter = 0;
    for(var i = 0; i < carriers.length; i++) {
        var creep = carriers[i];
        if(creep.remember('role') != 'roleCarrier') {
            continue;
        }
        if(!builders[counter]) {
            continue;
        }
        var id = creep.remember('target-worker');
        if(!Game.getObjectById(id)) {
            creep.remember('target-worker', builders[counter].id);
        }
        counter++;
        if(counter >= builders.length) {
            counter = 0;
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
    var builderStats = this.creepUtility.getType('roleBuilder');
    if(this.spawns.length == 0) {
        for(var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i];
            if(creep.remember('role') != 'roleBuilder') {
                continue;
            }

            creep.remember('forceControllerUpgrade', false);
        }
        return;
    }
    if(builderStats <= 3) {
        for(var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i];
            if(creep.remember('role') != 'roleBuilder') {
                continue;
            }
            creep.remember('forceControllerUpgrade', false);
        }
    } else {
        var c = 0;
        for(var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i];
            if(creep.remember('role') != 'roleBuilder') {
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