var Cache = require('Cache');
var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2
};

function CreepMiner(creep, creepUtility) {
	this.cache = new Cache();
	this.creep = creep;
	this.creepUtility = creepUtility;
	this.resource = false;
};

CreepMiner.prototype.init = function() {
	console.log('I made it to the miner utility');
	this.remember('role', 'CreepMiner');

	if(!this.remember('source')) {
		var src = this.creepUtility.getAvailableResource();
		this.remember('source', src.id);
	}
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
	if(this.moveToNewRoom() == true) {
		return;
	}

	this.resource = this.creepUtility.getResourceById(this.remember('source'));

	this.act();
};

CreepMiner.prototype.act = function() {
	var avoidArea = this.getAvoidedArea();

	this.giveEnergy();
	if(this.creep.energy == this.creep.energyCapacity) {
		//return;
	}
	this.creep.moveTo(this.resource, {avoid: avoidArea});
	this.creep.harvest(this.resource);
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

module.exports = CreepMiner;