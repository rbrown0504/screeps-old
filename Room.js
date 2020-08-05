var Deposits = require('Deposits');
var CreepFactory = require('CreepFactory');
var Population = require('Population');
var Resources = require('Resources');
var Constructions = require('Constructions');

function Room(room, roomHandler) {
	this.room = room;
	this.roomHandler = roomHandler;
	this.creeps = [];
	this.structures = [];
	this.population = new Population(this.room);
	this.depositManager = new Deposits(this.room);
	this.resourceManager = new Resources(this.room, this.population);
	this.constructionManager = new Constructions(this.room, this.population);
	this.resourceAssignment = new Map();
	this.population.typeDistribution.CreepBuilder.max = 4;
	this.population.typeDistribution.CreepMiner.max = (this.resourceManager.getSources().length+1)*2;
	this.population.typeDistribution.CreepCarrier.max = this.population.typeDistribution.CreepBuilder.max+this.population.typeDistribution.CreepMiner.max;
	//console.log('preCreepFactory');
	this.creepFactory = new CreepFactory(this.depositManager, this.resourceManager, this.constructionManager, this.population, this.roomHandler);
	//console.log(JSON.stringify(this.creepFactory));
}

Room.prototype.askForReinforcements = function() {
	console.log(this.room.name + ': ask for reinforcements.');
	this.roomHandler.requestReinforcement(this);
};

Room.prototype.sendReinforcements = function(room) {
	if(!Memory[this.room.name]) {
		Memory[this.room.name] = {};
	}
	var alreadySending = false;
	for(var i = 0; i < this.population.creeps.length; i++) {
		var creep = this.population.creeps[i];
		if(creep.memory.targetRoom == room.room.name) {
			alreadySending = true;
			break;
		}
	}
	if(alreadySending) {
		console.log(this.room.name + ': already given reinforcements');
		return;
	}
	console.log('room.population: ' + this.population.getTotalPopulation());
	console.log('room.population.max: ' + this.population.getMaxPopulation());
	if(this.population.getTotalPopulation() < this.population.getMaxPopulation()*0.8) {
		console.log(this.room.name + ': Not enough resources ' + '(' + this.population.getTotalPopulation() + '/' + this.population.getMaxPopulation()*0.8 + ')');
		return;
	}

	var sentType = [];
	for(var i = 0; i < this.population.creeps.length; i++) {
		var creep = this.population.creeps[i];
		if(creep.ticksToLive < 1000) {
			continue;
		}
		if(sentType.indexOf(creep.memory.role) == -1) {
			sentType.push(creep.memory.role);
			console.log('sending: ' + creep.memory.role);
			creep.memory.targetRoom = room.room.name;
		}
	}
}

Room.prototype.populate = function() {
	if(this.depositManager.spawns.length == 0 && this.population.getTotalPopulation() < 10) {
		this.askForReinforcements()
	}

	for(var i = 0; i < this.depositManager.spawns.length; i++) {
		var spawn = this.depositManager.spawns[i];
		if(spawn.spawning) {
			continue;
		}

		if((this.depositManager.energy() / this.depositManager.energyCapacity()) > 0.2) {
			var types = this.population.getTypes()
			for(var i = 0; i < types.length; i++) {
				var ctype = this.population.getType(types[i]);
				// console.log('Minimum Extensions: ' + ctype.minExtensions);
				// console.log('Deposits Found: ' + this.depositManager.deposits.length);
				// console.log('Type: ' + types[i]);
				// console.log('ctype.min ' + ctype.min);
				// console.log('ctype.total ' + ctype.total);
				if(this.depositManager.deposits.length > ctype.minExtensions) {
					
					if (ctype.min > ctype.total && (types[i] == 'CreepMiner' || types[i] == 'CreepMiner' ) ) {
						console.log('Spawning Minimim');
						this.creepFactory.new(types[i], this.depositManager.getSpawnDeposit());
						break;
					} else {
						if((ctype.goalPercentage > ctype.currentPercentage && ctype.total < ctype.max) || ctype.total == 0 || ctype.total < ctype.max*0.75) {
							this.creepFactory.new(types[i], this.depositManager.getSpawnDeposit());
							break;
						}
					}
					
					
				} else if (this.population.getTotalPopulation() < 10) {
					this.creepFactory.new(types[i], this.depositManager.getSpawnDeposit());
					break;
				} else if (this.population.getTotalPopulation() > 11 && (types[i] == 'CreepMiner' || types[i] == 'CreepCarrier' || types[i] == 'CreepBuilder') && ctype.min > ctype.total) {
					//added this in because there was only one builder and a ton of carriers around it. nothing was spawning for a builder.
					console.log('Room.CatchUpSpawn');
					this.creepFactory.new(types[i], this.depositManager.getSpawnDeposit());
					break;
				}
			}
		}
	}

};

