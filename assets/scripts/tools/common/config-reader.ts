import { JsonAsset, resources } from 'cc';
import { CONFIG } from '../../config';
import { LevelConfig, LevelSystemConfig } from '../../types';

type ConfigShiftInfo = Record<string, Function>;

const _ARGS = '_1st, _lst, n';
const _VAL_SHIFTER_ENTRY = `(${_ARGS}) => FN`;
const _PROP_KEYS_2SHIFT: string[] = [];

const _PRECISIONS: Record<string, (val: any) => string> = {
    'MUL': val => `r = Math.round(r / ${val}) * ${val};`,
}

const _FUNCTIONS: Record<string, string> = {
    'pi': 'Math.PI',
    'ran': 'Math.random',
    'rnd': 'Math.round',
    'flr': 'Math.floor',
    'sin': 'Math.sin',
    'cos': 'Math.cos',
}

let _1stLvlCfg: LevelConfig, _lastLvlCfg: LevelConfig;
let _cfgShift: ConfigShiftInfo;
let _n = 1;

/**
 * Provides the level config for infinite-game mode. Loads the confing json from 
 * the resources folder the 1st time, then calculates the given values from the 
 * formulas. Write a formula the way [VALUE1], [VALUE#], [n], [@PRECISIONNUM] where 
 * 1 and # is the 1st and last level's config, n is the current level num and 
 * PRECISION is an adjustment to the result (place at the end). Current options are
 * MUL-multiplicity
 */
export function loadLevelConfigAsync(): Promise<LevelConfig> {
    const path = CONFIG.LEVEL_SYS_CFG_PATH;
    return new Promise<LevelConfig>(resolve => {

        if (_lastLvlCfg) {
            _shiftLevelConfig();
            resolve(_lastLvlCfg);
        } else _loadLvlCnfFromFile(path, resolve);
    });
}

function _loadLvlCnfFromFile(
    path: string,
    resolve: (cnf: LevelConfig) => void
): void {
    resources.load(path, (
        er, config: JsonAsset
    ) => {
        if (er) throw `Error when loading config: ${er}`;
        else if (!config) throw 'Config was loaded empty';

        _parseLevelConfig(config.json as LevelSystemConfig);
        resolve(_lastLvlCfg as LevelConfig);
    });   
}

function _shiftLevelConfig(): void {
    _n++;    
    console.log(`Switched to level ${_n}, prop keys are ${_PROP_KEYS_2SHIFT},
        shifters are ${_cfgShift}`);

    for (const propKey of _PROP_KEYS_2SHIFT) {       
        const fn = _cfgShift[propKey];
        _lastLvlCfg[propKey] = fn(_1stLvlCfg, _lastLvlCfg, _n);
        console.log(_n, propKey, _lastLvlCfg[propKey]);        
    }
}

function _parseLevelConfig(
    source: LevelSystemConfig
): void {
    const propKeys = Object.keys(source.glossary);
    _1stLvlCfg = <LevelConfig>{};
    _cfgShift = {};

    for (const key of propKeys) _parsePropViaGlossary(key, source);
    _lastLvlCfg = { ..._1stLvlCfg }; 
}

function _parsePropViaGlossary(
    key: string,
    { glossary, baseConfig, configShift, }: LevelSystemConfig
): void {
    const formulaKey = glossary[key];
    if (!baseConfig[formulaKey]) throw `${key} config invalid`;

    console.log('reading formula key for param ' + key);
    
    _1stLvlCfg[key] = +baseConfig[formulaKey];
    const valueShifterTxt = configShift[formulaKey];
    if (!valueShifterTxt) return;

    console.log('reading shifter fn for param ' + key);

    const shifterFn = _parseValueShiftFormula(valueShifterTxt, glossary);   
    _PROP_KEYS_2SHIFT.push(key);
    _cfgShift[key] = shifterFn;
}

function _parseValueShiftFormula(
    valueShifter: string,  
    glossary: Record<string, string>,  
): Function {
    let [formula, precision] = valueShifter.split(' @');
    console.log('formula & precision are ', formula, precision);
    

    for (const [key, val] of Object.entries(glossary)) {
        formula = _replaceAll(formula, `${val}1`, `_1st.${key}`);
        formula = _replaceAll(formula, `${val}#`, `_lst.${key}`);
    }
    for (const [key, val] of Object.entries(_FUNCTIONS)) 
        formula = _replaceAll(formula, key, val);
    console.log('new formula is ', formula); 
    formula = _VAL_SHIFTER_ENTRY.replace('FN', formula);   

    if (precision) 
        formula = _parseValueShiftPrecision(formula, precision);
    return <Function>eval(formula);
}

function _replaceAll(
    src: string,
    oldVal: string,
    newVal: string
): string {
    return src.split(oldVal).join(newVal);
}

function _parseValueShiftPrecision(
    formula: string,
    precision: string
): string {
    const precType = precision.substring(0, 3);
    const exprTmpl = _PRECISIONS[precType];
    if (!exprTmpl) throw `Unknown precision type ${precType}`;

    const precValue = +precision.substring(3);
    const precWrap = exprTmpl(precValue);
    formula = formula.replace(_ARGS, '');
    
    const resultWrap = `let f = (${formula}); let r = f();`;
    const wrappedFormula = `{ ${resultWrap} ${precWrap} return r; }`;
    return _VAL_SHIFTER_ENTRY.replace('FN', wrappedFormula);
}