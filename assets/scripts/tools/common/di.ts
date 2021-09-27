import { __private } from "cc";

type Type = __private.Constructor;
type TypeRegistry = Record<string, Type>;

export type InjectParams = {
    isSingleton: boolean;
};

const _dependencies: Record<string, {
    params: InjectParams;
    props: {
        name: string;
        depName: string;
    }[],
}> = {};
const _values: Record<string, [string, string]> = {};
const _instances: Record<string, any[]> = {};
const _types: TypeRegistry = {};

export function registerDependency(
    { constructor }: Type, 
    propKey: string, 
    dependencyName: string,
): void {
    const { name } = constructor;
    const propInfo = {
        name: propKey,
        depName: dependencyName,
    };
    const depInfo = _dependencies[name] ?? {
        props: [propInfo]
    };
    const prInfos = depInfo.props;
    if (!_dependencies[name]) _dependencies[name] = depInfo;
    else if (!prInfos.includes(propInfo)) prInfos.push(propInfo);
}

export function registerValue(
    { constructor }: Type, 
    propKey: string, 
    valueKey: string,
): void {
    const { name } = constructor;
    if (!_values[valueKey]) _values[valueKey] = [name, propKey];
}

export function resolveValue(
    valueKey: string,
    value: any,
): void {
    if (!_values[valueKey]) throw 'Value not registered';
    const [typeName, propName] = _values[valueKey];
    const targets = _instances[typeName];
    targets.forEach(trg => trg[propName] = value);
}

export function resolve(
    target: any, 
    params: InjectParams,
): any {
    const { name } = target;
    const dependency = class extends target {
        constructor() {
            super();
            const instance = _instances[name];
            if (instance) instance.push(this);
            else _instances[name] = [this];
            _resolveProps(this, name);
        }
    }
    _types[name] = dependency;
    const registry = _dependencies[name];
    if (registry) registry.params = params;
    else _dependencies[name] = {
        params, props: [],
    };
    return dependency;
}

function _resolveProps(
    target: any, 
    name: string,
): void {
    const deps = _dependencies[name];
    deps?.props?.forEach(prop => {
        const depType = _types[prop.depName];
        const dependency = deps.params.isSingleton ?
            _instances[prop.depName]?.[0] || new depType() :
            new depType();
        target[prop.name] = dependency;
    });
}