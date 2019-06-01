import {Project, SourceFile} from "ts-morph";
import * as path from "path";

function unbarrelAll(fileOrDirectory: string) {
    const project = new Project();
    project.addExistingSourceFiles(fileOrDirectory);

    // project.getSourceFile(exportsVisitor);
    project.getSourceFile(importsVisitor);
}


const basePath = '/Users/dobydennykh/dev/unbarrel/tests/';
function exportsVisitor(sourceFile: SourceFile): boolean {
    console.log('----------------------------------------------------------------');
    console.log('exportsVisitor: ', sourceFile.getFilePath());

    const exportsDeclarations = sourceFile.getExportedDeclarations();

    const exportsMap = exportsDeclarations.reduce((accum: {[path: string]: string[]}, exportItem) => {
        const fullPath = exportItem.getSourceFile().getFilePath();
        const relativeFilePath = path.relative(basePath, fullPath);

        accum[relativeFilePath] = [];

        return accum;
    }, {});

    console.log(exportsMap);

    return false;
}

function importsVisitor(sourceFile: SourceFile): boolean {
    console.log('----------------------------------------------------------------');
    console.log('importsVisitor: ', sourceFile.getFilePath());

    const exportsDeclarations = sourceFile.organizeImports();

    const exportsMap = exportsDeclarations.reduce((accum: {[path: string]: string[]}, exportItem) => {
        const fullPath = exportItem.getSourceFile().getFilePath();
        const relativeFilePath = path.relative(basePath, fullPath);

        accum[relativeFilePath] = [];

        return accum;
    }, {});

    console.log(exportsMap);

    return false;
}


// unbarrelAll('/Users/dobydennykh/dev/unbarrel/tests/export-barrels/**/*.ts');
// unbarrelAll('/Users/dobydennykh/dev/unbarrel/tests/export-barrels/1-export-barrel.ts');
unbarrelAll('/Users/dobydennykh/dev/unbarrel/tests/importing/index.ts');
