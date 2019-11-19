/**
 * Log the version.
 */
const version = require("./version.json").version
console.log("Framework version " + version)

/**
 * Require scripts.
 */
const newComponentViewController = require('./new')
const developComponentView = require('./develop')


/**
 * Accept console arguments
 */
const yargs = require('yargs');

const argv = yargs
    .command('new <type> <name>', 'Create a new component, view or controller.', {
        copy: {
            description: 'the year to check for',
            alias: 'y',
            type: 'number',
        }
    }, (argv) => {
        newComponentViewController(argv)
    })
    .command('develop <path>', 'Develop a component or view using the live server.', {
        port: {
            description: 'the port to serve to',
            alias: 'p',
            type: 'number',
        }
    }, (argv) => {
        developComponentView(argv)
    })
    .option('tnewime', {
        alias: 't',
        description: 'Tell the present Time',
        type: 'boolean',
    })
    .help()
    .alias('help', 'h')
    .argv;





console.log(argv);