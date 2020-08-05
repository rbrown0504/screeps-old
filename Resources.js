var Cache = require('Cache');
function Resources(room, population) {
	this.cache = new Cache();
	this.room = room;
	this.population = population;
	this.workersNear = new Map();
	this.minersNear = new Map();
	var srcs = this.getSources();
	for(var i = 0; i < srcs.length; i++) {		
		for(var i1 = 0; i1 < this.population.creeps.length; i1++) {
			//console.log('processingworker');
			var theCreep = this.population.creeps[i1];
			if(theCreep.pos.isNearTo(srcs[i])) {
				//console.log('NearSource ' + theCreep.name + ' Source ' + srcs[i]);
				if (this.workersNear.get(srcs[i]) != null) {
					var existingWorkers = new Array();
					existingWorkers = this.workersNear.get(srcs[i]);
					existingWorkers.push(theCreep.id);
					this.workersNear.set(srcs[i],existingWorkers);
				} else {
					var addWorkers = new Array();
					addWorkers.push(theCreep.id);
					this.workersNear.set(srcs[i],addWorkers);
				}
				
				if(theCreep.memory.role == 'CreepMiner') {
					if (this.minersNear.get(srcs[i]) != null) {
						var existingWorkers = new Array();
						existingWorkers = this.minersNear.get(srcs[i]);
						//existingWorkers.push(theCreep.name);
						existingWorkers.push(theCreep.id);
						this.minersNear.set(srcs[i],existingWorkers);
					} else {
						var addWorkers = new Array();
						//addWorkers.push(theCreep.name);
						addWorkers.push(theCreep.id);
						this.minersNear.set(srcs[i],addWorkers);
					}
				}
			}
		}
	}
}

Resources.prototype.getAvailableResource = function() {
	// Some kind of unit counter per resource (with Population)
	var srcs = this.getSources();
	var srcIndex = Math.floor(Math.random()*srcs.length);

	return srcs[srcIndex];
};
Resources.prototype.getResourceById = function(id) {
	return Game.getObjectById(id);
};
Resources.prototype.getSources = function(room) {
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

module.exports = Resources;
