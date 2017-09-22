var roleBuilder = function(creep, depositManager, constructionManager) {
	this.creep = creep;
	this.depositManager = depositManager;
	this.constructionManager = constructionManager;
	this.forceControllerUpgrade = false;
};

roleBuilder.prototype.init = function() {
	this.remember('role', 'roleBuilder');
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}

	if(this.moveToNewRoom() == true) {
		return;
	}

	this.forceControllerUpgrade = this.remember('forceControllerUpgrade');
	console.log('I!@!@!@!@!@!@!@!@!@!@!@m in the builder class');
	//if(this.randomMovement() == false) {
		this.act();
	//}
};

roleBuilder.prototype.act = function() {
	var site = false;
	var avoidArea = this.getAvoidedArea();
	if(!this.forceControllerUpgrade) {
		site = this.constructionManager.constructStructure(this);
	}

	if(!site) {
		var site = this.constructionManager.getController();
		this.creep.moveTo(site, {avoid: avoidArea});
		this.creep.upgradeController(site);
	}

	if(this.creep.pos.inRangeTo(site, 3)) {
		this.giveEnergy(site);
	}
	this.remember('last-energy', this.creep.energy);
};

roleBuilder.prototype.giveEnergy = function(site) {
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	if(creepsNear.length){
		if(site) {
			var closest = site.pos.findClosestByRange(creepsNear.concat(this.creep),{
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
			if(creepsNear[n].memory.role === 'roleBuilder'){
				if(creepsNear[n].memory['last-energy'] > creepsNear[n].energy) {
					this.creep.transfer(creepsNear[n],RESOURCE_ENERGY);
				}
			}
		}
	}
}

module.exports = roleBuilder;