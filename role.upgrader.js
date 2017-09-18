var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            //FIND NEAREST SOURCE AND GET STUFF
            var source = creep.pos.findClosestByRange(FIND_SOURCES);
            creep.memory.sourceId = source.id;
            var source = Game.getObjectById(creep.memory.sourceId);
            creep.moveTo(source,{visualizePathStyle: {stroke: '#ffaa00'}}); // OK
        }
	}
};

module.exports = roleUpgrader;