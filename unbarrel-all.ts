import {ImportDeclaration, Project, SourceFile} from "ts-morph";
import * as path from "path";
import {Barrel} from "./barrel.class";

let project: Project;
function unbarrelAll(fileOrDirectory: string) {
    project = new Project();
    project.addExistingSourceFiles(fileOrDirectory);

    // project.getSourceFile(file => {
    //     console.log(file.getFilePath());
    //     return false;
    // });
    project.getSourceFile(exportsVisitor);
    // project.getSourceFile(importsVisitor);

    const importIndex: SourceFile = project.getSourceFileOrThrow('/Users/dobydennykh/dev/unbarrel/tests/importing/index.ts');
    const importLiterals = importIndex.getImportStringLiterals();
    console.log(importLiterals.map(i => i.getLiteralValue()));

    const declarationsToBarrels: ImportDeclaration[] = [];

    importIndex.getImportDeclaration((importDeclaration: ImportDeclaration) => {
        const moduleSpecifierSource = importDeclaration.getModuleSpecifierSourceFile()
        const moduleSpecifierSourcePath = moduleSpecifierSource && moduleSpecifierSource.getFilePath();

        if (moduleSpecifierSourcePath && barrelsMap[moduleSpecifierSourcePath]) {
            declarationsToBarrels.push(importDeclaration);
        }
        return false;
    });

   if(declarationsToBarrels.length) {
       declarationsToBarrels.forEach((declaration: ImportDeclaration) => declaration.remove());
       importIndex.fixMissingImports();
       importIndex.saveSync();
   }

    let directory = importIndex.getDirectoryPath();
    console.log(directory);
    console.log(path.resolve(directory, '../some-path/file'));


    // importIndex.fixMissingImports();
    // importIndex.saveSync();
}


// const barrelsMap: Map<string, Barrel> = new Map<string, Barrel>();
const barrelsMap: {[name: string]: Barrel} = {};

// const basePath = '/Users/dobydennykh/dev/unbarrel/tests/';

function exportsVisitor(sourceFile: SourceFile): boolean {
    const barrel = new Barrel(sourceFile);
    let filePath = sourceFile.getFilePath();
    // console.log(filePath, barrel.isBarrel());

    if (barrel.isBarrel()) {
        barrelsMap[filePath] = barrel;
        console.log("project.removeSourceFile(sourceFile);", sourceFile.getFilePath());
        project.removeSourceFile(sourceFile);
    }

    // todo handle somewhere
    // if (barrel.isBarrel() && barrel.hasOwnExports()ß) {
    //     console.warn('has own exports!');
    // }
    return false;
}

function importsVisitor(sourceFile: SourceFile): boolean {
    console.log('----------------------------------------------------------------');
    console.log('importsVisitor: ', sourceFile.getFilePath());

    // const exportsDeclarations = sourceFile.organizeImports();

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
