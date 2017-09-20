var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var needsEnergy = false;
        var depleted = false;
        console.log(creep.carry.energy);

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
        } else if (needsEnergy == true && creep.memory.working && creep.carry.energy < creep.carryCapacity) {
            creep.memory.working = true;
        }
        //make the creep do something
        if (creep.memory.working) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
                creep.say('🔄 harvest');
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