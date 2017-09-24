/*Credit to for original for this foundation: screeps-ai https://github.com/beije/screeps-ai, any additional modifications made by myself.*/
var Cache = require('Cache');
var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2
};
var DEPOSIT_FOR = {
	CONSTRUCTION: 1,
	POPULATION: 2
}

function roleLDHarvester(creep, depositManager, resourceManager, constructionsManager, creepUtility) {
	this.cache = new Cache();
	this.creepUtility = creepUtility;
	this.creep = creep;
	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
	this.constructionsManager = constructionsManager;
	this.resource = false;
	this.target = false;
	
};

roleLDHarvester.prototype.init = function() {
	this.remember('role', 'roleLDHarvester');
	//this.creep.suicide();

	if (this.remember('home') == undefined) {
		this.remember('home',this.creep.room.name);
	}
	if (this.creep.room.name != this.creep.memory.home) {
		var currSource = this.remember('source');
		if (this.remember('source') == undefined) {
			var src = this.creepUtility.getAvailableResource();
			this.remember('source', src.id);
			
		} else {
			this.resource = this.creepUtility.getResourceById(this.remember('source'));
			//console.log(this.resource);
		}
	}
	

	if (this.remember('target') == undefined) {		
		//LEFT
		this.remember('target','W6N8');
		//UP
		//this.remember('target','W5N9');
	}	

	var lastFillUp = this.remember('last-FillUp');
	var timestamp = new Date().getTime();			
	var targetFound = false;
	var isFound = false;
	this.depositFor = this.remember('depositFor') || 2;
	if (this.remember('working') === undefined) {
		this.remember('working',true);
	}

	if(this.randomMovement() == false) {
	    this.act();
	}
};

roleLDHarvester.prototype.onRandomMovement = function() {
	this.remember('last-action', ACTIONS.DEPOSIT);
}

roleLDHarvester.prototype.setDepositFor = function(type) {
	this.remember('depositFor', type);
}
roleLDHarvester.prototype.getDepositFor = function() {
	return this.remember('depositFor');
}

roleLDHarvester.prototype.act = function() {
	var timestamp = new Date().getTime();
    var continueDeposit = false;
	if(this.creep.energy != 0 && this.remember('last-action') == ACTIONS.DEPOSIT) {
		continueDeposit = true;
	}
    
    var depleted = false;
    var needsEnergy = false;
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
    	this.remember('working', true);
    	this.remember('carry', false);
    } else if (needsEnergy == false && this.creep.carry.energy == this.creep.carryCapacity) {
    	this.remember('working', false);
    	this.remember('carry', true);
    	this.remember('last-FillUp',timestamp);
    } else if (needsEnergy == true && this.creep.memory.working) {
        this.remember('working', true);
    } else if (needsEnergy == true && this.creep.memory.carry) {
        this.remember('carry', true);
    }

    if (this.creep.memory.working) {
    	this.harvestEnergy();
    }
    if (this.creep.memory.carry) {
    	this.depositEnergy();
    }
};

roleLDHarvester.prototype.depositEnergy = function() {
	//var avoidArea = this.getAvoidedArea();
	if (this.creep.room.name == this.creep.memory.home) {
        // find closest spawn, extension or tower which is not full
        var structure = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
            filter: (s) => (s.structureType == STRUCTURE_SPAWN
                         || s.structureType == STRUCTURE_EXTENSION
                         || s.structureType == STRUCTURE_TOWER)
                         && s.energy < s.energyCapacity
        });

        if (structure == undefined) {
            structure = this.creep.room.storage;
        }

        // if we found one
        if (structure != undefined) {
            // try to transfer energy, if it is not in range
            if (this.creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // move towards it
                this.creep.moveTo(structure);
            }
        }
    }
    // if not in home room...
    else {
        // find exit to home room
        var exit = this.creep.room.findExitTo(this.creep.memory.home);
        // and move to exit
        this.creep.moveTo(this.creep.pos.findClosestByRange(exit));
    }
	this.remember('last-action', ACTIONS.DEPOSIT);
}

roleLDHarvester.prototype.getDeposit = function() {
	return this.cache.remember(
		'selected-deposit',
		function() {
			var deposit = false;

			// Deposit energy
			if(this.remember('closest-deposit')) {
				deposit = this.depositManager.getEmptyDepositOnId(this.remember('closest-deposit'));
			}

			if(!deposit) {
				console.log(this.creep);
				deposit = this.depositManager.getClosestEmptyDeposit(this.creep);
				this.remember('closest-deposit', deposit.id);
			}

			if(!deposit) {
				deposit = this.depositManager.getSpawnDeposit();
			}

			return deposit;
		}.bind(this)
	)
};

roleLDHarvester.prototype.harvestEnergy = function() {	
	if (this.creep.room.name == this.creep.memory.target) {
        // find source
        console.log('harvesting in another room!!!!');
        var avoidArea = this.getAvoidedArea();
		if (this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(this.resource);
		}
		this.remember('last-action', ACTIONS.HARVEST);
		this.forget('closest-deposit');
	    }
    // if not in target room
    else {
        // find exit to target room
        var exit = this.creep.room.findExitTo(this.creep.memory.target);
        // move to exit
        this.creep.moveTo(this.creep.pos.findClosestByRange(exit));
    }
}

module.exports = roleLDHarvester;