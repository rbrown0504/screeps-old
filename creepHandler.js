/*Credit to for original for this foundation: screeps-ai https://github.com/beije/screeps-ai, any additional modifications made by myself.*/
var CreepBase = require('CreepBase');
var roleMiner = require('roleMiner');
var roleCarrier = require('roleCarrier');
var utility = require('utility');

function creepHandler(creepUtility, depositManager, constructionsManager) {
	this.creepUtility = creepUtility;
	this.depositManager = depositManager;
	this.constructionsManager = constructionsManager;
}

creepHandler.prototype.load = function(creep) {
	var loadedCreep = null;
	var role = creep.memory.role;
	if(!role) {
		role = creep.name.split('-')[0];
	}
	//console.log(role);
	switch(role) {

		/*case 'builder':
			loadedCreep = new CreepBuilder(creep, this.depositManager, this.constructionsManager);
		break;*/

		case 'roleMiner':
			loadedCreep = new roleMiner(creep, this.creepUtility);
		break;
		case 'roleCarrier':
			loadedCreep = new roleCarrier(creep, this.depositManager, this.creepUtility, this.constructionsManager);
		break;
	}

	if(!loadedCreep) {
		//console.log('making it to false***************************');
		return false;
	}

	utility.extend(loadedCreep, CreepBase);
	loadedCreep.init();

	return loadedCreep;
};

creepHandler.prototype.new = function(creepType, spawn) {
	var abilities = [];
	var id = new Date().getTime();
	var creepLevel = this.creepUtility.getTotalPopulation() / this.creepUtility.populationLevelMultiplier;
	var resourceLevel = this.depositManager.getFullDeposits().length / 5;
	var level = Math.floor(creepLevel + resourceLevel);
	if(this.creepUtility.getTotalPopulation() < 5){
		level = 1;
	}
	// TOUGH          10
	// MOVE           50
	// CARRY          50
	// ATTACK         80
	// WORK           100
	// RANGED_ATTACK  150
	// HEAL           200

	switch(creepType) {
		case 'roleMiner':
		/*case 'harvester':
			if(level <= 1) {
				abilities = [WORK, CARRY, MOVE];
			}
		case 'builder':
			if(level <= 1) {
				abilities = [WORK, CARRY, MOVE];
			}
		case 'upgrader':
			if(level <= 1) {
				abilities = [WORK, CARRY, MOVE];
			}*/
		case 'roleBuilder':
			if(level <= 1) {
				abilities = [WORK, CARRY, MOVE];
			} else
			if(level <= 2) {
				abilities = [WORK, WORK, CARRY, MOVE];
			} else
			if(level <= 3) {
				abilities = [WORK, WORK, CARRY, MOVE, MOVE];
			} else
			if(level <= 4) {
				abilities = [WORK, WORK, WORK, CARRY, MOVE, MOVE];
			} else
			if(level <= 5) {
				abilities = [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
			} else
			if(level <= 6) {
				abilities = [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE];
			} else
			if(level <= 7) {
				abilities = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
			} else
			if(level <= 8) {
				abilities = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
			} else
			if(level <= 9) {
				abilities = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
			} else
			if(level >= 10) {
				abilities = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
			}
		break;
		case 'roleCarrier':
			if(level <= 1) {
				abilities = [CARRY, MOVE];
			} else
			if(level <= 2) {
				abilities = [CARRY, CARRY, MOVE];
			} else
			if(level <= 3) {
				abilities = [CARRY, CARRY, MOVE, MOVE];
			} else
			if(level <= 4) {
				abilities = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
			} else
			if(level <= 5) {
				abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
			} else
			if(level <= 6) {
				abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
			} else
			if(level <= 7) {
				abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
			} else
			if(level <= 8) {
				abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
			} else
			if(level <= 9) {
				abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
			} else
			if(level >= 10) {
				abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,  CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
			}
		break;
		case 'roleSoldier':
			if(level <= 1) {
				abilities = [TOUGH, ATTACK, MOVE];
			} else
			if(level <= 2) {
				abilities = [TOUGH, MOVE, ATTACK, MOVE];
			} else
			if(level <= 3) {
				abilities = [TOUGH, MOVE, ATTACK, ATTACK, ATTACK, MOVE];
			} else
			if(level <= 4) {
				abilities = [TOUGH, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
			} else
			if(level <= 5) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
			} else
			if(level <= 6) {
				abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
			} else
			if(level <= 7) {
				abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
			} else
			if(level <= 8) {
				abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
			} else
			if(level <= 9) {
				abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
			} else
			if(level >= 10) {
				abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
			}
		break;
		case 'roleShooter':
			if(level <= 5) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level <= 6) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level <= 7) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level <= 8) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level <= 9) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level >= 10) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			}
		break;
		case 'roleScout':
			abilities = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
		break;
		case 'roleHealer':
			abilities = [MOVE, MOVE, MOVE, HEAL, MOVE];
		break;
	}

	var canBuild = spawn.canCreateCreep(
		abilities,
		creepType + '-' + id,
		{
			role: creepType
		}
	);
	if(canBuild !== 0) {
		console.log('Can not build creep: ' + creepType + ' @ ' + level);
		return;
	}

	console.log('Spawn level ' + level + ' ' + creepType + '(' + creepLevel + '/' + resourceLevel + ')');
	spawn.createCreep(abilities, creepType + '-' + id, {role: creepType});
};


module.exports = creepHandler;