var depositManager = require('Deposits');
var roleUpgrader = require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
    	var needsEnergy = false;
        var depleted = false;
        this.depositManager = new depositManager(creep.room);

        var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_TOWER)
                             && s.energy < s.energyCapacity
            });

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
            creep.memory.building = false;
        } else if (needsEnergy == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.memory.working = false;
        } else if (needsEnergy == true && creep.memory.building) {
            creep.memory.building = true;
        } else if (needsEnergy == true && creep.memory.working) {
            creep.memory.working = true;
        }
        //make the creep do something
        if (creep.memory.working) {
            /*var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
                creep.say('🔄 harvest');
            }*/
            var spawn = this.depositManager.getSpawnDeposit();
            if (creep.withdraw(spawn,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //console.log('***************upgrader get energy from source****************');
                //reep.moveTo(this.depositManager.getSpawnDeposit());
                creep.moveTo(spawn);
                //creep.say('🔄 harvest');
            }
        }

	    if(creep.memory.building) {
	    	//creep.say('🚧 build');
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);

            if (targets !== undefined) {
                // try to build, if the constructionSite is not in range
                //creep.say('🚧 build');
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    // move towards the constructionSite

                    creep.moveTo(targets[0]);
                }
            }
            // if no constructionSite is found
            else {
                // go upgrading the controller
                roleUpgrader.run(creep);
            }
        }
	}
};

module.exports = roleBuilder;

// PRIVATE
function filterExtensions(structure) {
    if(structure.structureType == STRUCTURE_EXTENSION) {
        return true;
    }

    return false;
}
