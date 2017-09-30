/*Sourced from: screeps-ai https://github.com/beije/screeps-ai, any additional modifications made by myself.*/
var Cache = require('Cache');
var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2
};

function roleMiner(creep, creepUtility) {
	this.cache = new Cache();
	this.creep = creep;
	this.creepUtility = creepUtility;
	this.resource = false;
};

roleMiner.prototype.init = function() {
	this.remember('role', 'roleMiner');

	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
	if(this.moveToNewRoom() == true) {
		return;
	}
	this.resource = this.creepUtility.getResourceById(this.remember('source'));
	this.act();
};

roleMiner.prototype.act = function() {
	var avoidArea = this.getAvoidedArea();
	if(this.creep.energy == this.creep.energyCapacity) {
		//return;
	}
	this.creep.moveTo(this.resource, {avoid: avoidArea});
	//this.creep.harvest(this.resource);
	this.remember('last-energy', this.creep.energy);
	// get container
    let container = this.resource.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: s => s.structureType == STRUCTURE_CONTAINER
    })[0];

    // if creep is on top of the container harvest, otherwise move to container
    if (this.creep.pos.isEqualTo(container.pos)) {
        // harvest source
        this.creep.harvest(this.resource);
    }
    // if creep is not on top of the container
    else {
        // move towards it
        this.creep.moveTo(container, {avoid: avoidArea});
    }
}


module.exports = roleMiner;