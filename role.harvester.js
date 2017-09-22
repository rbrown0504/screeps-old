var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var depleted = false;
        var needsEnergy = false;
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
            creep.memory.carry = false;
        } else if (needsEnergy == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.carry = true;
            creep.memory.working = false;
        } else if (needsEnergy == true && creep.memory.working && creep.carry.energy < creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            /*var creepsNear = creep.pos.findInRange(FIND_MY_CREEPS, 1);
            if(creepsNear.length){
                for(var n in creepsNear){
                    //console.log('creepsNear');
                    //console.log(creepsNear[n].memory.role);
                    if(creepsNear[n].memory.role === 'upgrader'){
                        //console.log('Energy: ' + creepsNear[n].energy);
                        //console.log('Energy capacity: ' + creepsNear[n].energyCapacity);
                        if(creepsNear[n].energy < creepsNear[n].energyCapacity) {
                            creep.transferEnergy(creepsNear[n]);
                        }
                    }
                }
            }*/
            var sources = creep.room.find(FIND_SOURCES);
            //console.log(sources);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        if (creep.memory.carry) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }            
        }
    }
};



module.exports = roleHarvester;