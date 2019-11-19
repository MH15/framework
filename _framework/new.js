/**
 * Generate new components, views or controllers.
*/
const utils = require('./utils')
const path = require('path')

const VALID_CREATE_TYPES = ['component', 'view', 'controller']
const Dialogs = {
    Error: (type) => `Cannot create a new item of type '${type}'.`,
    New: (type, name, path) => `New ${type} created titled '${name}' in ${path}.`,
    FileAlreadyExists: (type, name) => `Can't create a new ${type} called ${name}. Looks like a ${type} of this name already exists.`
}

module.exports = (argv) => {
    if (!VALID_CREATE_TYPES.includes(argv.type.toLowerCase())) {
        console.error(Dialogs.Error(argv.type))
    }
    let type = argv.type.toLowerCase();
    let name = argv.name || 'Example'

    newItem(type, name.firstLetterUppercase())

}


function newItem(type, name) {
    let fullPath = path.join(type + "s", name + "." + type)
    console.log(fullPath)
    console.log(__dirname)
    let samplePath = path.join("_framework", 'defaults', type + '.' + type)
    let sampleBody = utils.readFile(samplePath)
    try {
        utils.writeFile(fullPath, sampleBody)
        console.log("post complete")
    } catch (err) {
        console.log(Dialogs.FileAlreadyExists(type, name))
    }
}


/**
 * Modify the value of this so the first letter is uppercase.
 */
String.prototype.firstLetterUppercase = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
}