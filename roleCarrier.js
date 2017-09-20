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

function roleCarrier(creep, depositManager, resourceManager, constructionsManager) {
	this.cache = new Cache();
	this.creep = creep;
	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
	this.constructionsManager = constructionsManager;
	this.resource = false;
	this.target = false;
};

roleCarrier.prototype.init = function() {
	this.remember('role', 'roleCarrier');
	this.depositFor = this.remember('depositFor') || 2;
	if(!this.remember('source')) {
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
	} else {
		this.resource = this.resourceManager.getResourceById(this.remember('source'));
	}
	if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		//this.creep.say('w');
	}
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}

	if(this.moveToNewRoom() == true) {
		return;
	}

	if(this.randomMovement() == false) {
	    this.act();
	}
};

roleCarrier.prototype.onRandomMovement = function() {
	this.remember('last-action', ACTIONS.DEPOSIT);
}

roleCarrier.prototype.setDepositFor = function(type) {
	this.remember('depositFor', type);
}
roleCarrier.prototype.getDepositFor = function() {
	return this.remember('depositFor');
}

roleCarrier.prototype.act = function() {
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
    } else if (needsEnergy == true && this.creep.memory.working) {
        this.remember('working', true);
    } else if (needsEnergy == true && this.creep.memory.carry) {
        this.remember('carry', true);
    }

    if (this.creep.memory.working) {
    	var avoidArea = this.getAvoidedArea();
    	var targetDropped = this.creep.pos.findInRange(FIND_DROPPED_RESOURCES,2, {avoid: avoidArea});
    	console.log(targetDropped);
    	console.log('******************************************************************************');
    	if (targetDropped != undefined) {
    		this.pickupEnergy();
    	}

    	//this.pickupEnergy();
    	console.log('carrierHarvest');
    	this.harvestEnergy();
    }
    if (this.creep.memory.carry) {
    	this.depositEnergy();
    	console.log('carrierDeposit');
    }

	

};

roleCarrier.prototype.depositEnergy = function() {
	var avoidArea = this.getAvoidedArea();

	//console.log(JSON.stringify(this.depositManager));
	if(this.depositManager.getEmptyDeposits().length == 0 && this.depositManager.getSpawnDeposit().energy == this.depositManager.getSpawnDeposit().energyCapacity) {
		this.depositFor = DEPOSIT_FOR.CONSTRUCTION;
	}

	if(this.depositManager.energy() / this.depositManager.energyCapacity() < 0.3) {
		this.depositFor = DEPOSIT_FOR.POPULATION;
	}
    
	if(this.depositFor == DEPOSIT_FOR.POPULATION) {
		var deposit = this.getDeposit();
		console.log('Deposit: ' + deposit);
		this.creep.moveTo(deposit, {avoid: avoidArea});
		this.creep.transfer(deposit,RESOURCE_ENERGY);
	}

	if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		console.log('deposit for construction');
		var worker = this.getWorker();
		var range = 1;
		if(!worker) {
			worker = this.constructionsManager.controller;
			range = 2;
		}
		var avoidArea = this.getAvoidedArea();
		if(!this.creep.pos.isNearTo(worker, range)) {
			this.creep.moveTo(worker, {avoid: avoidArea});
		} else {
			this.remember('move-attempts', 0);
		}
		this.harvest();
	}

	this.remember('last-action', ACTIONS.DEPOSIT);
}

roleCarrier.prototype.getWorker = function() {
	if(this.remember('target-worker')) {
		return Game.getObjectById(this.remember('target-worker'));
	}

	return false;
}
roleCarrier.prototype.getDeposit = function() {
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
roleCarrier.prototype.pickupEnergy = function() {
	console.log('roleCarrier.pickupEnergy');
	console.log('Energy: '+this.creep.energy);
	this.creep.energy=0;
	
	var avoidArea = this.getAvoidedArea();
	if(this.creep.energy == this.creep.energyCapacity) {
		return false;
	}

	var target = this.creep.pos.findInRange(FIND_DROPPED_RESOURCES,2);
	console.log('***********************target: ' + target);
	if(target.length) {
		console.log('roleCarrier.pickupEnergy.pickup');
		this.creep.moveTo(target[0]);
	    this.creep.pickup(target[0]);
	}
};
roleCarrier.prototype.harvestEnergy = function() {
	//this.creep.moveTo(0,0);
	var avoidArea = this.getAvoidedArea();

	this.creep.moveTo(this.resource, {avoid: avoidArea});
	if(this.creep.pos.inRangeTo(this.resource, 3)) {
		this.harvest();
	}
	this.remember('last-action', ACTIONS.HARVEST);
	this.forget('closest-deposit');
}

roleCarrier.prototype.harvest = function() {
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	if(creepsNear.length){
		for(var n in creepsNear){
			if(creepsNear[n].memory.role === 'roleMiner' && creepsNear[n].energy != 0){
				console.log('transferring to carrier from miner');
				creepsNear[n].transfer(this.creep,RESOURCE_ENERGY);
			}
            if(creepsNear[n].memory.role === 'CreepBuilder'){
                this.creep.transfer(creepsNear[n],RESOURCE_ENERGY);
			}
		}
	}
}

module.exports = roleCarrier;
