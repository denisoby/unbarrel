import {ImportDeclaration, Project, SourceFile} from "ts-morph";
import * as path from "path";
import {Barrel} from "./barrel.class";

let project: Project;

function delimiter(delimiterStr = '-'): void {
    console.log((new Array(60)).join(delimiterStr));
}

function unbarrelAll(fileOrDirectory: string) {
    project = new Project();
    project.addExistingSourceFiles(fileOrDirectory);

    // project.getSourceFile(file => {
    //     console.log(file.getFilePath());
    //     return false;
    // });
    project.getSourceFile(exportsVisitor);
    // project.saveSync();

    // project.getSourceFile(importsVisitor);

    const importIndex: SourceFile = project.getSourceFileOrThrow('/Users/dobydennykh/dev/unbarrel/tests/importing/index.ts');

    delimiter();

    const declarationsToBarrels = importIndex.getImportDeclarations().filter((importDeclaration: ImportDeclaration) => {

        const moduleSpecifierSource = importDeclaration.getModuleSpecifierSourceFile()


        let moduleSpecifierSourcePath;

        if (moduleSpecifierSource) {
            moduleSpecifierSourcePath = moduleSpecifierSource && moduleSpecifierSource.getFilePath();
        }
        else {
            const moduleValue = importDeclaration.getModuleSpecifierValue();
            if (['.', '/'].indexOf(moduleValue[0]) > -1) {
                moduleSpecifierSourcePath = path.resolve(importIndex.getDirectoryPath(), moduleValue);
            }
        }


        console.log('IMPORTED: ', moduleSpecifierSourcePath, importDeclaration.getModuleSpecifierValue());


        if (moduleSpecifierSourcePath && (barrelsMap[moduleSpecifierSourcePath + '.ts'] ||
            barrelsMap[moduleSpecifierSourcePath + '/index.ts'])) {
            console.log('THIS IS BARREL! :)');
            return true;
        }
        return false;
    });

   if(declarationsToBarrels.length) {
       declarationsToBarrels.forEach((declaration: ImportDeclaration) => {
           console.log('declaration: ', declaration.getModuleSpecifierValue());
           declaration.remove();
       });
       delimiter();
       importIndex.fixMissingImports();
       // importIndex.saveSync();
   }

    console.log(importIndex.getFullText());

    // project.saveSync();

    // project = new Project();
    // project.addExistingSourceFiles(fileOrDirectory);
    // const importIndexFixed: SourceFile = project.getSourceFileOrThrow('/Users/dobydennykh/dev/unbarrel/tests/importing/index.ts');
    // importIndexFixed.fixMissingImports();
    // importIndexFixed.saveSync();

    // importIndex.fixMissingImports();
    // importIndex.saveSync();
}


// const barrelsMap: Map<string, Barrel> = new Map<string, Barrel>();
const barrelsMap: {[name: string]: Barrel} = {};

// const basePath = '/Users/dobydennykh/dev/unbarrel/tests/';

function exportsVisitor(sourceFile: SourceFile): boolean {
    const barrel = new Barrel(sourceFile);
    let filePath = sourceFile.getFilePath();
    console.log('FOUND BARREL: ', filePath);

    if (barrel.isBarrel()) {
        barrelsMap[filePath] = barrel;
        sourceFile.delete()
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
