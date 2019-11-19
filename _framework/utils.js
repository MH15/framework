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
const path = require('path')
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
    // let s = raw.replace(/<%-(.*?)%>/g, (capturingGroup) => {
    //     let captured = capturingGroup.replace(/\s/g, '').match(/['"](.*?)['"]/g)[0].replace(/['"']/g, "")
    //     // console.log("captured: " + captured)
    //     let resolved = resolveComponentReferences(captured)
    //     // console.log("resolved: " + resolved)
    //     let final = capturingGroup.replace(/['"](.*?)['"]/, "'" + resolved + "'")
    //     return final
    // })


    // let html = ejs.render(s, { user: "bitch" })\

    let testString = raw, fn = ejs.compile(testString, { client: true });

    let html = fn({ user: "bitch" }, null, function (p, d) { // include callback
        // path -> 'file'
        // d -> {person: 'John'}
        // Put your code here
        // Return the contents of file as a string
        console.log("d: " + d)
        let truePath = path.join(__dirname, "..", findCompiledComponent(p))
        console.log("path: " + truePath)
        return readFile(truePath)
    }); // returns rendered string

    console.log(html)
    writeFile(path.parse(filepath).dir + "/index.html", html)
}


function findCompiledComponent(name) {
    return path.join("_build", "components", name, "index.ejs")
}


/**
 * Find the filepath to a given component name
 * @param {String} name name of component to resolve 
 */
function resolveComponentReferences(name) {
    console.log("Component to find: " + name)
    // TODO: search in /components to find a component name
    let pathToSearch = path.join(__dirname, "..", "_build", "components")
    // console.log(__dirname)
    // console.log(pathToSearch)
    let possiblePaths = walk(pathToSearch)
    let truePath = ""
    possiblePaths.forEach(p => {
        // console.log(path.parse(p))
        if (path.parse(p).name === name) {
            truePath = "components/" + path.parse(p).base
        }
    })
    if (truePath.length === 0) {
        throw new Error("That's not a valid path name")
    }
    return truePath

}

var walk = function (dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        filePath = dir + '/' + file;
        var stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(walk(filePath));
        } else {
            /* Is a file */
            results.push(file);
        }
    });
    return results;
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