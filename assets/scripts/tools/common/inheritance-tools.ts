const _protoNames = ['GamefieldContext', 'Component', 'Function', ''];

export function getRootName(
    target: any, 
    protoName?: string
): string {
    const { name } = target.prototype?.constructor || 
        target.constructor;
    if (!target.__proto__ ||
        _protoNames.includes(name)) return protoName || name;
    return getRootName(target.__proto__, name);
}