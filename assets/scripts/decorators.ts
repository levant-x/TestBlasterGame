import { __private } from 'cc';
import { DependencyKey, ValueDispatchKey } from './config';
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
 * including the extended prototypes.
 * !!!Specify the type name that's prone to minification
 */
export const injectable = (
    params = _defaultInjParams,
) => <T extends Function>(
    ctor: T
): T => {
    
    console.warn('applying injectable, f is', resolveObject);
    return resolveObject(ctor, params);
};

/**Apply to any property you want to inject. The interface
 * must be mapped to the implementation name in the config
 */
export const inject = (
    typeKey: DependencyKey,
) => (
    target: any, 
    propKey: string,
) => {     
    // debugger
    console.warn('applying inject, f is', registerDependency);
    
    registerDependency(target, propKey, typeKey);
}

/**Apply to any property you have to inject manually in
 * runtime (those not yet available at compilation phase).
 * Dispatch them later. The key must be defined in the config
 */
export const injectValueByKey = (
    valueKey: ValueDispatchKey
) => (
    target: any, 
    propKey: string,
) => { 
    console.warn('applying regval, f is', registerValue);
    registerValue?.(target, propKey, valueKey);
}