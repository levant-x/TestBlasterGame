import { __private } from 'cc';
import { CONFIG, Types, VALUE_KEYS } from './config';
import { 
    registerDependency, 
    resolveObject, 
    InjectParams, 
    registerValue,
} from './tools/common/di';

const _defaultInjParams: InjectParams = {
    isSingleton: true,
}

/**Apply to any class that has dependencies or is one itself,
 * including the extended prototypes
 */
export const injectable = (
    params = _defaultInjParams,
) => <T extends Function>(
    ctor: T
): T => {
    const injected = resolveObject(ctor, params);
    return injected;
};

/**Apply to any property you want to inject. The interface
 * must be mapped to the implementation name in the config
 */
export const inject = (
    typeKey: Types,
) => (
    target: any, 
    propKey: string,
) => { 
    const depName = CONFIG.getDependencyName(typeKey);
    registerDependency(target, propKey, depName);
}

/**Apply to any property you have to inject manually in
 * runtime (those not yet available at compilation phase).
 * Dispatch them later. The key must be defined in the config
 */
export const injectValueByKey = (
    valueKey: VALUE_KEYS
) => (
    target: any, 
    propKey: string,
) => { 
    registerValue(target, propKey, valueKey);
}