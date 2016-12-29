module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-bump');

    // Project configuration.
    grunt.initConfig({
        bump: {
            options: {
                files: ['src/app/config.ts'],
                updateConfigs: [],
                commit: false,  // true
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['src/app/config.ts'],
                createTag: false,  // true
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,  // true
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                metadata: '',
                regExp: false
            }
        },
    });
};
