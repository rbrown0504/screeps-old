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

function roleCarrier(creep, depositManager, resourceManager, constructionsManager, creepUtility) {
	this.cache = new Cache();
	this.creepUtility = creepUtility;
	this.creep = creep;

	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
	this.constructionsManager = constructionsManager;
	this.resource = false;
	this.target = false;
	
};

roleCarrier.prototype.init = function() {
	this.remember('role', 'roleCarrier');
	var targetId = this.remember('target-MinerHarvest');			
	var lastFillUp = this.remember('last-FillUp');
	var timestamp = new Date().getTime();			
	var targetFound = false;
	var isFound = false;
	if (targetId !== undefined) {
		isFound = Game.getObjectById(targetId);
		labelCancelLoops: for(var name in Game.creeps) {
        	var creep = Game.creeps[name];
        	if (creep.id == this.remember('target-MinerHarvest')) {
        		targetFound = true;
        		break labelCancelLoops;
        	}
  		}
  		//if it's been a while trying to get stuff, maybe something is up. move away and free things up.
  		if (lastFillUp !== undefined) {
  			console.log('checking last time I got something.');
  			//10000 = 10 seconds
  			if ((timestamp -lastFillUp) > 180000 ) {
  				console.log('switch miners');
  				this.remember('last-MinerHarvest', this.remember('target-MinerHarvest'));
    			this.forget('target-MinerHarvest');
    			this.remember('last-FillUp', timestamp);
  			}
  		} else {
  			this.remember('last-FillUp', timestamp);
  		}
	}
	console.log('target-HarvestFound: ' + targetFound);
	console.log('target-HarvestisFound: ' + isFound);
	if (!targetFound) {
		console.log('forgetting target');
		this.forget('target-MinerHarvest');
	}


	this.depositFor = this.remember('depositFor') || 2;
	if(!this.remember('source')) {
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
	} else {
		this.resource = this.resourceManager.getResourceById(this.remember('source'));
	}
	console.log(this.resource);
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
    	//change miners
    	this.remember('last-MinerHarvest', this.remember('target-MinerHarvest'));
    	this.forget('target-MinerHarvest');
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
    	var targetDropped = this.creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {avoid: avoidArea});
    	//console.log('targetDropped:' + targetDropped);
    	//console.log('******************************************************************************');
    	if (targetDropped != null) {
    		//console.log('********************target dropped!!!!!!!**********************************************************');
    		this.pickupEnergy();
    	}
    	//if there's nothing to pick up, go and get a full source
    	//this.harvestEnergy();
    	//also can have it maintain builders energy from miners here
    	//haven't gotten this to work
    	this.harvestCreep();


    	//console.log('carrierHarvest');
        

    	
    }
    if (this.creep.memory.carry) {
    	//console.log('carrierHarvest_deposit');
    	if (this.creep.carry.energy == this.creep.carryCapacity) {
    		this.depositEnergy();
    	} else {
    		this.harvestCreep();	
    	}
    	//console.log('carrierDeposit_done');
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
		this.harvestCreep();
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
	//console.log('roleCarrier.pickupEnergy');
	//console.log('Energy: '+this.creep.energy);
	this.creep.energy=0;
	
	var avoidArea = this.getAvoidedArea();
	if(this.creep.energy == this.creep.energyCapacity) {
		return false;
	}

	var target = this.creep.pos.findInRange(FIND_DROPPED_RESOURCES,100);
	//console.log('***********************target: ' + target);
	if(target.length) {
		//console.log('roleCarrier.pickupEnergy.pickup');
		this.creep.moveTo(target[0]);
	    this.creep.pickup(target[0]);
	}
};
roleCarrier.prototype.harvestEnergy = function() {
	//this.creep.moveTo(0,0);
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

roleCarrier.prototype.harvestCreep = function() {
	//console.log('roleCarrier.harvestCreep');
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS,50);
	if (this.creep.memory.working) {
		if(creepsNear.length){
			var targetId = this.remember('target-MinerHarvest');			

			if (targetId !== undefined) {
				console.log('I have a target miner, my name is: ' + this.creep.name + ', my target is: ' + targetId);
				for(var n in creepsNear){
					
					if(creepsNear[n].memory.role === 'roleMiner' && (creepsNear[n].energy != 0) && ( (creepsNear[n].carry.energy == creepsNear[n].carryCapacity) && this.remember('target-MinerHarvest') == creepsNear[n].id) ){
						this.creep.moveTo(creepsNear[n]);
						console.log('harvesting from miner');
						creepsNear[n].transfer(this.creep,RESOURCE_ENERGY);
						this.remember('target-MinerHarvest',creepsNear[n].id);
					} else {
						console.log('harvesting energy');
						this.harvestEnergy();
					}
				}
			} else {
				//switch from last and set new target
				console.log('I DO NOT have a target miner');
				for(var n in creepsNear){
					if(  creepsNear[n].memory.role === 'roleMiner' && (creepsNear[n].energy != 0) && (this.creep.carry.energy< this.creep.carryCapacity) && (creepsNear[n].id != this.remember('last-MinerHarvest'))  ){
						//console.log('going to new miner');
						this.creep.moveTo(creepsNear[n]);
						creepsNear[n].transfer(this.creep,RESOURCE_ENERGY);
						this.remember('target-MinerHarvest',creepsNear[n].id);
					} else {
						this.harvestEnergy();
					}
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
				//console.log('roleCarrier.harvestCreep.roleCheck');
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

module.exports = roleCarrier;
