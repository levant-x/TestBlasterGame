import { __private } from "cc";
import { VALUE_KEYS } from "../../config";

type Type = __private.Constructor;
type TypeRegistry = Record<string, Type>;
type PropMap = {
    propName: string;
    depName: string;
};
type DependencyInfo = {
    params: InjectParams;
    propInfos: PropMap[],
};

export type InjectParams = {
    isSingleton: boolean;
};

const _dependencies: Record<string, DependencyInfo> = {};
const _values: Record<string, PropMap[]> = {};
const _types: TypeRegistry = {};

let _instances: Record<string, any[]> = {};

export function registerDependency(
    target: Type, 
    propKey: string, 
    dependencyName: string,
): void {
    const { name } = target.constructor; 
    const propInfo = {
        propName: propKey,
        depName: dependencyName,
    } as PropMap;

    const depInfo = _dependencies[name] ?? {
        propInfos: [propInfo]
    };

    const prInfos = depInfo.propInfos;
    if (!_dependencies[name]) _dependencies[name] = depInfo;
    else if (!prInfos.includes(propInfo)) prInfos.push(propInfo);
}

export function registerValue(
    target: Type, 
    propKey: string, 
    valueKey: string,
): void {
    const depName = target.constructor.name; 
    const valueTrgInfo = {
        propName: propKey, 
        depName,
    } as PropMap;

    const values = _values[valueKey] || [valueTrgInfo];
    if (!_values[valueKey]) _values[valueKey] = values;
    else values.push(valueTrgInfo);
}

export function dispatchValue<T>(
    valueKey: VALUE_KEYS,
    value: T,
): void {
    if (!_values[valueKey]) throw `Value ${valueKey} not registered`;

    _values[valueKey].forEach(valInfo => {
        _instances[valInfo.depName].forEach(trg => {
            trg[valInfo.propName] = value
        });
    });
}

export function resolveObject(
    target: any, 
    params: InjectParams,
): any {
    const { name } = target; 
    const dependency = class extends target {
        constructor() {
            super();
            const instances = _instances[name] || [this];
            _instances[name] ? instances.push(this) :
                _instances[name] = instances;
            _resolveDependencies(this, name);
        }            
        onDestroy() {
            super.onDestroy?.();
            _instances = {};
        }
    }

    _types[name] = dependency;
    const registry = _dependencies[name];
    if (registry) registry.params = params;
    else _dependencies[name] = {
        params, propInfos: [],
    };
    return dependency;
}

function _resolveDependencies(
    target: any, 
    name: string,
): void {
    const deps = _dependencies[name];
    deps?.propInfos?.forEach(propInfo => {
        const depType = _types[propInfo.depName];          
        const dependency = deps.params.isSingleton ?
            _instances[propInfo.depName]?.[0] || new depType() : 
            new depType();
        target[propInfo.propName] = dependency;
    });
}