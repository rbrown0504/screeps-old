var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');

//load room utilities
var roomMain = require('roomMain');
var RoomController = require('roomController');

var utility = require('utility');
//load all rooms

for(var n in Game.rooms) {
    var roomController = new roomMain(Game.rooms[n], RoomController);
    RoomController.set(Game.rooms[n].name, roomController);
};
var rooms = RoomController.getRoomControllers();
for(var n in rooms) {
    var room = rooms[n];
    //room.loadCreeps();
    //room.populate();

    console.log('Name: ' + room.room.name + 
        ' | Population: ' + room.creepUtility.getTotalPopulation() + 
        ' | Next death: ' + room.creepUtility.getNextExpectedDeath() + ' ticks'
        );

    /*console.log(
        room.room.name + ' | ' +
        'goals met:' +
        room.population.goalsMet() +
        ', population: ' +
        room.population.getTotalPopulation() + '/' + room.population.getMaxPopulation() +
        ' (' + room.population.getType('CreepBuilder').total + '/' +
        room.population.getType('CreepMiner').total + '/' +
        room.population.getType('CreepCarrier').total + '/' +
        room.population.getType('CreepSoldier').total + 
        '), ' +
        'resources at: ' + parseInt( (room.depositManager.energy() / room.depositManager.energyCapacity())*100) +'%, ' +
        'max resources: ' + room.depositManager.energyCapacity() +'u, ' +
        'next death: ' + room.population.getNextExpectedDeath() +' ticks'
    );*/
};

module.exports.loop = function () {
    //roomMain = new roomMain(room,roomController);
    //this.creepUtility = new creepUtility(this.room);
    //var pop = creepUtility.getTotalPopulation();
    //console.log('Population: ' + op);
    


    //var sources = creep.room.find(FIND_SOURCES);
    //console.log('Sources: ' + sources.length);

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);

    if(harvesters.length < 8) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }
    if(upgraders.length < 2) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }
    if(builders.length < 2) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }
    
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }
    //figure some stuff out
    //integer numSources;
    //map<string,string> testddss = new map<string,string>();
    /*var myMap = new Map();

    var myMap = new Map();
    myMap.set(0, 'zero');
    myMap.set(1, 'one');
    for (var [key, value] of myMap) {
      console.log(key + ' = ' + value);
    }
    // 0 = zero
    // 1 = one

    for (var key of myMap.keys()) {
      console.log(key);
    }
    // 0
    // 1

    for (var value of myMap.values()) {
      console.log(value);
    }
    // zero
    // one

    for (var [key, value] of myMap.entries()) {
      console.log(key + ' = ' + value);
    }*/

    
    //this assignment rule will work for 2 energy sources
    var assigneeMap = new Map();
    var lastAssignment = '';
    var assignedToSet = new Set();
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        var numberSources = creep.room.find(FIND_SOURCES);
        console.log('Name: ' + name);
        if (assigneeMap.get(name) == null) {
            for (x in numberSources) {
                //console.log(numberSources[x]);
                //console.log(lastAssignment);
                if (numberSources[x] != lastAssignment && !assignedToSet.has(name) && creep.memory.role == 'harvester') {
                    assigneeMap.set(name,numberSources[x]);
                    lastAssignment=numberSources[x];
                    assignedToSet.add(name);
                    console.log('Harvester Source Assignment: ' + name + ': ' + numberSources[x]);
                }
            }
        }           
    }
    
    var harvestersAssigned = new Set();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            harvestersAssigned.add(creep);
            //roleHarvester.run(creep);
            if(creep.carry.energy < creep.carryCapacity) {
            //var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(assigneeMap.get(name)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(assigneeMap.get(name));
                }
            }
            else {
                if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns['Spawn1']);
                }
            }
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
    }
    console.log(harvestersAssigned.size);
    utility.cleanUp();
}