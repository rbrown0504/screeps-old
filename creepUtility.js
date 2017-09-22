/*Credit to for original for this foundation: screeps-ai https://github.com/beije/screeps-ai, any additional modifications made by myself.*/
var utility = require('utility');
var Cache = require('Cache');

function creepUtility(room) {
	this.cache = new Cache();
	this.room = room;
	this.creeps = this.room.find(FIND_MY_CREEPS);
	this.population = 0;
	this.populationLevelMultiplier = 8;
	this.creepTypes = {
		roleCarrier: {
			total: 0,
			goalPercentage: 25,
			currentPercentage: 0,
			max: 5,
			minExtensions: 0
		},
		roleMiner: {
			total: 0,
			goalPercentage: 25,
			currentPercentage: 0,
			max: 5,
			minExtensions: 0
		},
		upgrader: {
			total: 0,
			goalPercentage: 25,
			currentPercentage: 0,
			max: 5,
			minExtensions: 0
		},
		roleBuilder: {
			total: 0,
			goalPercentage: 25,
			currentPercentage: 0,
			max: 1,
			minExtensions: 0
		},
		builder: {
			total: 0,
			goalPercentage: 25,
			currentPercentage: 0,
			max: 5,
			minExtensions: 0
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

creepUtility.prototype.getTypes = function(type) {
	var types = [];
	for(var n in this.creepTypes) {
		types.push(n);
	}
	return types;
};


creepUtility.prototype.getType = function(type) {
	return this.creepTypes[type];
};

creepUtility.prototype.getTypes = function(type) {
	var types = [];
	for(var n in this.creepTypes) {
		types.push(n);
	}
	return types;
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