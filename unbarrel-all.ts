import {Project, SourceFile} from "ts-morph";
import * as path from "path";
import {log} from "util";

function unbarrelAll(fileOrDirectory: string) {
    const project = new Project();
    project.addExistingSourceFiles(fileOrDirectory);

    // project.getSourceFile(file => {
    //     console.log(file.getFilePath());
    //     return false;
    // });
    // project.getSourceFile(exportsVisitor);
    // project.getSourceFile(importsVisitor);

    const importIndex = project.getSourceFileOrThrow('/Users/dobydennykh/dev/unbarrel/tests/importing/index.ts');
    const importLiterals = importIndex.getImportStringLiterals();

    console.log(importLiterals);


    let directory = importIndex.getDirectoryPath();
    console.log(directory);
    console.log(path.resolve(directory, '../some-path/file'));


    // importIndex.fixMissingImports();
    // importIndex.saveSync();
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

    // const exportsMap = exportsDeclarations.reduce((accum: {[path: string]: string[]}, exportItem) => {
    //     const fullPath = exportItem.getSourceFile().getFilePath();
    //     const relativeFilePath = path.relative(basePath, fullPath);
    //
    //     accum[relativeFilePath] = [];
    //
    //     return accum;
    // }, {});
    //
    // console.log(exportsMap);
    //
    return false;
}


unbarrelAll('/Users/dobydennykh/dev/unbarrel/tests/**/*.ts');
// unbarrelAll('/Users/dobydennykh/dev/unbarrel/tests/export-barrels/1-export-barrel.ts');
// unbarrelAll('/Users/dobydennykh/dev/unbarrel/tests/importing/index.ts');
