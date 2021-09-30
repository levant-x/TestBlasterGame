import { __private } from 'cc';
import { CONFIG, Types, VALUE_KEYS } from './config';
import { 
    registerDependency, 
    resolve, 
    InjectParams, 
    registerValue
} from './tools/common/di';

const _defaultInjParams: InjectParams = {
    isSingleton: true,
}

export const injectable = (
    params = _defaultInjParams,
) => <T extends Function>(
    ctor: T
): T => {
    const injected = resolve(ctor, params);
    return injected;
};

export const inject = (
    typeKey: Types,
) => (
    target: any, 
    propKey: string,
) => { 
    const depName = CONFIG.getDependencyName(typeKey);
    registerDependency(target, propKey, depName);
}

export const injectValueByKey = (
    valueKey: VALUE_KEYS
) => (
    target: any, 
    propKey: string,
) => { 
    registerValue(target, propKey, valueKey);
}