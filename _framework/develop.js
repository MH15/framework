/**
 * Develop components or views using the live server.
 * This script must:
 * - load the given component
 * - split into style, template and script
 * - inline any component references into the template
 * - compile styles and scripts
 * - serve through the live server
 */
const utils = require('./utils')
const server = require('.//server/live-server')
const build = require('../config/build')
const sass = require('node-sass')
const ejs = require('ejs')
const path = require('path')
const Dialogs = {
    Error: (type) => `Cannot run the live server on an item of type '${type}'.`,
    UnsupportedStyleLang: (lang) => `'${lang}' is not a supported style processor.`,
    BuildingComponent: (name) => `Building '${name}'.`
}
const fs = require('fs')
module.exports = (argv) => {
    /**
     * Remember: argv.path = [type]s/[name].[type]
     */
    let name = path.parse(argv.path).name
    let type = path.dirname(argv.path).split(path.sep).pop()

    builder(argv.path, name, type)
    server.start(type, name)

    utils.watch(argv.path, () => {
        builder(argv.path, name, type)
        server.restart(type, name)
    })

}

/**
 * Split a Component of View file into template, style and script Nodes.
 * @param {String} pathToItem 
 */
function splitTemplateStyleScript(pathToItem) {
    let item = utils.parseComponentView(utils.readFile(pathToItem))

    let template = item.getElementsByTagName("template")[0]
    let style = item.getElementsByTagName("style")[0]
    let script = item.getElementsByTagName("script")[0]

    return [template, style, script]
}

/**
 * Compile styles using the correct preprocessor.
 * @param {Node} style the DOM Node
 */
function compileStyles(style) {
    let styleLang = style.getAttribute("lang") || "css"
    if (build[styleLang] == null && styleLang !== "css") {
        console.log(Dialogs.UnsupportedStyleLang(styleLang))
    }
    let styleResult;
    switch (styleLang) {
        case "sass":
            styleResult = sass.renderSync({
                data: style.innerHTML
            }).css.toString()
            break
        case "less":
            // TODO: implement less
            break
        default:
            break
    }
    return styleResult
}
/**
 * Do the following:
 * - load the given component
 * - split into template, style and script
 * - inline any component references into the template
 * - compile styles and scripts
 * @param {String} pathToItem
 * @param {String} name the name of the component or item
 * @param {String} type component or view
 */
function builder(pathToItem, name, type) {
    // Figure out where to save the compiled items.
    let buildPath = path.join('_build', type, name)
    utils.mkdirIfNotExists(buildPath)

    // Split into template, style and script
    let [template, style, script] = splitTemplateStyleScript(pathToItem)

    // TODO: Inline any component references into the template
    // let html = ejs.render(template.innerHTML, {
    //     test: function () {
    //         alert("bitch")
    //     }
    // }, { filename: pathToItem })
    utils.overwriteFile(path.join(buildPath, "index.ejs"), template.innerHTML)

    // Write compiled style to Component or View build folder
    let styleResult = compileStyles(style)
    utils.overwriteFile(path.join(buildPath, "style.css"), styleResult)
    utils.overwriteFile(path.join(buildPath, "script.js"), script.innerHTML)


    // Build all referenced components
    let r = template.getAttribute("include")
    if (r) {
        let referencedComponents = template.getAttribute("include").split(",")
        referencedComponents.forEach(name => {
            console.log(Dialogs.BuildingComponent(name))
            let refPath = path.join("components", name + ".component")
            builder(refPath, name, "components")
        })
    }


    // EJS the whol cowabunga
    utils.ejsFancy(path.join(buildPath, "index.ejs"), template)
}