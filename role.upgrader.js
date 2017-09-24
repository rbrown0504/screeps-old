var depositManager = require('Deposits');
var creepUtility = require('creepUtility');
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var needsEnergy = false;
        var depleted = false;
        this.depositManager = new depositManager(creep.room);
        this.creepUtility = new creepUtility(creep.room);

        //figure some stuff out on local storage
        if(creep.carry.energy == 0) {
            depleted = true;
            needsEnergy = true;
        }
        if (creep.carry.energy < creep.carryCapacity) {
            needsEnergy = true;
        }
        if (creep.carry.energy == creep.carryCapacity) {
            needsEnergy = false;
        }
        //make decisions on what the creep should be doing
        if (needsEnergy == true && depleted == true) {
            creep.memory.working = true;
            creep.memory.upgrading = false;
        } else if (needsEnergy == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.memory.working = false;
        } else if (needsEnergy == true && creep.memory.working) {
            creep.memory.working = true;
        } else if (needsEnergy == true && creep.memory.upgrading) {
            creep.memory.upgrading = true;
        }
        //make the creep do something
        if (creep.memory.working) {
            //check if miner available
            var minersFound = false;
            var creepsNear = creep.pos.findInRange(FIND_MY_CREEPS, 5);
            if(creepsNear.length){
                for(var n in creepsNear){
                    //console.log('creepsNear');
                    //console.log(creepsNear[n].memory.role);
                    if(creepsNear[n].memory.role === 'roleMiner' && creepsNear[n].carry.energy == creep.carryCapacity){
                        minersFound = true;
                    }
                }
            }
            
            var sources = creep.room.find(FIND_SOURCES);
            /*if (minersFound) {
                console.log('***************upgrader get energy from miner****************');
                console.log(creepsNear[n].carry.energy);
                console.log(creep.carryCapacity);
                //console.log(creepsNear[n].energyCapacity);
                for(var n in creepsNear){
                    //console.log('creepsNear');
                    //console.log(creepsNear[n].memory.role);
                    if(creepsNear[n].memory.role === 'roleMiner' && creepsNear[n].carry.energy == creep.carryCapacity){
                        console.log('***************Getting from minerr****************');
                        creep.moveTo(creepsNear[n], {visualizePathStyle: {stroke: '#ffffff'}});
                        creepsNear[n].transfer(creepsNear[n],RESOURCE_ENERGY,creep.carryCapacity);
                    }
                }
                console.log()
            } else */
            //console.log('spawnID: ' + this.depositManager.getSpawnDeposit());
            //this.creepUtility.getEnergy(true,false,creep);
            var spawn = this.depositManager.getSpawnDeposit();
            if (creep.withdraw(spawn,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //console.log('***************upgrader get energy from source****************');
                //reep.moveTo(this.depositManager.getSpawnDeposit());
                creep.moveTo(spawn);
                //creep.say('🔄 harvest');
            }
        }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('⚡ upgrade');
            }
        }
	}
};

module.exports = roleUpgrader;