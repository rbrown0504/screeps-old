var Cache = require('Cache');
function creepUtility(room) {
	this.cache = new Cache();
	this.room = room;
	this.creeps = this.room.find(FIND_MY_CREEPS);

}

creepUtility.prototype.getTotalPopulation = function() {
	return this.creeps.length;
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

module.exports = creepUtility;