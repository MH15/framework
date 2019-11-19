/**
 * Lots of helper functions
 */
module.exports = {
    writeFile,
    overwriteFile,
    readFile,
    readFilePromise,
    parseComponentView,
    watch,
    directoryExists,
    mkdirIfNotExists,
    ejsFancy,
}

const fs = require('fs')
const md5 = require('md5')
const ejs = require('ejs')
const DomParser = require('dom-parser')
const parser = new DomParser()

function fileLoader(filepath) {
    return readFile(filepath)
}

function ejsFancy(filepath, template) {
    ejs.fileLoader = fileLoader
    console.log("ejs file: " + filepath)
    let raw = readFile(filepath)
    // let html = ejs.render(raw, {});
    // console.log("yer")
    // console.log(html)
    let s = raw.replace(/<%-(.*?)%>/g, (capturingGroup) => {
        let path = capturingGroup.replace(/\s/g, '').match(/['"](.*?)['"]/g)[0].replace(/['"']/g, "")
        console.log(path)
        resolveComponentReferences(path)
        return "dog"
    })

    console.log(s)
}



/**
 * Find the filepath to a given component name
 * @param {String} name name of component to resolve 
 */
function resolveComponentReferences(name) {
    console.log("Component to find: " + name)
    // TODO: search in /components to find a component name
}


/**
 * Call the cb Function each time the file at path is changed.
 * @param {String} path 
 * @param {Function} cb 
 */
function watch(path, cb) {
    let fsWait = false;
    fs.watch(path, (event, filename) => {
        if (filename) {
            if (fsWait) return;
            fsWait = setTimeout(() => {
                fsWait = false;
            }, 100);
            console.log(`${filename} file Changed`);
            cb()
        }
    });
}

/**
 * Writes data to file unless file already exists, then throw error.
 * @param {String} path 
 * @param {String} data 
 */
function writeFile(path, data) {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, data)
    } else {
        throw new Error("don't overwrite a file")
    }
}

function overwriteFile(path, data) {
    fs.writeFileSync(path, data)
}

/**
 * Read file at path and return utf8 String.
 * @param {String} path 
 */
function readFile(path) {
    return fs.readFileSync(path, "utf8")
}

async function readFilePromise(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}


/**
 * https://www.npmjs.com/package/xml-parse
 * https://codereview.stackexchange.com/questions/28307/implementing-an-algorithm-that-walks-the-dom-without-recursion
 * Parse a template (component or view) into the template, style, and 
 * @param {String} path 
 */
function parseComponentView(content) {
    let dom = parser.parseFromString(content)
    return dom
}

/**
 * 
 * @param {String} path 
 */
function directoryExists(path) {
    return fs.existsSync(path)
}

function mkdirIfNotExists(path) {
    if (!directoryExists(path)) {
        fs.mkdirSync(path, { recursive: true })
    }
}


function walkDom(node) {
    if (node.childNodes) {
        node.childNodes.forEach((n) => {
            console.log(n.nodeName)
            walkDom(n)
        })
    } else {
        // console.log("bottom")
    }
}