import { Project, Node } from "ts-morph";
import * as path from 'path';
import * as fs from "fs";


interface ExportsCollection {
  exports: string[];
}

function collectExportsFiles(exportsDeclarations: Node[]) {
  // todo use Set<>
  const filesObject = exportsDeclarations.reduce((accum: {[path: string]: boolean}, declarationItem) => {
    const filePath = declarationItem.getSourceFile().getFilePath();
    accum[filePath] = true;
    return accum;
  }, {});

  return Object.keys(filesObject);
}

function collectExports(
  fileOrDirectory: string,
  project?: Project,
  basePath: string = ''
): ExportsCollection {
  if (!project) {
    project = new Project();

    // todo check if directory
    project.addExistingSourceFile(fileOrDirectory);
  }

  const result: ExportsCollection = { exports: [] };
  const fileAst = project.getSourceFileOrThrow(fileOrDirectory);

  if (!basePath) {
    basePath =  path.dirname(fileAst.getFilePath());
  }

  const exportsDeclarations = fileAst.getExportedDeclarations();
  const exportedFilesFull = collectExportsFiles(exportsDeclarations);
  const exportedFilesRelative = exportedFilesFull.map(relativePathBuilder(basePath));

  result.exports = exportedFilesRelative;
  return result;
}

function relativePathBuilder(basePath: string): (x: string) => string {
  return filePath => {
    let relativeFilePath = path.relative(basePath, filePath);
    const ext = path.extname(relativeFilePath);

    if (ext !== '.ts') {
      console.warn('Wrong ext [' + ext + ']: ' + relativeFilePath);
    }

    relativeFilePath = relativeFilePath.substr(0, relativeFilePath.length - 3);
    return "export * from './" + relativeFilePath + "';";
  }
}

const argv = require('yargs-parser')(process.argv.slice(2));
const {file, write = false} = argv;

if (!file) {
  throw Error('Please, define input file as --file=./some/file.ts')
}

const exportsList = collectExports(file);
const exportsText = exportsList.exports.join('\n');

if (write) {
  fs.writeFileSync(file, exportsText, {encoding: 'utf-8'});
}
else {
  console.log(exportsText);
}
