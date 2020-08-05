/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
var Cache = require('Cache');
var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2,
	DEPOSIT_WORKER: 3,
	DEPOSIT_SPAWN: 4,
	DEPOSIT_CONSTRUCTION: 5,
	HARVEST_WORKER: 6
};
var DEPOSIT_FOR = {
	CONSTRUCTION: 1,
	POPULATION: 2
}

function CreepCarrier(creep, depositManager, resourceManager, constructionsManager, population) {
	this.cache = new Cache();
	this.creep = creep;
	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
	this.constructionsManager = constructionsManager;
	this.population = population;
	this.resource = false;
	this.target = false;
};

CreepCarrier.prototype.init = function() {
	this.remember('role', 'CreepCarrier');
	this.depositFor = this.remember('depositFor') || 2;
	var newSrc = this.resourceManager.getAvailableResourceLowestAssigned();
	//console.log(newSrc);
	if(!this.remember('source')) {
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
		
				
	} else {
		//console.log('CreepCarrierNewSource: ');
		this.resource = this.resourceManager.getResourceById(this.remember('source'));
		
	}
	//console.log('creepCarrier distributionLength: ' + this.population.sourceDistribution.get(this.resource.id).length);
	if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		//this.creep.say('construction');
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

CreepCarrier.prototype.onRandomMovement = function() {
	this.remember('last-action', ACTIONS.DEPOSIT);
}

CreepCarrier.prototype.setDepositFor = function(type) {
	this.remember('depositFor', type);
}
CreepCarrier.prototype.getDepositFor = function() {
	return this.remember('depositFor');
}

CreepCarrier.prototype.act = function() {
	var avoidArea = this.getAvoidedArea();
	//this.giveEnergy();
	//console.log('CreepCarrier.act');
	//if full, go get some energy
	if(this.creep.store[RESOURCE_ENERGY] == this.creep.store.getCapacity()) {
		if(this.population.typeDistribution['CreepCarrier'].total == 0) {
			//console.log('CreepCarrier.act.noCarrier');
			this.depositEnergy();			
		} else {
			this.creep.say('carrierFullAct');			
			//console.log('CreepCarrier.act.depositWCarrier');
			this.depositEnergy();
		}
	} else if (this.creep.store[RESOURCE_ENERGY] > 0) {
		//get last action and do that
		//console.log('Carrier: need to do something');
		if (this.remember('lastAction') == ACTIONS.DEPOSIT_CONTROLLER) {
			console.log('Carrier: needToDepositController');
			// var deposit = this.constructionManager.controller;
			// console.log('creepMiner.deposit: ' + deposit);
			// console.log('creepMiner.deposit.upgradeErrInRange: ' + this.creep.upgradeController(deposit) == ERR_NOT_IN_RANGE);
			// if(this.creep.upgradeController(deposit) == ERR_NOT_IN_RANGE) {
				// console.log('creepMiner.deposit.moveTO');
				// this.creep.moveTo(deposit, {visualizePathStyle: {stroke: '#ffffff'}});
			// }
			
		} else if (this.remember('lastAction') == ACTIONS.DEPOSIT_CONSTRUCTION) {
			//console.log('Carrier: lastAction DEPOSIT_CONSTRUCTION');			
			var sources = this.constructionsManager.sites;
			if(this.population.typeDistribution['CreepBuilder'].total != 0) {
				for(var i = 0; i < sources.length; i++) {
					var workers = new Array();
					if (this.constructionsManager.buildersNear.get(sources[i]) != null) {				
						var results = new Array();
						results = this.constructionsManager.buildersNear.get(sources[i]);
						//console.log('creepCarrier.workerResults: ' + results);
						if (results.length > 0) {
							//console.log('prepare to move');
							//console.log('moveTo');					
							var worker = this.resourceManager.getResourceById(results[0]);
							//console.log('carrierMoveToWorker--: ' + JSON.stringify(worker));
							this.creep.moveTo(worker, {visualizePathStyle: {stroke: '#ffffff'}});
							this.depositWorker();
						}
					}
				}
			} else if(this.population.typeDistribution['CreepUpgrader'].total != 0) {
				//console.log('depositUpgrader');
				var workers = new Array();
				if (this.population.nearController != null) {				
					var results = new Array();
					results = this.population.nearController.get('CreepUpgrader');					
					if (this.population.nearController.get('CreepUpgrader').length > 0) {
						//console.log('prepare to move');
						//console.log('moveTo');					
						var worker = this.resourceManager.getResourceById(this.population.nearController[0]);
						//console.log('carrierMoveToWorker--: ' + JSON.stringify(worker));
						this.creep.moveTo(worker, {visualizePathStyle: {stroke: '#ffffff'}});
						this.depositWorker();
					}
				}
			} else {
				//console.log('No Builder / Upgrader Else');
			}
		} else if (this.remember('lastAction') == ACTIONS.DEPOSIT_SPAWN) {
			//keep depositing in the spawn
			var spawns = this.depositManager.spawns;		
			//console.log('Spawn ' + spawns);			
			this.creep.moveTo(spawns[0]);
			this.creep.transfer(spawns[0], RESOURCE_ENERGY);
		} else if (this.remember('lastAction') == ACTIONS.DEPOSIT) {
			//keep depositing in the spawn
			var spawns = this.depositManager.spawns;		
			this.creep.moveTo(spawns[0]);
			this.creep.transfer(spawns[0], RESOURCE_ENERGY);
		} else if (this.remember('lastAction') == ACTIONS.HARVEST_WORKER) {
			//keep getting energy from a miner
			//go to a source and find a miner and get energy from it
			var sources = this.resourceManager.getSources();
			for(var i = 0; i < sources.length; i++) {
				var workers = new Array();
				if (this.resourceManager.workersNear.get(sources[i]) != null) {				
					var results = new Array();
					results = this.resourceManager.minersNear.get(sources[i]);
					if (results.length > 0) {				
						var worker = this.resourceManager.getResourceById(results[0]);
						this.creep.moveTo(worker, {visualizePathStyle: {stroke: '#ffffff'}});
						this.creep.say('harvest172');
						this.harvest();
						this.remember('lastAction', ACTIONS.HARVEST_WORKER);
					}
				}
			}
		} else if (this.remember('lastAction') == ACTIONS.HARVEST) {
			
			if(this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {
				this.creep.moveTo(this.resource, {visualizePathStyle: {stroke: '#ffffff'}});
			}
			
			this.remember('lastAction', ACTIONS.HARVEST);
		} else {
			
			
			this.remember('lastAction', ACTIONS.HARVEST);
		}
    } else if (this.creep.store[RESOURCE_ENERGY] == 0) {
		//go to a source and get energy from a miner
		var sources = this.resourceManager.getSources();
		for(var i = 0; i < sources.length; i++) {
			var workers = new Array();
			if (this.resourceManager.workersNear.get(sources[i]) != null) {				
				var results = new Array();
				results = this.resourceManager.minersNear.get(sources[i]);
				if (results.length > 0) {
					var worker = this.resourceManager.getResourceById(results[0]);
					this.creep.moveTo(worker, {visualizePathStyle: {stroke: '#ffffff'}});
					this.creep.say('harvest172');
					this.harvest();
					this.remember('lastAction', ACTIONS.HARVEST_WORKER);
				}
			}
		}
		
		// var site = this.constructionsManager.getClosestConstructionSite(this.creep);
		// console.log('ClosestConstructin: ' + JSON.stringify(site));
		// if(this.creep.build(site) == ERR_NOT_IN_RANGE) {
			// this.creep.moveTo(site, {visualizePathStyle: {stroke: '#ffffff'}});
		// }
		
		// var worker = this.getWorker();
		// var range = 1;
		// if(!worker) {
			//console.log('ClosestController: ' + JSON.stringify(site));
			// worker = this.constructionsManager.controller;
			// range = 2;
		// }

		// if(!this.creep.pos.isNearTo(worker, range)) {
			//this.creep.moveTo(worker, {avoid: avoidArea});
			// this.creep.moveTo(worker);
			
			// this.creep.say('depositCon');
		// } else {
			// this.remember('move-attempts', 0);
		// }
		
		// this.harvest();
	} else {
		//console.log('Else-CreepCarrier.act.harvest');
		this.creep.moveTo(this.resource);
		this.creep.harvest(this.resource);
		this.remember('lastAction', ACTIONS.HARVEST);		
		
	}
	this.remember('last-energy', this.creep.energy);
}

CreepCarrier.prototype.getWorker = function() {
	if(this.remember('target-worker')) {
		return Game.getObjectById(this.remember('target-worker'));
	}

	return false;
}

CreepCarrier.prototype.depositEnergy = function() {
	var avoidArea = this.getAvoidedArea();
	//console.log('Empty Deposits: ' + this.depositManager.getEmptyDeposits().length);
	/* if (this.remember('lastAction') == ACTIONS.DEPOSIT_CONTROLLER) {
		var deposit = this.constructionManager.controller;
		console.log('creepMiner.deposit: ' + deposit);
		console.log('creepMiner.deposit.upgradeErrInRange: ' + this.creep.upgradeController(deposit) == ERR_NOT_IN_RANGE);
		if(this.creep.upgradeController(deposit) == ERR_NOT_IN_RANGE) {
			console.log('creepMiner.deposit.moveTO');
			this.creep.moveTo(deposit, {visualizePathStyle: {stroke: '#ffffff'}});
		} else {
			console.log('creepMiner.deposit.upgradeController');
			this.creep.upgradeController(deposit);
		}
		console.log('creepMiner: deposit for controller last action');
		
		//this.creep.moveTo(deposit);
		//this.creep.upgradeController(deposit, RESOURCE_ENERGY);
		
		this.remember('lastAction', ACTIONS.DEPOSIT_CONTROLLER);
		
		
	} else*/
	
	if(this.depositManager.getEmptyDeposits().length == 0 && this.depositManager.getSpawnDeposit().energy == this.depositManager.getSpawnDeposit().energyCapacity) {		
		this.depositFor = DEPOSIT_FOR.CONSTRUCTION;
		//console.log('creepCarrier: depositForConstruction');
	} else if(this.depositManager.energy() / this.depositManager.energyCapacity() < 0.3) {
		this.depositFor = DEPOSIT_FOR.POPULATION;		
		//console.log('creepCarrier: depositForPopulation');
	} else {
		this.depositFor = DEPOSIT_FOR.POPULATION;		
		//console.log('creepCarrier: depositForController');
	}
	
	if(this.depositFor == DEPOSIT_FOR.POPULATION) {
		
		//TRANSFER TO SPAWN
		var deposit = this.getDeposit();
		//this.creep.moveTo(deposit, {avoid: avoidArea});
		this.creep.moveTo(deposit);
		this.creep.say('CdepositPop');
		//console.log('here for population: ' + deposit);
		this.creep.transfer(deposit, RESOURCE_ENERGY);
		this.remember('lastAction', ACTIONS.DEPOSIT);
		//console.log('CarrierPopulationDeposit');
		//this.creep.transferEnergy(deposit);
	} else if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		//console.log('Carrier: depositForConstructionAction');
		//var spawns = this.depositManager.spawns;
		//console.log('Spawn ' + spawns);
		this.creep.say('Cconstruction');
		//console.log('CarrierConstructionDeposit***');
		//var deposit = spawns;
		//this.creep.moveTo(deposit[0]);
		//this.creep.transfer(deposit[0], RESOURCE_ENERGY);
		// if(this.creep.transfer(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			// console.log('creepCarrier.deposit.moveTO');
			// this.creep.moveTo(spawns[0], {visualizePathStyle: {stroke: '#ffffff'}});
		// }
		var site = this.constructionsManager.getClosestConstructionSite(this.creep);
		//console.log('ClosestConstructin: ' + JSON.stringify(site));
		if(this.creep.build(site) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(site, {visualizePathStyle: {stroke: '#ffffff'}});
		}
		
		var worker = this.getWorker();
		var range = 1;
		if(!worker) {
			//console.log('ClosestController: ' + JSON.stringify(site));
			worker = this.constructionsManager.controller;
			range = 2;
		}

		if(!this.creep.pos.isNearTo(worker, range)) {
			// this.creep.moveTo(worker, {avoid: avoidArea});
			this.creep.moveTo(worker);			
			this.creep.say('353depositCon');
		} else {
			this.remember('move-attempts', 0);
		}
		this.remember('lastAction', ACTIONS.DEPOSIT_CONSTRUCTION);
		this.depositWorker();
		
		
	} else if (this.depositFor == DEPOSIT_FOR.CONTROLLER) {
		this.creep.say('CdepositConT');
		//console.log('CarrierConstructionController***');
		var deposit = this.constructionsManager.controller;
		this.creep.moveTo(deposit);
		this.creep.transfer(deposit, RESOURCE_ENERGY);
		this.remember('lastAction', ACTIONS.DEPOSIT_CONTROLLER);
	}
	
}

CreepCarrier.prototype.getDeposit = function() {
	return this.cache.remember(
		'selected-deposit',
		function() {
			var deposit = false;

			// Deposit energy
			if(this.remember('closest-deposit')) {
				deposit = this.depositManager.getEmptyDepositOnId(this.remember('closest-deposit'));
			}

			if(!deposit) {
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

CreepCarrier.prototype.pickupEnergy = function() {
	var avoidArea = this.getAvoidedArea();
	if(this.creep.energy == this.creep.energyCapacity) {
		return false;
	}

	//var target = this.creep.pos.findInRange(FIND_DROPPED_ENERGY,2, {avoid: avoidArea});
	var target = this.creep.pos.findInRange(FIND_DROPPED_ENERGY,2);
	//console.log('dropped energy: ' + target.length);
	if(target.length) {
	    this.creep.pickup(target[0]);
		this.creep.say('picking up energy');
	}
};
CreepCarrier.prototype.harvestEnergy = function() {
	var avoidArea = this.getAvoidedArea();
	//this.creep.moveTo(this.resource, {avoid: avoidArea});
	this.creep.moveTo(this.resource);
	//harvest energy as long as there's not too much activity happening
	if(this.creep.pos.inRangeTo(this.resource, 3)) {
		this.harvest();
		this.remember('activeHarvest', this.resource.id);
		//console.log('gotoHarvest');
	} else {
		this.remember('activeHarvest', null);
	}
	
	this.remember('last-action', ACTIONS.HARVEST);
	this.forget('closest-deposit');
}

CreepCarrier.prototype.depositEnergyWorker = function() {
	var avoidArea = this.getAvoidedArea();	
	if(this.creep.pos.inRangeTo(this.resource, 3)) {
		
		this.remember('activeHarvest', this.resource.id);
		//console.log('gotoHarvest');
	} else {
		this.remember('activeHarvest', null);
	}
	
	this.remember('last-action', ACTIONS.HARVEST);
	this.forget('closest-deposit');
}

CreepCarrier.prototype.harvest = function() {
	
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	//console.log('here');
	if(creepsNear.length){
		for(var n in creepsNear){
			if(creepsNear[n].memory.role === 'CreepMiner' && creepsNear[n].energy != 0){
				////creepsNear[n].transferEnergy(this.creep);
				creepsNear[n].transfer(this.creep, RESOURCE_ENERGY);
			}
			
			// if(this.creep.store[RESOURCE_ENERGY] < this.creep.store.getCapacity()
            // if(creepsNear[n].memory.role === 'CreepMiner' && this.creep.store[RESOURCE_ENERGY] > 0){
                // this.creep.transfer(creepsNear[n], RESOURCE_ENERGY);
                //this.creep.transferEnergy(creepsNear[n]);
			// } else {
				
			// }
		}
	}
}

CreepCarrier.prototype.depositWorker = function() {
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	//console.log('here');
	if(creepsNear.length){
		for(var n in creepsNear){
			// if(creepsNear[n].memory.role === 'CreepMiner' && creepsNear[n].energy != 0){
				////creepsNear[n].transferEnergy(this.creep);
				// creepsNear[n].transfer(this.creep, RESOURCE_ENERGY);
			// }
			//if(this.creep.store[RESOURCE_ENERGY] < this.creep.store.getCapacity()
            if(creepsNear[n].memory.role === 'CreepBuilder' && this.creep.store[RESOURCE_ENERGY] > 0){
                this.creep.transfer(creepsNear[n], RESOURCE_ENERGY);
                //this.creep.transferEnergy(creepsNear[n]);
			} else {
				
			}
			if(creepsNear[n].memory.role === 'CreepUpgrader' && this.creep.store[RESOURCE_ENERGY] > 0){
                this.creep.transfer(creepsNear[n], RESOURCE_ENERGY);
                //this.creep.transferEnergy(creepsNear[n]);
			}
		}
	}
}

module.exports = CreepCarrier;