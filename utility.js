var utility = {};
utility.cleanUp = function() {
	var counter = 0;
	for(var n in Memory.creeps) {
		var c = Game.creeps[n];
		if(!c) {
			delete Memory.creeps[n];
			counter++;
		}
	}
}
module.exports = utility;