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
		roleMiner: {
			total: 0,
			goalPercentage: 0,
			currentPercentage: 0,
			max: 10,
			minExtensions: 5
		},
		roleHarvester: {
			total: 0,
			goalPercentage: 25,
			currentPercentage: 0,
			max: 5,
			minExtensions: 0
		},
		roleCarrier: {
			total: 0,
			goalPercentage: 40,
			currentPercentage: 0,
			max: 3,
			minExtensions: 0
		},
		roleLDHarvester: {
			total: 0,
			goalPercentage: 80,
			currentPercentage: 0,
			max: 0,
			minExtensions: 0
		},
		upgrader: {
			total: 0,
			goalPercentage: 40,
			currentPercentage: 0,
			max: 10,
			minExtensions: 0
		},
		builder: {
			total: 0,
			goalPercentage: 20,
			currentPercentage: 0,
			max: 0,
			minExtensions: 0
		},
		roleBuilder: {
			total: 0,
			goalPercentage: 11,
			currentPercentage: 0,
			max: 4,
			minExtensions: 0
		},
		repairer: {
			total: 0,
			goalPercentage: 5,
			currentPercentage: 0,
			max: 1,
			minExtensions: 0
		},
		roleSoldier: {
			total: 0,
			goalPercentage: .01,
			currentPercentage: 0,
			max: 1,
			minExtensions: 0
		},
		roleClaimer: {
			total: 0,
			goalPercentage: 2.5,
			currentPercentage: 0,
			max: 1,
			minExtensions: 1
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

creepUtility.prototype.getRoom = function() {
	return this.room;
};

creepUtility.prototype.getRolePopulation = function(roleName) {
	var population = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
	//console.log('getRolePopulation:' + population);
	return population.length;
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
			for(var n in this.creepTypes) {
				population += this.creepTypes[n].max;
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

//resources
creepUtility.prototype.getMiners = function(roleName) {

	return this.cache.remember(
		'roleMiners',
		function() {
			return _.filter(Game.creeps, (creep) => creep.memory.role == 'roleMiner');
		}.bind(this)
	);
};

creepUtility.prototype.getAvailableResource = function() {
	// Some kind of unit counter per resource (with Population)
	var srcs = this.getSources();
	var srcIndex = Math.floor(Math.random()*srcs.length);

	return srcs[srcIndex];
};

creepUtility.prototype.getTargetMiner = function(role) {
	var mnrs = this.getMiners();
	var mnrIndex = Math.floor(Math.random()*mnrs.length);

	return mnrs[mnrIndex];
};

creepUtility.prototype.getResourceById = function(id) {
	return Game.getObjectById(id);
};

creepUtility.prototype.getEnergy =
    function (useContainer, useSource, creep) {
        /** @type {StructureContainer} */
        let container;
        // if the Creep should look for containers
        if (useContainer) {
            // find closest container
            container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                             s.store[RESOURCE_ENERGY] > 0
            });
            // if one was found
            if (container !== undefined) {
                // try to withdraw energy, if the container is not in range
                //console.log('get energy!@#!@#!@#!@#!@#!@#@!#!@#@!#');
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(container);
                }
            }
        }
        // if no container was found and the Creep should look for Sources
        if (container == undefined && useSource) {
            // find closest source
            var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            // try to harvest energy, if the source is not in range
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards it
                creep.moveTo(source);
            }
        }
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