
import { _decorator, Component } from 'cc';
import { GridCellCoordinates, ITile, LevelConfig } from '../../types';

type GamefieldParams = Pick<
    LevelConfig, 'fieldWidth' | 'fieldHeight'
>;

/**
 Provides a mutable 2d-array context of the ITile gamefield
 and its dimensions. Necessary and sufficient to init by calling
 the initCtx. Index the gameField the way [col][row]
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
    
    static get() {
        const getDecartPoint = 
            GamefieldContext._getDecartPoint;    
        type n = number;    
        return {
            totalLength: GamefieldContext._getTotalLength(),
            linear: GamefieldContext._getLinearPoint,
            row: (point: n) => getDecartPoint(point, 'row'),
            col: (point: n) => getDecartPoint(point, 'col'),
        };
    }

    static swapItems(
        cell1: GridCellCoordinates, 
        cell2: GridCellCoordinates,
    ): void {
        const alias = GamefieldContext;
        const item = alias._body[cell1.col][cell1.row];
        alias._body[cell1.col][cell1.row] = 
            alias._body[cell2.col][cell2.row];
        alias._body[cell2.col][cell2.row] = item;
    }

    protected initContext(
        { fieldWidth, fieldHeight }: GamefieldParams
    ): void {
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
  
    private static _getTotalLength() {
        return GamefieldContext._w * GamefieldContext._h;
    }

    private static _getLinearPoint(
        { row, col }: GridCellCoordinates
    ): number {
        return GamefieldContext._w * row + col
    };
    
    private static _getDecartPoint(
        point: number,
        dimension: 'row' | 'col'
    ): number {
        const refDimension = GamefieldContext._h;
        if (dimension === 'col') return point % refDimension;
        else return Math.floor(point / refDimension);
    }
}