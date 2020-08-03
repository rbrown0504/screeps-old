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
	DEPOSIT_CONTROLLER: 3
};

var DEPOSIT_FOR = {
	CONSTRUCTION: 1,
	POPULATION: 2,
	CONTROLLER: 3
}

function CreepMiner(creep, resourceManager, population, depositManager, constructionManager) {
	this.cache = new Cache();
	this.creep = creep;
	this.resourceManager = resourceManager;
	this.depositManager = depositManager;
	this.constructionManager = constructionManager;
	this.population = population;
	this.resource = false;
};

CreepMiner.prototype.init = function() {
	this.remember('role', 'CreepMiner');
	//console.log('creepMiner.Source: ' + this.remember('source'));
	if(!this.remember('source')) {
		console.log('creepMiner: New Resource Assigned');
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
	}
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
	if(this.moveToNewRoom() == true) {
		return;
	}
	this.resource = this.resourceManager.getResourceById(this.remember('source'));

	this.act();
};

CreepMiner.prototype.act = function() {
	var avoidArea = this.getAvoidedArea();
	//this.giveEnergy();
	console.log('CreepMiner.act');
	if(this.creep.store[RESOURCE_ENERGY] == this.creep.store.getCapacity()) {
		if(this.population.typeDistribution['CreepCarrier'].total == 0) {
			console.log('CreepMiner.act.noCarrier');
			this.creep.say('minerFull');
			this.depositEnergy();			
		} else {
			this.creep.say('minerCarrier');			
			console.log('CreepMiner.act.depositWCarrier');
			//this.depositEnergy();
		}
	} else if (this.creep.store[RESOURCE_ENERGY] > 0) {
		if (this.remember('last-action') == ACTIONS.DEPOSIT_CONTROLLER) {
			console.log('needToDepositController');
			var deposit = this.constructionManager.controller;
			console.log('creepMiner.deposit: ' + deposit);
			console.log('creepMiner.deposit.upgradeErrInRange: ' + this.creep.upgradeController(deposit) == ERR_NOT_IN_RANGE);
			if(this.creep.upgradeController(deposit) == ERR_NOT_IN_RANGE) {
				console.log('creepMiner.deposit.moveTO');
				this.creep.moveTo(deposit, {visualizePathStyle: {stroke: '#ffffff'}});
			}
		} else if (this.remember('last-action') == ACTIONS.HARVEST) {
			console.log('creepMiner.deposit.lastAction Harvest');
			this.creep.moveTo(this.resource);
			this.creep.harvest(this.resource);
			this.remember('last-action', ACTIONS.HARVEST);
		}
    } else if (this.creep.store[RESOURCE_ENERGY] == 0) {
		//this.creep.moveTo(this.resource, {avoid: avoidArea});
		this.creep.moveTo(this.resource);
		this.creep.harvest(this.resource);
		this.remember('last-action', ACTIONS.HARVEST);
		console.log('CreepMiner.act.harvest');
	} else {
		console.log('Else-CreepMiner.act.harvest');
		this.creep.moveTo(this.resource);
		this.creep.harvest(this.resource);
		this.remember('activeHarvest', this.resource.id);
		
	}
	this.remember('last-energy', this.creep.energy);
}

CreepMiner.prototype.giveEnergy = function() {
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	if(creepsNear.length){
		for(var n in creepsNear){
			if(creepsNear[n].memory.role === 'CreepMiner'){
				if(creepsNear[n].memory['last-energy'] == creepsNear[n].energy && creepsNear[n].energy < creepsNear[n].energyCapacity) {
					this.creep.transferEnergy(creepsNear[n]);
				}
			}
		}
	}
}

CreepMiner.prototype.depositEnergy = function() {
	var avoidArea = this.getAvoidedArea();
	//console.log('Empty Deposits: ' + this.depositManager.getEmptyDeposits().length);
	if (this.remember('last-action') == ACTIONS.DEPOSIT_CONTROLLER) {
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
		
		this.remember('last-action', ACTIONS.DEPOSIT_CONTROLLER);
		
		
	} else if(this.depositManager.getEmptyDeposits().length == 0 && this.depositManager.getSpawnDeposit().energy == this.depositManager.getSpawnDeposit().energyCapacity) {		
		this.depositFor = DEPOSIT_FOR.CONSTRUCTION;
		console.log('creepMiner: depositForConstruction');
	} else if(this.depositManager.energy() / this.depositManager.energyCapacity() < 0.3) {
		this.depositFor = DEPOSIT_FOR.POPULATION;		
		console.log('creepMiner: depositForPopulation');
	} else {
		this.depositFor = DEPOSIT_FOR.CONTROLLER;		
		console.log('creepMiner: depositForController');
	}
	
	if(this.depositFor == DEPOSIT_FOR.POPULATION) {
		//TRANSFER TO SPAWN
		var deposit = this.getDeposit();
		//this.creep.moveTo(deposit, {avoid: avoidArea});
		this.creep.moveTo(deposit);
		this.creep.say('depositPop');
		//console.log('here for population: ' + deposit);
		this.creep.transfer(deposit, RESOURCE_ENERGY);
		this.remember('last-action', ACTIONS.DEPOSIT);
		//this.creep.transferEnergy(deposit);
	} else if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		console.log('depositForConstructionAction');
		var deposit = this.constructionManager.controller;
		this.creep.moveTo(deposit);
		this.creep.transfer(deposit, RESOURCE_ENERGY);
		this.remember('last-action', ACTIONS.DEPOSIT_CONTROLLER);
		//setting all work towards controller right now
		//this.depositFor == DEPOSIT_FOR.CONTROLLER;
		//var site = this.constructionsManager.getClosestConstructionSite(this.creep);
		//console.log('ClosestConstructin: ' + JSON.stringify(site));
		// if(this.creep.build(site) == ERR_NOT_IN_RANGE) {
			// this.creep.moveTo(site, {visualizePathStyle: {stroke: '#ffffff'}});
		// }

		/* var worker = this.getWorker();
		var range = 1;
		if(!worker) {
			worker = this.constructionsManager.controller;
			range = 2;
		}

		if(!this.creep.pos.isNearTo(worker, range)) {
			//this.creep.moveTo(worker, {avoid: avoidArea});
			this.creep.moveTo(worker);
			this.creep.say('depositCon');
		} else {
			this.remember('move-attempts', 0);
		}
		this.harvest(); */
		
	} else if (this.depositFor == DEPOSIT_FOR.CONTROLLER) {
		var deposit = this.constructionManager.controller;
		this.creep.moveTo(deposit);
		this.creep.transfer(deposit, RESOURCE_ENERGY);
		this.remember('last-action', ACTIONS.DEPOSIT_CONTROLLER);
	}
	
}

CreepMiner.prototype.getDeposit = function() {
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

module.exports = CreepMiner;
