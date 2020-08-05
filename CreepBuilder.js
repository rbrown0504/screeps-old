/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Builder'); // -> 'a thing'
 */
var CreepBuilder = function(creep, depositManager, constructionManager) {
	this.creep = creep;
	this.depositManager = depositManager;
	this.constructionManager = constructionManager;
	this.forceControllerUpgrade = false;
};

CreepBuilder.prototype.init = function() {
	this.remember('role', 'CreepBuilder');
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}

	if(this.moveToNewRoom() == true) {
		return;
	}

	this.forceControllerUpgrade = this.remember('forceControllerUpgrade');
    //console.log('builder here');
	//if(this.randomMovement() == false) {
		this.act();
	//}
};

CreepBuilder.prototype.act = function() {
    //console.log('builder act');
	var site = false;
	var avoidArea = this.getAvoidedArea();
	//console.log('Controller Upgrade:' + this.forceControllerUpgrade);
	if(!this.forceControllerUpgrade) {
	    
	    //console.log('Constructing Structure');
		site = this.constructionManager.constructStructure(this);
		
	}

	if(!site) {		
		var site = this.constructionManager.getController();
		var sites = this.constructionManager.sites;
		//console.log(JSON.stringify(sites[0]));		
		//this.creep.moveTo(site, {avoid: avoidArea});		
		//go to first construction site found
		this.creep.say('building');
		if(this.creep.build(sites[0]) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(sites[0], {visualizePathStyle: {stroke: '#ffffff'}});
		}
	}

	if(this.creep.pos.inRangeTo(site, 3)) {
		this.giveEnergy(site);
	}
	this.remember('last-energy', this.creep.energy);
};

CreepBuilder.prototype.giveEnergy = function(site) {
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	if(creepsNear.length){
		if(site) {
			var closest = site.pos.findClosestByPath(creepsNear.concat(this.creep),{
				filter: function(c) {
					if(c.energy == 0) {
						return true;
					}
				}
			});

			if(closest != this.creep) {
				this.creep.transfer(closest,RESOURCE_ENERGY);
				
				
			
			}
			return;
		}
		for(var n in creepsNear){
			if(creepsNear[n].memory.role === 'CreepBuilder'){
				if(creepsNear[n].memory['last-energy'] > creepsNear[n].energy) {
					this.creep.transferEnergy(creepsNear[n]);
				}
			}
		}
	}
}

module.exports = CreepBuilder;