Room.prototype.loadCreeps = function() {
	var creeps = this.room.find(FIND_MY_CREEPS);
	for(var n in creeps) {
		var c = this.creepFactory.load(creeps[n]);
		if(c) {
			this.creeps.push(c);
		}
	}
	this.distributeBuilders();
	//let sourceAssignmentMap = new Map()
	//contacts.set('Jessie', {phone: "213-555-1234", address: "123 N 1st Ave"})
	//contacts.has('Jessie') // true
	//contacts.get('Hilary') // undefined
	//contacts.set('Hilary', {phone: "617-555-4321", address: "321 S 2nd St"})
	//contacts.get('Jessie') // {phone: "213-555-1234", address: "123 N 1st Ave"}
	//contacts.delete('Raymond') // false
	//contacts.delete('Jessie') // true
	//console.log(contacts.size) // 1
	this.distributeResources('CreepMiner');
	this.distributeResources('CreepCarrier');
	this.distributeCarriers();
};
Room.prototype.distributeBuilders = function() {
	var builderStats = this.population.getType('CreepBuilder');
	if(this.depositManager.spawns.length == 0) {
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepBuilder') {
				continue;
			}

			creep.remember('forceControllerUpgrade', false);
		}
		return;
	}
	console.log('Room.BuilderStats ' + JSON.stringify(builderStats<=3));
	if(builderStats <= 3) {
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepBuilder') {
				continue;
			}
			creep.remember('forceControllerUpgrade', false);
		}
	} else {
		console.log('room.builderStatselse');
		//this seems to be adding 2 to upgrade controller every time population is greater than 3
		//this seems to be adding 2 to upgrade controller every time population is greater than 3 (issue 1)
		//the issue here is that the list creeps can return inconsistent sort and appears to eventually make every builder a controller contributer
		var c = 0;
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepBuilder') {
				continue;
			}
			console.log('room.builderStatsForceUpgradeTrue');
			creep.remember('forceControllerUpgrade', true);
			c++;
			if(c == 2) {
				break;
			}
		}
	}
}
Room.prototype.distributeCarriers = function() {
	var counter = 0;
	var builders = [];
	var carriers = [];
	for(var i = 0; i < this.creeps.length; i++) {
		var creep = this.creeps[i];
		if(creep.remember('role') == 'CreepBuilder') {
			builders.push(creep.creep);
		}
		if(creep.remember('role') != 'CreepCarrier') {
			continue;
		}
		carriers.push(creep);
		if(!creep.getDepositFor()) {
			if(counter%2) {
				// Construction
				creep.setDepositFor(1);
			} else {
				// Population
				creep.setDepositFor(2);
			}
		}

		counter++;
	}
	counter = 0;
	for(var i = 0; i < carriers.length; i++) {
		var creep = carriers[i];
		if(creep.remember('role') != 'CreepCarrier') {
			continue;
		}
		if(!builders[counter]) {
			continue;
		}
		var id = creep.remember('target-worker');
		if(!Game.getObjectById(id)) {
			creep.remember('target-worker', builders[counter].id);
		}
		counter++;
		if(counter >= builders.length) {
			counter = 0;
		}
	}
};

Room.prototype.distributeResources = function(type) {
	var sources = this.resourceManager.getSources();
	var perSource = Math.ceil(this.population.getType(type).total/sources.length);
	for(var i = 0; i < sources.length; i++) {
		this.resourceAssignment[sources[i].id] = {primaryCount : 0, assignment : ''};
	}
	
	var counter = 0;
	var source = 0;

	for(var i = 0; i < this.creeps.length; i++) {
		var creep = this.creeps[i];
		if(creep.remember('role') != type) {
			continue;
		}
		if(!sources[source]) {
			continue;
		}
		this.resourceAssignment[sources[source].id].primaryCount++;
		if (this.resourceAssignment[sources[source].id].assignment != null) {
			var existing = this.resourceAssignment[sources[source].id].assignment
			this.resourceAssignment[sources[source].id].assignment = existing +',' + creep.creep.name;
		} else {
			this.resourceAssignment[sources[source].id].assignment = creep.creep.name;
		}
		counter++;
		if(counter >= perSource) {
			counter = 0;
			source++;
		}
	}
};

module.exports = Room;
