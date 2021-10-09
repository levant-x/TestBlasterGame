import { __private } from "cc";
import { VALUE_KEYS } from "../../config";
import { LocalTypeName } from "../../types-list";

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
    typeName?: LocalTypeName;
};

const _dependencies: Record<string, DependencyInfo> = {};
const _values: Record<string, PropMap[]> = {};
const _types: TypeRegistry = {};

let _instances: Record<string, any[]> = {};

export function registerDependency(
    target: any, 
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

    console.warn('registering dep for type', name, propKey, dependencyName,
        target.__proto__, target.__classname__);

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
    console.log('dispatching', valueKey, _values[valueKey], _instances);
    
    debugger

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
    const name = params.typeName || target.name;
    console.warn('injecting class', name);
    
    const dependency = class extends target {
        constructor() {
            super();
            // const devName = this.__proto__.__classname__;
            console.warn('creating class ', name, this);            
            //console.warn('types are gotten', _types); */
                       

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

    _types[name] = dependency; // maybe only for fuckers
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
    console.warn('its dependencies are', deps, 'among', _dependencies);
    
    deps?.propInfos?.forEach(propInfo => {
        console.warn('getting type of', propInfo.depName,
            'among', _types, _instances[propInfo.depName], 'for', name);
        
        

        const depType = _types[propInfo.depName];        
        const dependency = deps.params.isSingleton ?
            _instances[propInfo.depName]?.[0] || new depType() : 
            new depType();        
        target[propInfo.propName] = dependency;

        // console.warn('dep resolved: trg, dep, propval for', name, propInfo.depName);
        // console.warn(target, dependency, target[propInfo.propName]);        
        
    });
}