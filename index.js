"use strict";
exports.__esModule = true;
var ts_morph_1 = require("ts-morph");
var path = require("path");
var fs = require("fs");
function collectExportsFiles(exportsDeclarations) {
    // todo use Set<>
    var filesObject = exportsDeclarations.reduce(function (accum, declarationItem) {
        var filePath = declarationItem.getSourceFile().getFilePath();
        accum[filePath] = true;
        return accum;
    }, {});
    return Object.keys(filesObject);
}
function collectExports(fileOrDirectory, project, basePath) {
    if (basePath === void 0) { basePath = ''; }
    if (!project) {
        project = new ts_morph_1.Project();
        // todo check if directory
        project.addExistingSourceFile(fileOrDirectory);
    }
    var result = { exports: [] };
    var fileAst = project.getSourceFileOrThrow(fileOrDirectory);
    if (!basePath) {
        basePath = path.dirname(fileAst.getFilePath());
    }
    var exportsDeclarations = fileAst.getExportedDeclarations();
    var exportedFilesFull = collectExportsFiles(exportsDeclarations);
    var exportedFilesRelative = exportedFilesFull.map(relativePathBuilder(basePath));
    result.exports = exportedFilesRelative;
    return result;
}
function relativePathBuilder(basePath) {
    return function (filePath) {
        var relativeFilePath = path.relative(basePath, filePath);
        var ext = path.extname(relativeFilePath);
        if (ext !== '.ts') {
            console.warn('Wrong ext [' + ext + ']: ' + relativeFilePath);
        }
        relativeFilePath = relativeFilePath.substr(0, relativeFilePath.length - 3);
        return "export * from './" + relativeFilePath + "';";
    };
}
var argv = require('yargs-parser')(process.argv.slice(2));
var file = argv.file, _a = argv.write, write = _a === void 0 ? false : _a;
if (!file) {
    throw Error('Please, define input file as --file=./some/file.ts');
}
var exportsList = collectExports(file);
var exportsText = exportsList.exports.join('\n');
if (write) {
    fs.writeFileSync(file, exportsText, { encoding: 'utf-8' });
}
else {
    console.log(exportsText);
}
