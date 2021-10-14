import { __private } from 'cc';
import { DependencyKey, ValueDispatchKey } from './config';
import { 
    registerDependency, 
    resolveObject, 
    registerStandaloneValue,
} from './tools/common/di';
import { ModuleType } from './types';

/**Apply to any class that has dependencies or is one itself,
 * including the extended prototypes.
 * !!!Specify the type name that's prone to minification
 */
export const injectable = (
    key?: keyof typeof ModuleType,
) => <T extends Function>(
    ctor: T
): T => {
    return resolveObject(ctor, key && ModuleType[key]);
};

/**Apply to any property you want to inject. The interface
 * must be mapped to the implementation name in the config
 */
export const inject = (
    dependencyKey: DependencyKey,
) => (
    target: any, 
    propKey: string,
) => {     
    registerDependency(target, propKey, dependencyKey);
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
    registerStandaloneValue(target, propKey, valueKey);
}