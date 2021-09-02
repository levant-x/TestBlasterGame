
type BooleanGetter = () => boolean;
type AsyncActor = Record<string, (...args: any) => Promise<any>>;

function _areAllTrue(conditionGetters: BooleanGetter[]) {
    return !conditionGetters.some(isTrue => !isTrue());
}

function _awaitForConditions(conditionGetters: BooleanGetter[]) {
    while (!_areAllTrue(conditionGetters)) { }
}

export function waitForConditions<T>(conditionGetters: BooleanGetter[]) {
    return new Promise<void>(resolve => {
        _awaitForConditions(conditionGetters);
        resolve();
    });
}

export async function waitForBatch<T extends AsyncActor>(
    items: T[], 
    methodKey: keyof T,
    allArgs: any[]
) {
    const asyncActions: Promise<any>[] = [];
    items.forEach((item, i) =>{ 
        const action = item[methodKey];
        const actionArgs = allArgs.length > 1 ? allArgs[i] : allArgs[0];
        const promise = action.apply(action.prototype, actionArgs);
        asyncActions.push(promise);
    });
    return await Promise.all(asyncActions);
}
