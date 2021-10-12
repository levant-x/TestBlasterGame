import { __private } from "cc";
import 'reflect-metadata';
import { CONFIG, DependencyKey, DI_TYPES_MAPPING, ValueDispatchKey } from "../../config";
import { getRootName } from "./inheritance-tools";

type Type = __private.Constructor;
type TypeRegistry = Record<string, Type>;
type PropMap = {
    propName: string;
    depName: DependencyKey;
};
type DependencyInfo = {
    params: InjectParams;
    propInfos: PropMap[],
};
type TypeNameMetainfo = {
    devKey: string;
    rootTypeName: string;
};

export type InjectParams = {
    isSingleton: boolean;
};

const TYPENAME_META_KEY = Symbol('TypeNames');

// const _namesByDevKey: Record<string, string> = {};

const _dependencies: Record<string, DependencyInfo> = {};
const _values: Record<string, Pick<PropMap, 'propName'> & {
    trgCtor: any;
}[]> = {};
const _types: TypeRegistry = {};

let _instances: Record<string, any[]> = {};

export function registerDependency(
    target: any, 
    propKey: string, 
    dependencyName: string,
): void {
    // debugger
    
    const { name } = target.constructor; 
    const propInfo = {
        propName: propKey,
        depName: dependencyName,
    } as PropMap;

    const depInfo = _dependencies[name] ?? {
        propInfos: [propInfo],
    };

    console.warn('registering dep for type', name, propKey, dependencyName,
        target.__proto__, target.__classname__);

    const prInfos = depInfo.propInfos;

    if (!_dependencies[name]) _dependencies[name] = depInfo;
    else if (!prInfos.includes(propInfo)) prInfos.push(propInfo);
    // if (!_namesByDevKey[name]) _namesByDevKey[name] = '';
}

export function registerValue(
    target: Type, 
    propKey: string, 
    valueKey: string,
): void {
    const name = target.constructor.name;
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
    console.log('dispatching', valueKey, _values[valueKey], _instances);

    if (!_values[valueKey]) throw `Value ${valueKey} not registered`;

    _values[valueKey].forEach(valInfo => {

        const typeName = _getTypeNameMeta(valInfo.trgCtor).rootTypeName;
        _instances[typeName].forEach(trg => {
            trg[(<any>valInfo).propName] = value
        });
    });
}

export function resolveObject(
    target: any, 
    params: InjectParams,
): any {
    const compileName = target.name;
    console.warn('injecting class', compileName);
    
    const dependency = class extends target {
        readonly typeNameInfo = _getTypeNameMeta(target);

        constructor() {
            super();
            // const devName = this.__proto__.__classname__;
            console.warn('creating class ', compileName, this);            
            //console.warn('types are gotten', _types); */
            
            const key = this.typeNameInfo.rootTypeName;  
            const instances = _instances[key] || [this];

            _instances[key] ? instances.push(this) :
                _instances[key] = instances;                
            _resolveDependencies(this, compileName);
        }          
        
        onDestroy() {
            super.onDestroy?.();
            _instances = {};
        }
    }

    _types[compileName] = dependency; 
    const registry = _dependencies[compileName];
    if (registry) registry.params = params;
    else _dependencies[compileName] = {
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
        const depCtor = CONFIG.getDependencyCtor(propInfo.depName); 
        const rootName = _getTypeNameMeta(depCtor).rootTypeName;

        console.warn('getting type of', propInfo.depName,
            'among', _types, _instances[rootName], 'for', name);
        console.warn('its root name is', rootName);
        
        

        const dependency = deps.params.isSingleton ?
            _instances[rootName]?.[0] || new depCtor() : 
            new depCtor();        
        target[propInfo.propName] = dependency;
        

        // console.warn('dep resolved: trg, dep, propval for', name, propInfo.depName);
        // console.warn(target, dependency, target[propInfo.propName]);        
        
    });
}

function _getTypeNameMeta(
    target: any
): TypeNameMetainfo {
    const rootTypeName = getRootName(target);
    return <TypeNameMetainfo>{
        rootTypeName,
        devKey: _getTypeDevKey(target),
    };
}

function _getTypeDevKey(
    target: any
): string | undefined {
    const mapping = Object.entries(DI_TYPES_MAPPING);
    return mapping.find(([_, ctorGetter]) => {
        const ctor = ctorGetter() as any;
        return target === ctor || target === ctor.__proto__;
    })?.[0];
}