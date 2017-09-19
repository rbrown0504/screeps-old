var CreepBase = require('CreepBase');
var CreepMiner = require('CreepMiner');
var utility = require('utility');

function creepHandler(creepUtility) {
	this.creepUtility = creepUtility;
}

creepHandler.prototype.load = function(creep) {
	var loadedCreep = null;
	var role = creep.memory.role;
	if(!role) {
		role = creep.name.split('-')[0];
	}
    console.log(role + 'im' );
	switch(role) {

		/*case 'builder':
			loadedCreep = new CreepBuilder(creep, this.depositManager, this.constructionsManager);
		break;*/
		case 'CreepMiner':
			loadedCreep = new CreepMiner(creep, this.creepUtility);
		break;
	}

	if(!loadedCreep) {
		return false;
	}

	utility.extend(loadedCreep, CreepBase);
	loadedCreep.init();

	return loadedCreep;
};

module.exports = creepHandler;