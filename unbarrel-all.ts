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
    delimiter();
    project.getSourceFile(importsVisitor);
    project.saveSync();
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

function isBarrelImport(directoryPath: string) {
    return (importDeclaration: ImportDeclaration) => {
        const moduleSpecifierSource = importDeclaration.getModuleSpecifierSourceFile();

        let moduleSpecifierSourcePath;

        if (moduleSpecifierSource) {
            // probably will never happen, because
            // 1. undefined for barrels
            // 2. now I'm removing them, because they are useless for barrels and may prevent further fixMissingImports
            moduleSpecifierSourcePath = moduleSpecifierSource && moduleSpecifierSource.getFilePath();
        } else {
            const moduleValue = importDeclaration.getModuleSpecifierValue();
            if (['.', '/'].indexOf(moduleValue[0]) > -1) {
                moduleSpecifierSourcePath = path.resolve(directoryPath, moduleValue);
            }
        }


        // console.log('IMPORTED: ', moduleSpecifierSourcePath, importDeclaration.getModuleSpecifierValue());


        if (moduleSpecifierSourcePath && (barrelsMap[moduleSpecifierSourcePath + '.ts'] ||
            barrelsMap[moduleSpecifierSourcePath + '/index.ts'])) {
            // console.log('THIS IS BARREL! :)');
            return true;
        }
        return false;
    };
}

function importsVisitor(sourceFile: SourceFile): boolean {

    let importVerifier = isBarrelImport(sourceFile.getDirectoryPath());
    const declarationsToBarrels = sourceFile.getImportDeclarations().filter(importVerifier);

    if(declarationsToBarrels.length) {
        console.log('FOUND BARREL IMPORTS: ', sourceFile.getFilePath());
        declarationsToBarrels.forEach((declaration: ImportDeclaration) => {
            console.log('declaration: ', declaration.getModuleSpecifierValue());
            declaration.remove();
        });
        // delimiter();
        sourceFile.fixMissingImports();
        // importIndex.saveSync();
    }

    return false;
}


unbarrelAll('/Users/dobydennykh/dev/unbarrel/tests/**/*.ts');
