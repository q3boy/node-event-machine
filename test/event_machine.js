var em = require('../lib/event_machine');

exports.should_set_procedure_with_name_or_use_seqid_ok = function(t) {
	var e = em.create();
	var name;
	var f1 = function(){$e.e1};
	var f2 = function(){$e.e2;return true};
	name = e.set(f1);
	t.equal(0, name, 'first seqid');
	t.equal(f1, e.proc[name].proc, 'proc use seqid');
	t.deepEqual(['e1'], e.proc[name].events, 'events use seqid');
	name = e.set(f1);
	t.equal(1, name, 'second seqid');
	name = e.set(f2, 'proc_name');
	t.equal('proc_name', name, 'second seqid');
	t.equal(f2, e.proc[name].proc, 'proc use name');
	t.deepEqual(['e2'], e.proc[name].events, 'events use name');
	name = e.set(f1);
	t.equal(3, name, 'third seqid');
	t.done();
}
exports.should_set_procedure_without_event_can_throw_an_error = function(t){
	var e = em.create();
	t.throws(function(){
		e.set(function(){});
	});
	t.done();
}

exports.should_analyze_event_name_in_proc_ok = function(t) {
	var e = em.create(),
		name = [];
	var f1 = function(){$e.ev1};
	e.set(f1);
	t.deepEqual({'ev1':[0]}, e.relate, 'one event procedure');

	var f2 = function(){
		if ($e.ev1 && $e.ev2) {
			return true;
		}
		return false;
	};
	e.set(f2);
	t.deepEqual({'ev1':[0,1], 'ev2':[1]}, e.relate, 'two events procedure');

	var f3 = function() {
		if ($e.ev1 && $e.ev2) {
			return true;
		} else if ($e.ev1 && $e.ev3) {
			return true;
		}
		return false;
	}
	e.set(f3);
	t.deepEqual({'ev1':[0,1,2], 'ev2':[1,2], 'ev3' : [2]}, e.relate,
		'duplicate events procedure');

	t.done();
}

exports.should_normal_event_emit_and_listen_run_ok = function(t) {
	var e = em.create();
	e.on('event_name', function(){
		t.deepEqual([1,2,3], arguments);
		t.done();
	})
	e.emit('event_name', 1, 2, 3)
}

exports.should_simple_event_machine_run_ok = function(t) {
	var e = em.create();

	e.set(function($e){
		if ($e.ev1){
			t.equal(1, $e.ev1[0]);
			t.done();
		}
	});
	e.emit('ev1', 1);
}

exports.should_complex_event_machine_run_ok = function(t){
	var e = em.create();
	var step = 0;
	e.set(function($e){
		if ($e.ev4 && $e.ev5) {
			t.done();
		} else if ($e.ev1 && ($e.ev2 || $e.ev3)) {
			t.equal(3, step, 'check step ok');
			e.emit('ev4', 'aaa');
		}
	})
	step++;
	e.emit('ev1');
	step++;
	e.emit('ev5');
	step++;
	e.emit('ev3');
}
