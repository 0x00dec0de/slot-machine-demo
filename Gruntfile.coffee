module.exports = (grunt) ->

	grunt.loadNpmTasks 'grunt-contrib-jade'
	grunt.config.set 'jade.index',
		files: 'public/index.html': indexFile = 'src/index.jade'
		options: pretty: yes
	grunt.config.set 'watch.jade',
		files: 'src/*.jade'
		tasks: 'jade'

	grunt.loadNpmTasks 'grunt-contrib-stylus'
	grunt.config.set 'stylus.options',
		compress: no
		use: [require 'nib']
		import: ['nib']
	grunt.config.set 'stylus.build',
		files: 'public/css/index.css': stylFiles = ['src/*.styl']
	grunt.config.set 'watch.styl',
		files: stylFiles
		tasks: 'stylus:build'

	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.config.set 'coffee.main',
		files: 'public/js/index.js': coffeeFiles = [
			'src/main.coffee'
			'src/*.coffee'
		]
		options: bare: yes, join: yes
	grunt.config.set 'watch.coffee',
		files: coffeeFiles
		tasks: 'coffee:main'

	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.config.set 'watch.options', livereload: yes, spawn: no

	grunt.registerTask 'build', ['stylus', 'jade', 'coffee']
	grunt.registerTask 'dev', ->
		grunt.config.set 'jade.index.options.data', livereload: yes
		grunt.task.run ['build', 'watch']