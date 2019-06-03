import {ExportDeclaration, SourceFile} from "ts-morph";

export class Barrel {
    isBarrel(): boolean {
        const exportsDeclarations = this.getExportedDeclarations();

        return exportsDeclarations.some(exportItem =>
            exportItem.getSourceFile().getFilePath() !== this.getFilePath());

    }

    public getExportedDeclarations(): ExportDeclaration[] {
        return this._sourceFile.getExportedDeclarations() as ExportDeclaration[];
    }

    delete() {
        this._sourceFile.delete();
    }

    hasOwnExports(): boolean {
        const exportsDeclarations = this._sourceFile.getExportedDeclarations();

        return exportsDeclarations.some(exportItem =>
            exportItem.getSourceFile().getFilePath() === this.getFilePath());

    }

    constructor(protected  _sourceFile: SourceFile){}

    getFilePath(): string {
        return this._sourceFile.getFilePath();
    }
}
