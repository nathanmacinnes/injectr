module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/*.js']
            }
        },
        jshint : {
            core : ['Gruntfile.js'],
            test : ['test/*.js'],
            lib : ['lib/*.js'],
            options : {
                jshintrc : true
            }
        },
        watch : {
            lib : {
                files : ['lib/*.js'],
                tasks : ['jshint:lib', 'test']
            },
            test : {
                files : ['test/*.js'],
                tasks : ['jshint:test', 'test']
            },
            grunt : {
                files : ['Gruntfile.js'],
                tasks : ['jshint:core']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    
    grunt.registerTask('test', 'mochaTest');
    grunt.registerTask('lint', 'jshint');

    grunt.registerTask('default', ['lint', 'test']);

    grunt.loadNpmTasks('grunt-contrib-watch');
};
