export * from './1-A-export';
export * from './1-B-export';
export { SOME_THING} from './1-C-export';
export { FEW, MORE_THINGS } from './1-D-export';

export enum ENUM_FROM_BARREL {
    name = 'value'
}

export enum CONST_ENUM_FROM_BARREL {
    name = 'const_value'
}
