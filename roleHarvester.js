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

function roleHarvester(creep, depositManager, resourceManager, constructionsManager, creepUtility) {
	this.cache = new Cache();
	this.creepUtility = creepUtility;
	this.creep = creep;

	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
	this.constructionsManager = constructionsManager;
	this.resource = false;
	this.target = false;
	
};

roleHarvester.prototype.init = function() {
	this.remember('role', 'roleHarvester');
	var lastFillUp = this.remember('last-FillUp');
	var timestamp = new Date().getTime();			
	var targetFound = false;
	var isFound = false;
	this.depositFor = this.remember('depositFor') || 2;
	if (this.remember('working') === undefined) {
		this.remember('working',true);
	}
	/*if(this.creep.id == "59c7013cabedb8485dc6cb3e") {
		console.log('rememginer overrid');	
		this.remember('sourceOverride','5982fbdeb097071b4adbc4c5');
		//this.forget('sourceOverride');
	}*/

	if(!this.remember('source')) {
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
	} else {
		this.resource = this.resourceManager.getResourceById(this.remember('source'));
	}
	//console.log(this.resource);
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

roleHarvester.prototype.onRandomMovement = function() {
	this.remember('last-action', ACTIONS.DEPOSIT);
}

roleHarvester.prototype.setDepositFor = function(type) {
	this.remember('depositFor', type);
}
roleHarvester.prototype.getDepositFor = function() {
	return this.remember('depositFor');
}

roleHarvester.prototype.act = function() {
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
        this.giveEnergy();
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
    	var avoidArea = this.getAvoidedArea();
    	//if there's nothing to pick up, go and get a full source
    	//this.harvestCreep();
    	this.harvestEnergy();
    }
    if (this.creep.memory.carry) {
    	this.depositEnergy();
    }
};

roleHarvester.prototype.depositEnergy = function() {
	var avoidArea = this.getAvoidedArea();

	//console.log(JSON.stringify(this.depositManager));
	/*if(this.depositManager.getEmptyDeposits().length == 0 && this.depositManager.getSpawnDeposit().energy == this.depositManager.getSpawnDeposit().energyCapacity) {
		this.depositFor = DEPOSIT_FOR.CONSTRUCTION;
	}

	if(this.depositManager.energy() / this.depositManager.energyCapacity() < 0.3) {
		this.depositFor = DEPOSIT_FOR.POPULATION;
	}
    
	if(this.depositFor == DEPOSIT_FOR.POPULATION) {
		var deposit = this.getDeposit();
		//console.log('Deposit: ' + deposit);
		this.creep.moveTo(deposit, {avoid: avoidArea});
		this.creep.transfer(deposit,RESOURCE_ENERGY);
	}

	if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		//console.log('deposit for construction');
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
		//this.harvestCreep();
	}*/

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


	this.remember('last-action', ACTIONS.DEPOSIT);
}

roleHarvester.prototype.getWorker = function() {
	if(this.remember('target-worker')) {
		return Game.getObjectById(this.remember('target-worker'));
	}

	return false;
}
roleHarvester.prototype.getDeposit = function() {
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

roleHarvester.prototype.pickupEnergy = function() {
	//console.log('roleHarvester.pickupEnergy');
	//console.log('Energy: '+this.creep.energy);
	this.creep.energy=0;
	
	var avoidArea = this.getAvoidedArea();
	if(this.creep.energy == this.creep.energyCapacity) {
		return false;
	}

	var target = this.creep.pos.findInRange(FIND_DROPPED_RESOURCES,100);
	//console.log('***********************target: ' + target);
	if(target.length) {
		//console.log('roleHarvester.pickupEnergy.pickup');
		this.creep.moveTo(target[0]);
	    this.creep.pickup(target[0]);
	}
};
roleHarvester.prototype.harvestEnergy = function() {
	var avoidArea = this.getAvoidedArea();
	if (this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {
		this.creep.moveTo(this.resource);
	}
	this.remember('last-action', ACTIONS.HARVEST);
	this.forget('closest-deposit');
}

roleHarvester.prototype.giveEnergy = function() {
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	if(creepsNear.length){
		for(var n in creepsNear){
			if(creepsNear[n].memory.role === 'roleHarvester'){
				if(creepsNear[n].energy < creepsNear[n].energyCapacity) {
					this.creep.transfer(creepsNear[n],RESOURCE_ENERGY);
				}
			}
		}
	}
}

roleHarvester.prototype.harvestCreep = function() {
	//console.log('roleHarvester.harvestCreep');
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS,3);
	if (this.creep.memory.working) {
		if(creepsNear.length){
			for(var n in creepsNear){
				/*console.log(creepsNear[n].carry.energy);
				console.log(creepsNear[n].carryCapacity);
				console.log(this.remember('target-MinerHarvest'));
				console.log(creepsNear[n].id);*/

				if(creepsNear[n].memory.role === 'roleHarvester' || creepsNear[n].memory.role === 'upgrader' && (creepsNear[n].energy < creepsNear[n].energyCapacity) ){
					this.creep.moveTo(creepsNear[n]);
					//console.log('harvesting from miner');
					this.creep.transfer(creepsNear[n],RESOURCE_ENERGY);
				} else {
					//console.log('harvesting energy');
					//this.harvestEnergy();
				}
			}
			/*if (targetId != null) {

				console.log('asdfasdfatarget-minerHarvest: ' + this.remember('target-MinerHarvest'));
				console.log('tadsfadsf	hisCreepId: ' + creepsNear[n].id);

				for(var n in creepsNear){
					
					if(creepsNear[n].memory.role === 'roleMiner' && (creepsNear[n].energy != 0) && (this.creep.carry.energy< this.creep.carryCapacity && this.remember('target-MinerHarvest') == creepsNear[n].id) ){
						//console.log('going to target miner');

						this.creep.moveTo(creepsNear[n]);
						creepsNear[n].transfer(this.creep,RESOURCE_ENERGY);
						this.remember('target-MinerHarvest',creepsNear[n].id);
					} else {
						this.harvestEnergy();
					}
				}
			} else {
				//switch from last and set new target
				for(var n in creepsNear){
					if(  creepsNear[n].memory.role === 'roleMiner' && (creepsNear[n].energy != 0) && (this.creep.carry.energy< this.creep.carryCapacity) && (creepsNear[n].id != this.remember('last-MinerHarvest'))  ){
						//console.log('going to new miner');
						this.creep.moveTo(creepsNear[n]);
						creepsNear[n].transfer(this.creep,RESOURCE_ENERGY);
						//this.remember('target-MinerHarvest',creepsNear[n].id);
					} else {
						this.harvestEnergy();
					}
				}
			}*/
			
		}
	}
	if (this.creep.memory.carry) {
		//var assignedSet = new set();
		if(creepsNear.length){
			for(var n in creepsNear){
				//console.log('roleHarvester.harvestCreep.roleCheck');
				if( (creepsNear[n].memory.role === 'builder' || creepsNear[n].memory.role === 'upgrader' || creepsNear[n].memory.role === 'roleBuilder') && (creepsNear[n].carry.energy < creepsNear[n].carryCapacity) ) {
	            	//console.log('carrier gives to creep who needs it');
	            	//console.log('creep: ' + this.creep + ' to ' + creepsNear[n]);
	            	//console.log(creepsNear.pos);
					this.creep.moveTo(creepsNear[n]);				
	                this.creep.transfer(creepsNear[n],RESOURCE_ENERGY);

				}
			}
		}
	}
}

module.exports = roleHarvester;
