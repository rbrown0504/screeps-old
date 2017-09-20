/*Credit to for original for this foundation: screeps-ai https://github.com/beije/screeps-ai, any additional modifications made by myself.*/
var rooms = [];
var roomControllers = {};

var RoomController = {};
RoomController.set = function(name, controller) {
    rooms.push(name);
    roomControllers[name] = controller;
};

RoomController.get = function(name) {
    if(this.isOurRoom(name)) {
        return roomControllers[name];
    }

    return false;
};

RoomController.isOurRoom = function(name) {
    if(rooms.indexOf(name) == -1) {
        return false;
    }

    return true;
};

RoomController.getRoomControllers = function() {
    return roomControllers;
};

RoomController.requestReinforcement = function(room) {
    var rooms = this.getRoomControllers();
    for(var n in rooms) {
        var r = rooms[n];
        if(r.room.name != room.room.name) {
            r.sendReinforcements(room);
        }

    }
}

module.exports = RoomController;