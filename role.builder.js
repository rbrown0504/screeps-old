var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
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

module.exports = roleBuilder;