import {
  ExportDeclaration,
  ImportDeclaration,
  ImportSpecifier,
  Project,
  SourceFile
} from "ts-morph";
import * as path from "path";
import { Barrel } from "./barrel.class";

interface ImportWithBarrel {
  importDeclaration: ImportDeclaration;
  barrel: Barrel;
}

const processingAlerts: string[][] = [];

let project: Project;

function delimiter(delimiterStr = "-"): void {
  console.log(new Array(60).join(delimiterStr));
}

function unbarrelAll(fileOrDirectory: string) {
  project = new Project();
  project.addExistingSourceFiles(fileOrDirectory);

  project.getSourceFile(exportsVisitor);
  delimiter();
  project.getSourceFile(importsVisitor);
  Object.values(barrelsMap).forEach(barrel => barrel.delete());
  project.saveSync();
  delimiter();
  processingAlerts.forEach(([filePath, message]) => {
    console.log(filePath + "\n ---> " + message + "\n\n");
  });
}

// const barrelsMap: Map<string, Barrel> = new Map<string, Barrel>();
const barrelsMap: { [name: string]: Barrel } = {};

// const basePath = '/Users/dobydennykh/dev/unbarrel/tests/';

function exportsVisitor(sourceFile: SourceFile): boolean {
  const barrel = new Barrel(sourceFile);
  let filePath = sourceFile.getFilePath();

  if (barrel.isBarrel()) {
    console.log("FOUND BARREL: ", filePath);
    barrelsMap[filePath] = barrel;

    if (barrel.hasOwnExports()) {
      processingAlerts.push([
        barrel.getFilePath(),
        "Barrel has own exports - you need to store them manually somewhere"
      ]);
    }
  } else {
    console.log("Checking exports: ", sourceFile.getFilePath());
  }

  // todo handle somewhere
  // if (barrel.isBarrel() && barrel.hasOwnExports()ß) {
  //     console.warn('has own exports!');
  // }
  return false;
}

function isBarrelImport(directoryPath: string) {
  return (
    accumulator: ImportWithBarrel[],
    importDeclaration: ImportDeclaration
  ) => {
    const moduleSpecifierSource = importDeclaration.getModuleSpecifierSourceFile();

    let moduleSpecifierSourcePath;

    if (moduleSpecifierSource) {
      // probably will never happen, because
      // 1. undefined for barrels
      // 2. now I'm removing them, because they are useless for barrels and may prevent further fixMissingImports
      moduleSpecifierSourcePath =
        moduleSpecifierSource && moduleSpecifierSource.getFilePath();
    } else {
      const moduleValue = importDeclaration.getModuleSpecifierValue();
      if ([".", "/"].indexOf(moduleValue[0]) > -1) {
        moduleSpecifierSourcePath = path
          .resolve(directoryPath, moduleValue)
          .replace(/\\/g, "/");
      }
    }

    // console.log('IMPORTED: ', moduleSpecifierSourcePath, importDeclaration.getModuleSpecifierValue());

    if (moduleSpecifierSourcePath) {
      // console.log('THIS IS BARREL! :)');
      const barrel =
        barrelsMap[moduleSpecifierSourcePath] ||
        barrelsMap[moduleSpecifierSourcePath + ".ts"] ||
        barrelsMap[moduleSpecifierSourcePath + "/index.ts"];

      if (barrel) {
        return [
          ...accumulator,
          {
            importDeclaration,
            barrel
          }
        ];
      }
    }

    return accumulator;
  };
}

function importsVisitor(sourceFile: SourceFile): boolean {
  console.log("Checking imports: ", sourceFile.getFilePath());

  let importVerifier = isBarrelImport(sourceFile.getDirectoryPath());
  const importDeclarations = sourceFile.getImportDeclarations();
  console.log("imports number: ", importDeclarations.length);

  const declarationsToBarrels = importDeclarations.reduce(importVerifier, []);

  if (declarationsToBarrels.length) {
    console.log("FOUND BARREL IMPORTS: ", sourceFile.getFilePath());
    declarationsToBarrels.forEach(({ importDeclaration, barrel }) => {
      console.log("declaration: ", importDeclaration.getModuleSpecifierValue());

      const namedImports: ImportSpecifier[] = importDeclaration.getNamedImports();

      namedImports.forEach(importItem => {
        let importName = importItem.getName();

        if (importItem.getAliasNode()) {
          processingAlerts.push([
            sourceFile.getFilePath(),
            '"' + importName + '" has alias, please fix it'
          ]);
        }

        let exportSymbol: ExportDeclaration = barrel
          .getExportedDeclarations()
          .filter(value => (value as any).getName() === importName)[0];

        let directImportPath = path
          .relative(
            sourceFile.getDirectoryPath(),
            exportSymbol.getSourceFile().getFilePath()
          )
          .replace(/\.ts$/, "");

        sourceFile.addImportDeclaration({
          namedImports: [importName],
          moduleSpecifier: directImportPath
        });
      });

      importDeclaration.remove();
    });
    delimiter();
    // sourceFile.fixMissingImports();

    // add import does this using double quotes, while we need single
    // sourceFile.getFullText().replace(/^import (.+?) from "(.+?)";$/g, "import $1 from '$2';");

    sourceFile.organizeImports({}, { quotePreference: "single" });
    sourceFile.saveSync();
  }

  return false;
}

const argv = require("yargs-parser")(process.argv.slice(2));
const { files } = argv;

if (files) {
  // "/Users/dobydennykh/dev/unbarrel/tests/**/*.ts"
  unbarrelAll(files);
} else {
  console.warn(
    'Please, define what to check, like: \n--files="/path/to/src/**/*.ts"'
  );
}
