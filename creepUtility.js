var CreepMiner = require('CreepMiner');
var CreepBase = require('CreepBase');
var utility = require('utility');
var Cache = require('Cache');

function creepUtility(room) {
	this.cache = new Cache();
	this.room = room;
	this.creeps = this.room.find(FIND_MY_CREEPS);
	this.creepTypes = {
		harvester: {
			total: 0,
			goalPercentage: 0.1,
			currentPercentage: 0,
			max: 5,
			minExtensions: 0
		},
		builder: {
			total: 0,
			goalPercentage: 0.1,
			currentPercentage: 0,
			max: 5,
			minExtensions: 0
		},
		upgrader: {
			total: 0,
			goalPercentage: 0.1,
			currentPercentage: 0,
			max: 5,
			minExtensions: 2
		}
	};

	for(var i = 0; i < this.creeps.length; i++) {
		var creepType = this.creeps[i].memory.role;
		if(!this.creepTypes[creepType]) {
			this.creepTypes[creepType] = createType(creepType);
		}
		this.creepTypes[creepType].total++;
	}

	for(var name in this.creepTypes) {
		var curr = this.creepTypes[name];
		this.creepTypes[name].currentPercentage = curr.total / this.getTotalPopulation();
	}

}

/*creepUtility.prototype.load = function(creep) {
	var loadedCreep = null;
	var role = creep.memory.role;
	if(!role) {
		role = creep.name.split('-')[0];
	}
    console.log(role);
	switch(role) {

		case 'builder':
			loadedCreep = new CreepBuilder(creep, this.depositManager, this.constructionsManager);
		break;
		case 'CreepMiner':
			loadedCreep = new CreepMiner(creep, this.resourceManager);
		break;
	}

	if(!loadedCreep) {
		return false;
	}

	utility.extend(loadedCreep, CreepBase);
	loadedCreep.init();

	return loadedCreep;
};*/


creepUtility.prototype.getType = function(type) {
	return this.creepTypes[type];
};

creepUtility.prototype.getTotalPopulation = function() {
	return this.creeps.length;
};

creepUtility.prototype.getMaxPopulation = function() {
	return this.cache.remember(
		'max-population',
		function() {
			var population = 0;
			for(var n in this.typeDistribution) {
				population += this.typeDistribution[n].max;
			}
			return population;
		}.bind(this)
	);
};

creepUtility.prototype.getNextExpectedDeath = function() {
	return this.cache.remember(
		'creep-ttl',
		function() {
			var ttl = 100000;
			for(var i = 0; i < this.creeps.length; i++) {
				var creep = this.creeps[i];

				if(creep.ticksToLive < ttl) {
					ttl = creep.ticksToLive;
				}

				return ttl;
			}
		}.bind(this)
	);
};

//resources
creepUtility.prototype.getSources = function(room) {
	return this.cache.remember(
		'sources',
		function() {
			return this.room.find(
				FIND_SOURCES, {
					filter: function(src) {
						var targets = src.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
						if(targets.length == 0) {
						    return true;
						}

						return false;
					}
				}
			);
		}.bind(this)
	);
};

creepUtility.prototype.getAvailableResource = function() {
	// Some kind of unit counter per resource (with Population)
	var srcs = this.getSources();
	var srcIndex = Math.floor(Math.random()*srcs.length);

	return srcs[srcIndex];
};

creepUtility.prototype.getResourceById = function(id) {
	return Game.getObjectById(id);
};

module.exports = creepUtility;

//creep types
function createType(type) {
	return {
		total: 0,
		goalPercentage: 0.1,
		currentPercentage: 0,
		max: 5
	};
};