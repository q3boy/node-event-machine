var fs = require('fs'),
cp = require('child_process');

function rmdir (dir) {
	try {
		fs.readdirSync(dir).forEach(function(file){
			fs.unlinkSync(dir + '/' + file);
		});
		fs.rmdirSync(dir);
	} catch (e){}
}

desc('Node event machine builder');

task('default', function(params) {

  jake.Task['unittest'].execute();
});

task('cleanup', function(){
	rmdir('./lib-cov');
	rmdir('./test-coverage');
});

task('unittest', function(){
  jake.Task['cleanup'].invoke();
	require('nodeunit').reporters.default.run(['test']);
})


task('coverage', function(){
jake.Task['cleanup'].execute();
	cp.exec('node-jscoverage lib lib-cov', function(err, stdout){
		if (err) {
			console.log(err.message);
			return;
		}
		try {
			fs.mkdirSync('./test-coverage', 0755);
		}catch (e){}

		var cont ;

		cont = fs.readFileSync('test/event_machine.js').toString()
			.replace('../lib/event_machine', '../lib-cov/event_machine');
		fs.writeFileSync('test-coverage/event_machine.js', cont);
		require('nodeunit-coverage/lib/reporter').run(['test-coverage']);
	});

})

