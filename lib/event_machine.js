var Events = require('events');


function EventMachine () {
	this.reset();
}

EventMachine.prototype.reset = function(){
	this.emitter = new Events.EventEmitter();
	this.proc = {};
	this.relate = {};
	this.events = {};
	this.seq = 0;
	this.emitter.on('newListener', function(){
		this.emit.apply(this, arguments);
	})
}

var regEvents = /\$e\.\w+/ig;
function getAllEvent(codes) {
	// match all $e.xxx ;
	var re = codes.match(regEvents);
	if (!re) {
		throw Error("Can't find any event in you procedure codes.");
	}
	var evts = [], evt;
	for (var i = 0; i < re.length; i++) {
		// trim "$e.""
		evt = re[i].substring(3);
		// unique
		if (evts.indexOf(evt) < 0) {
			evts.push(evt);
		}
	}
	return evts;
}

EventMachine.prototype.set = function(proc, name) {

	var events = getAllEvent(proc.toString());

	// no name use seqid
	if (!name && name != 0) {
		name = this.seq;
	}
	if (!this.proc[name]) {
		this.seq++;
	}
	// set procedure info
	this.proc[name] = {
		proc : proc,
		events : events
	}
	// bind procedure to event
	for (var i = 0; i < events.length; i++) {
		var eventName = events[i];
		if (undefined == this.relate[eventName]) {
			this.relate[eventName] = [];
		}
		this.relate[eventName].indexOf(name) < 0 && this.relate[eventName].push(name);
	}
	return name;
}
EventMachine.prototype.getProcedureEnv = function(name) {
	var env = {}, eventName;

	for (var i = 0; i < this.proc[name].events.length; i++) {
		eventName = this.proc[name].events[i];

		env[eventName] = undefined == this.events[eventName] ?
			false :
			this.events[eventName];
	}
	return env;
}
EventMachine.prototype.runOneProcedure = function(name) {
	var self = this;

	this.proc[name].proc.apply({}, [this.getProcedureEnv(name), function(){
		self.removeProcedure(name);
	}]);
}
EventMachine.prototype.runEvent = function(name){
	for (var i = 0; i < this.relate[name].length; i++) {
		this.runOneProcedure(this.relate[name][i]);
	}
}

EventMachine.prototype.clearAllEvent = function() {
	this.events = {};
}

EventMachine.prototype.clearEvent = function(name) {
	if (!this.events[name]) {
		return;
	}
	this.events[name] = null;
	delete this.events[name];
}
EventMachine.prototype.removeAllProcedure = function() {
	this.proc = {};
	this.relate = {};
}
EventMachine.prototype.removeProcedure = function(name) {
	if (!this.proc[name]) {
		return;
	}
	var events = this.proc[name].events;
	for (var i = 0; i < events.length; i++) {
		this.relate[events[i]] = this.relate[events[i]].filter(function(proc){
			return !(proc == name);
		});
	}
	this.proc[name] = null;
	delete this.proc[name];
};

EventMachine.prototype.emit = function(){
	if (0 == arguments.length) {
		return;
	}
	var name = arguments[0];
	this.events[name] = 1 == arguments.length ?
		true :
		Array.prototype.slice.call(arguments, 1);

	if (this.relate[name] && this.relate[name].length > 0) {
		this.runEvent(name);
	}
	this.emitter.emit.apply(this.emitter, arguments);
}

EventMachine.prototype.removeListener = function(){
	this.emitter.removeListener.apply(this.emitter, arguments);
}
EventMachine.prototype.removeAllListeners = function(){
	this.emitter.removeAllListeners.apply(this.emitter, arguments);
}
EventMachine.prototype.setMaxListeners = function(){
	this.emitter.setMaxListeners.apply(this.emitter, arguments);
}
EventMachine.prototype.listeners = function(){
	this.emitter.listeners.apply(this.emitter, arguments);
}
EventMachine.prototype.once = function(){
	this.emitter.once.apply(this.emitter, arguments);
}
EventMachine.prototype.on = function(){
	this.emitter.on.apply(this.emitter, arguments);
}
EventMachine.prototype.addListener = function(){
	this.emitter.addListener.apply(this.emitter, arguments);
}

exports.create = function() {
	return new EventMachine();
}
