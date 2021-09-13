
import { _decorator, Component } from 'cc';
import { ITile, LevelConfig } from '../types';

type GamefieldParams = Pick<
    LevelConfig, 'fieldWidth' | 'fieldHeight'
>;

/**
 Provides a mutable 2d-array context of the ITile gamefield
 and its dimensions. Necessary and sufficient to init by calling
 the initCtx. Index the context the way [col][row]
 */
export class GamefieldContext extends Component {
    private static _instances = [] as GamefieldContext[];
    private static _body: ITile[][] = []; 
    private static _w = 0;
    private static _h = 0;

    protected gamefield: ITile[][] = [];
    protected height: number = 0;
    protected witdh: number = 0;

    constructor() {
        super();
        // necessary to sync the instances
        GamefieldContext._instances.push(this);
    }

    protected initContext(
        { fieldWidth, fieldHeight }: GamefieldParams
    ) {
        GamefieldContext._body = [];
        GamefieldContext._h = fieldHeight;
        GamefieldContext._w = fieldWidth;
        GamefieldContext._instances.forEach(ctxItem => {
            ctxItem._initThisCtxFromStaticOne();
        });
    }

    private _initThisCtxFromStaticOne() {
        this.gamefield = GamefieldContext._body;
        this.height = GamefieldContext._h;
        this.witdh = GamefieldContext._w;
    }
}