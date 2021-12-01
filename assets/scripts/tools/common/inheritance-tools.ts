const _protoNames = ['GamefieldContext', 'Component', 'Function', ''];

export function getRootName(
    target: any, 
    closestRoot = false,
    protoName?: string,
): string {
    const { name } = target.prototype?.constructor || 
        target.constructor;    

    if (closestRoot && name !== 'dependency') return name;
    else if (!target.__proto__ ||
        closestRoot && name !== 'dependency' ||
        _protoNames.includes(name)) return protoName || name;
    return getRootName(target.__proto__, closestRoot, name);
}