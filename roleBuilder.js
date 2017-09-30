var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2
};
var roleBuilder = function(creep, depositManager, constructionManager, creepUtility) {
	this.creep = creep;
	this.depositManager = depositManager;
	this.constructionManager = constructionManager;
	this.creepUtility = creepUtility;
	this.forceControllerUpgrade = false;
};

roleBuilder.prototype.init = function() {
	this.remember('role', 'roleBuilder');
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}

	if(this.moveToNewRoom() == true) {
		return;
	}

	if(this.remember('source') === undefined) {
		var src = this.creepUtility.getAvailableResource();
		this.remember('source', src.id);
	} else {
		this.resource = this.creepUtility.getResourceById(this.remember('source'));
	}

	this.forceControllerUpgrade = this.remember('forceControllerUpgrade');

	var needsEnergy = false;
    var depleted = false;

	//figure some stuff out on local storage
	if(this.creep.carry.energy == 0) {
        depleted = true;
        needsEnergy = true;
    }
    if (this.creep.carry.energy < this.creep.carryCapacity) {
        needsEnergy = true;
    }
    if (this.creep.carry.energy == this.creep.carryCapacity) {
        needsEnergy = false;
    }
    //make decisions on what the creep should be doing
    if (needsEnergy == true && depleted == true) {
        this.creep.memory.working = true;
        this.creep.memory.building = false;
    } else if (needsEnergy == false && this.creep.carry.energy == this.creep.carryCapacity) {
        this.creep.memory.building = true;
        this.creep.memory.working = false;
    } else if (needsEnergy == true && this.creep.memory.building) {
        this.creep.memory.building = true;
    } else if (needsEnergy == true && this.creep.memory.working) {
        this.creep.memory.working = true;
    }

    if (this.creep.memory.working) {
    	this.harvestContainer();
    	if (this.resource !== undefined) {
    		this.harvestEnergy();	
    	}
    	//this.creep.say('⚡ working');
    }

    if (this.creep.memory.building) {
    	this.act();
    	//this.creep.say('⚡ building');
    }
};

roleBuilder.prototype.act = function() {
	var site = false;
	var avoidArea = this.getAvoidedArea();
	if(!this.forceControllerUpgrade) {
		site = this.constructionManager.constructStructure(this);
	}

	if(!site) {
		var site = this.constructionManager.getController();
		this.creep.moveTo(site, {avoid: avoidArea});
		this.creep.upgradeController(site);
	}

	if(this.creep.pos.inRangeTo(site, 3)) {
		this.giveEnergy(site);
	}
	this.remember('last-energy', this.creep.energy);
};

roleBuilder.prototype.giveEnergy = function(site) {
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	if(creepsNear.length){
		if(site) {
			var closest = site.pos.findClosestByRange(creepsNear.concat(this.creep),{
				filter: function(c) {
					if(c.energy == 0) {
						return true;
					}
				}
			});

			if(closest != this.creep) {
				this.creep.transfer(closest,RESOURCE_ENERGY);
			}
			return;
		}
		for(var n in creepsNear){
			if(creepsNear[n].memory.role === 'roleBuilder'){
				if(creepsNear[n].memory['last-energy'] > creepsNear[n].energy) {
					this.creep.transfer(creepsNear[n],RESOURCE_ENERGY);
				}
			}
		}
	}
}

roleBuilder.prototype.harvestContainer = function() {	
	var avoidArea = this.getAvoidedArea();
	// find closest container
    let container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
    });

    if (container == undefined) {
        container = this.creep.room.storage;
    }

    // if one was found
    if (container != undefined) {
        // try to withdraw energy, if the container is not in range
        if (this.creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // move towards it
            this.creep.moveTo(container);
        }
    }
};
roleBuilder.prototype.harvestEnergy = function() {
	var avoidArea = this.getAvoidedArea();
	this.creep.moveTo(this.resource, {avoid: avoidArea});
	if(this.creep.pos.inRangeTo(this.resource, 3)) {
		if (this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(this.resource);
		}
	}
	this.remember('last-action', ACTIONS.HARVEST);
	this.forget('closest-deposit');
}

module.exports = roleBuilder;