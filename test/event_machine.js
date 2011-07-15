var em = require('../lib/event_machine');

exports.should_set_procedure_with_name_or_use_seqid_ok = function(t) {
	var e = em.create();
	var name;
	var f1 = function(){$e.e1};
	var f2 = function(){$e.e2;return true};
	name = e.setProcedure(f1);
	t.equal(0, name, 'first seqid');
	t.equal(f1, e.procedures[name].procedure, 'proc use seqid');
	t.deepEqual(['e1'], e.procedures[name].events, 'events use seqid');
	name = e.setProcedure(f1);
	t.equal(1, name, 'second seqid');
	name = e.setProcedure(f2, 'proc_name');
	t.equal('proc_name', name, 'second seqid');
	t.equal(f2, e.procedures[name].procedure, 'proc use name');
	t.deepEqual(['e2'], e.procedures[name].events, 'events use name');
	name = e.setProcedure(f1);
	t.equal(3, name, 'third seqid');
	t.done();
}
exports.should_set_procedure_without_event_can_throw_an_error = function(t){
	var e = em.create();
	t.throws(function(){
		e.setProcedure(function(){});
	});
	t.done();
}

exports.should_analyze_event_name_in_proc_ok = function(t) {
	var e = em.create(),
		name = [];
	var f1 = function(){$e.ev1};
	e.setProcedure(f1);
	t.deepEqual({'ev1':[0]}, e.relate, 'one event procedure');

	var f2 = function(){
		if ($e.ev1 && $e.ev2) {
			return true;
		}
		return false;
	};
	e.setProcedure(f2);
	t.deepEqual({'ev1':[0,1], 'ev2':[1]}, e.relate, 'two events procedure');

	var f3 = function() {
		if ($e.ev1 && $e.ev2) {
			return true;
		} else if ($e.ev1 && $e.ev3) {
			return true;
		}
		return false;
	}
	e.setProcedure(f3);
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

	e.setProcedure(function($e){
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
	e.setProcedure(function($e){
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
exports.should_procedure_fin_works_fine = function(t){
	var e = em.create();
	var step = 0;
	e.setProcedure(function($e, fin){
		if ($e.ev1){
			step++;
			fin();
		}
	});
	e.emit('ev1', 1);
	setTimeout(function(){
		t.equal(1, step, 'just run one time');
		t.done();
	}, 100);
}
exports.should_event_clear_works_fine = function(t) {
	var e = em.create();
	e.setProcedure(function($e){
		if (($e.ev1 || $e.ev2) && $e.ev3){
			t.equal(false, $e.ev1, 'ev1 clear');
			t.done();
		}
	});
	e.emit('ev1');
	e.clearEvent('ev1');
	e.emit('ev2');
	e.emit('ev3');
}

exports.should_multi_procedure_works_fine = function(t) {
	var e = em.create();
	var p0 = p1 = p2= 0;
	e.setProcedure(function($e, fin){
		if ($e.ev1){
			p0++;
			fin();
			e.emit('p0');
		}
	});
	e.setProcedure(function($e, fin){
		if ($e.ev1 && $e.ev2){
			p1++;
			fin();
			e.emit('p1');
		}
	});
	e.setProcedure(function($e, fin){
		if ($e.ev1 || $e.ev2){
			p2++;
			fin();
			e.emit('p2');
		}
	});
	e.setProcedure(function($e, fin){
		if ($e.p0 && $e.p1 && $e.p2) {
			t.equal(1, p0, 'procedire 0 run once');
			t.equal(1, p1, 'procedire 1 run once');
			t.equal(1, p2, 'procedire 2 run once');
			t.done();
		}
	});
	e.emit('ev1');
	e.emit('ev2');
}
