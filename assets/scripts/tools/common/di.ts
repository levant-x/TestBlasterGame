import { __private } from "cc";
import { CONFIG, DependencyKey, ValueDispatchKey } from "../../config";
import { ModuleType } from "../../types";

type Ctor = __private.Constructor;

type PropMap = {
    propName: string;
    dep: ModuleType;
};

/**The key must be the type's name */
const _dependencies: Record<string, PropMap[]> = {};
const _values: Record<string, Pick<PropMap, 'propName'> & {
    trgCtor: any;
}[]> = {};
const _types: Record<string | number, Ctor> = {};

let _instances: Record<string, any[]> = {};

export function registerDependency(
    target: any, 
    propKey: string, 
    dependencyKey: DependencyKey,
): void {
    const { name } = target.constructor; 
    const dep = CONFIG.di.getImplementationInfo(dependencyKey);
    const dependentPropInfo = <PropMap>{
        propName: propKey,
        dep,
    };

    const regEntry = _dependencies[name] ?? [dependentPropInfo];
    const toAddEntry = !regEntry.includes(dependentPropInfo);

    if (!_dependencies[name]) _dependencies[name] = regEntry;
    else toAddEntry && regEntry.push(dependentPropInfo);
}

export function registerStandaloneValue(
    target: Ctor, 
    propKey: string, 
    valueKey: string,
): void {
    const valueTrgInfo = {
        propName: propKey, 
        trgCtor: target.constructor,
    };

    const values = _values[valueKey] || [valueTrgInfo];
    if (!_values[valueKey]) _values[valueKey] = values;
    else values.push(valueTrgInfo);
}

export function dispatchValue<T>(
    valueKey: ValueDispatchKey,
    value: T,
): void {
    if (!_values[valueKey]) throw `Value ${valueKey} not registered`;

    _values[valueKey].forEach(valInfo => {
        const typeKey = <string | number>_findTypeKey(valInfo.trgCtor);
        _instances[typeKey].forEach(trg => {
            trg[(<any>valInfo).propName] = value;
        });
    });
}

export function resolveObject(
    target: any, 
    objType?: ModuleType,
): any {
    const name = target.name;
    const objKey = objType ?? name;
    
    const dependency = class extends target {
        constructor() {
            super();
            const instances = _instances[objKey] || [this];            

            if (!_instances[objKey]) _instances[objKey] = [this];  
            else instances.push(this);
            _resolveDependencies(this, name);
        }          
        onDestroy() {
            super.onDestroy?.();
            _instances = {};
        }
    }

    _types[objKey] = dependency; 
    return dependency;
}

function _resolveDependencies(
    target: any, 
    typeName: string,
): void {
    const deps = _dependencies[typeName];
    deps?.forEach(({ propName, dep }) => {
        const ctor = _types[dep]; 
        const existingInstance = _instances[dep]?.[0];

        const dependency = CONFIG.di.isSingleton(dep) &&
            existingInstance ? existingInstance : new ctor();
        target[propName] = dependency;
    });
}

function _findTypeKey(
    target: any
): string | number | undefined {
    return Object.entries(_types).find(([_, ctor]) => {
        const { __proto__ } = <any>ctor;
        return target === ctor || target === __proto__;
    })?.[0];
}