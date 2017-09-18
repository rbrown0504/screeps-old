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
module.exports = RoomController;