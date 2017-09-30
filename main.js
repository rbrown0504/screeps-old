var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

//load room utilities
var roomMain = require('roomMain');
var RoomController = require('roomController');

var utility = require('utility');
//load all rooms



module.exports.loop = function () {
    //console.log(Game.cpu.tickLimit);
    //console.log(Game.cpu.bucket);

    for(var n in Game.rooms) {
    var roomController = new roomMain(Game.rooms[n], RoomController);
    RoomController.set(Game.rooms[n].name, roomController);
    };
    var rooms = RoomController.getRoomControllers();
    //console.log(JSON.stringify(rooms));
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'roleMiner');
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'roleHarvester');
    var LDharvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'roleLDHarvester');
    var LDharvestersW4N8 = _.sum(Game.creeps, (c) => c.memory.role == 'roleLDHarvester' && c.memory.target == 'W4N8');
    var LDharvestersW5N7 = _.sum(Game.creeps, (c) => c.memory.role == 'roleLDHarvester' && c.memory.target == 'W5N7');
    var LDharvestersW5N9 = _.sum(Game.creeps, (c) => c.memory.role == 'roleLDHarvester' && c.memory.target == 'W5N9');
    var LDharvestersW6N8 = _.sum(Game.creeps, (c) => c.memory.role == 'roleLDHarvester' && c.memory.target == 'W6N8');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'roleMiner');
    var carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'roleCarrier');
    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'roleClaimer');


    for(var n in rooms) {
        var room = rooms[n];
        //console.log(JSON.stringify(room));
        //room.loadSpawns();
        room.loadCreeps();
        room.populate();
        //see if there are any containers in the room
        //if so, set the miner target        

        console.log('**Room Name**: ' + room.room.name + 
            ' | Population: ' + room.creepUtility.getTotalPopulation() + '/' + room.creepUtility.getMaxPopulation() +
            ' | Next death: ' + room.creepUtility.getNextExpectedDeath() + ' ticks' + 
            //' | Population: ' + room.creepUtility.getTotalPopulation() +
            ' | HARVESTERS: ' + harvesters.length + 
            ' | LDHARVESTERS: ' + room.creepUtility.getType('roleLDHarvester').total + 
            ' | UPGRADERS: ' + room.creepUtility.getType('upgrader').total + 
            ' | BUILDERS: ' + room.creepUtility.getType('builder').total +
            ' | MINERS: ' + room.creepUtility.getType('roleMiner').total +
            ' | CARRIERS: ' + room.creepUtility.getType('roleCarrier').total //+
            //' | CARRIERS_NEW: ' + room.creepUtility.getRolePopulation('roleCarrier') + 
            //' | BUILDERS_NEW: ' + room.creepUtility.getRolePopulation('builder')
            );
        /*if (room.room.name == 'W5N9') {
            if (room.creepUtility.getType('roleLDHarvester').total +10 < 25) {
                var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'roleLDHarvester',target:'W5N9'});
                console.log('Spawning new LDharvester W5N9: ' + newName);
            }
        } else if (room.room.name == 'W6N8') {
            if (room.creepUtility.getType('roleLDHarvester').total + 10 < 14) {
                var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'roleLDHarvester',target:'W6N8'});
                console.log('Spawning new LDharvester W6N8: ' + newName);
            }
        } else if (room.room.name == 'W4N8') {
            if (room.creepUtility.getType('roleLDHarvester').total + 10 < 14) {
                var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'roleLDHarvester',target:'W4N8'});
                console.log('Spawning new LDharvester W4N8: ' + newName);
            }
        } else if (room.room.name == 'W5N7') {
            if (room.creepUtility.getType('roleLDHarvester').total + 10 < 14) {
                var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'roleLDHarvester',target:'W5N7'});
                console.log('Spawning new LDharvester W5N7: ' + newName);
            }
        }*/


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

    /*if (LDharvestersW4N8 < 10) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'roleLDHarvester',target:'W4N8'});
        console.log('Spawning new LDharvester W4N8: ' + newName);
    } else if (LDharvestersW5N9 < 10) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'roleLDHarvester',target:'W5N9'});
        console.log('Spawning new LDharvester W5N9: ' + newName);
    } else  if (LDharvestersW5N7 < 10) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'roleLDHarvester',target:'W5N7'});
        console.log('Spawning new LDharvester W5N7: ' + newName);
    } else if (LDharvestersW6N8 < 10) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'roleLDHarvester',target:'W6N8'});
        console.log('Spawning new LDharvester W6N8: ' + newName);
    }*/

    

    /*if(harvesters.length < 6) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'roleHarvester'});
        console.log('Spawning new harvester: ' + newName);
    }*//* else if(LDharvesters.length < 15) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'roleLDHarvester'});
        console.log('Spawning new LDharvester: ' + newName);
    }*/ /*else if(claimers.length < 1) {
        var newName = Game.spawns['Spawn1'].createCreep([CLAIM, MOVE], undefined, {role: 'roleClaimer'});
        console.log('Spawning new Claimer: ' + newName);
    }*/ /*else if(upgraders.length < 10) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }*/
    //console.log('upgraders:' + upgraders);
    /*if(builders.length < 10) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }*/
    /*if(miners.length < 4) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'roleMiner'});
        console.log('Spawning new miner: ' + newName);
    }
    if(upgraders.length < 5) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }
    if(carriers.length < 6) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'roleCarrier'});
        console.log('Spawning new carrier: ' + newName);
    }*/

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
        //console.log('Name: ' + name);
        if (assigneeMap.get(name) == null) {
            for (x in numberSources) {
                //console.log(numberSources[x]);
                //console.log(lastAssignment);
                if (numberSources[x] != lastAssignment && !assignedToSet.has(name) && creep.memory.role == 'harvester') {
                    assigneeMap.set(name,numberSources[x]);
                    lastAssignment=numberSources[x];
                    assignedToSet.add(name);
                    //console.log('Harvester Source Assignment: ' + name + ': ' + numberSources[x]);
                }
            }
        }           
    }

    /*for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }*/
    //console.log(harvestersAssigned.size);

    //utility.cleanUp();
    var counter = 0;
    //console.log('cleanUp');
    for(var n in Memory.creeps) {
        var c = Game.creeps[n];
        if(!c) {
            delete Memory.creeps[n];
            console.log('deleting');
            counter++;
        }
    }
}