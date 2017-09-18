var creepUtility = require('creepUtility');

function roomMain(room, roomController) {
    this.room = room;
    this.roomController = roomController;
    this.creeps = [];
    this.structures = [];


    this.creepUtility = new creepUtility(this.room);
    
    //this.depositManager = new Deposits(this.room);
    //this.resourceManager = new Resources(this.room, this.population);
    //this.constructionManager = new Constructions(this.room);
    //this.population.typeDistribution.CreepBuilder.max = 4;
    //this.population.typeDistribution.CreepMiner.max = (this.resourceManager.getSources().length+1)*2;
    //this.population.typeDistribution.CreepCarrier.max = this.population.typeDistribution.CreepBuilder.max+this.population.typeDistribution.CreepMiner.max;
    //this.creepFactory = new CreepFactory(this.depositManager, this.resourceManager, this.constructionManager, this.population, this.roomHandler);
}

Room.prototype.loadCreeps = function() {
    var creeps = this.room.find(FIND_MY_CREEPS);
    for(var n in creeps) {
        var c = this.creepFactory.load(creeps[n]);
        if(c) {
            this.creeps.push(c);
        }
    }

    /*this.distributeBuilders();
    this.distributeResources('CreepMiner');
    this.distributeResources('CreepCarrier');
    this.distributeCarriers();*/
};
module.exports = roomMain;