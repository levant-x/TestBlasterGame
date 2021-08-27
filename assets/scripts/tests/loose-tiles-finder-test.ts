
import { _decorator, Component, Node, warn } from 'cc';
import { Tile } from '../controllers/tile';
import { LooseTilesFinder } from '../tools/loose-tiles-finder';
import { ITile, TileOffsetInfo } from '../types';

type MatrixIterateCallback = (r: number, c: number) => void;
type K = number;
type DataPattern<T> = {
    pointsToDestroy: T[][];
    pointsToOffset: T[][];
    looseItemsCount: number;
}

export class LooseTilesFinderTest extends LooseTilesFinder {
    private _currPattern?: DataPattern<K>;
    // !!ALL LAYOUTS ARE RIGHT TRANSPOSED!!
    private _hitItemsInMiddle: DataPattern<K> = {
        pointsToDestroy: [
        //   0 1 2 3 4 5 6 7 8 9
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,1,1,0,0,0,0], // 4
            [0,0,0,0,0,1,0,0,0,0], // 5
            [0,0,0,0,0,1,1,1,1,0], // 6
            [0,0,0,0,0,0,1,0,0,0], // 7
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
        ],
        pointsToOffset: [            
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,4,5,6,7], // 4
            [0,0,0,0,0,0,5,6,7,8], // 5
            [0,0,0,0,0,0,0,0,0,5], // 6
            [0,0,0,0,0,0,0,6,7,8], // 7
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
        ],
        looseItemsCount: 12,
    };

    constructor() {
        super();
        this._looseTilesAndTheirNewPositionsMatchThePattern();
    }

    private _looseTilesAndTheirNewPositionsMatchThePattern() {
        this._testPattern(this._hitItemsInMiddle);
    }
    
    private _iterateMatrix<T>(mtx: T[][], cbck: MatrixIterateCallback) {
        for (let c = 0; c < mtx.length; c++) this._iterateCol(
            mtx[c], c, cbck            
        );
    }

    private _iterateCol<T>(col: T[], c: number, cbck: MatrixIterateCallback) {
        for (let r = 0; r < col.length; r++) cbck(r, c);
    }

    private _destroyNodesByMask<T>(mask: T[][]) {    
        const dstrNodes: Node[] = [];    
        this._iterateMatrix(mask, (r, c) => {
            if (!mask[c][r]) return;

            const someNode = this.gamefield[c][r].node;
            dstrNodes.push(someNode);
            someNode.destroy();
        })
        return dstrNodes;
    }

    private _testPattern(ptrn: DataPattern<K>) {
        this._currPattern = ptrn;
        const dstrNodes = this._destroyNodesByMask(ptrn.pointsToDestroy);
        const dstrNodesCrds = dstrNodes.map(this._extractTileCellCoords);
        const looseTilesInfo = this.collectItemsGroup(
            dstrNodesCrds, node => node.active
        );
        this._assertCountMatch(
            ptrn.looseItemsCount, looseTilesInfo.length
        );
        looseTilesInfo.forEach(this._assertTilesCollected);
        console.warn(`Loose tiles: offset correct`);
    }

    private _extractTileCellCoords(node: Node) {
        const tile = node.getComponent(Tile);
        if (!tile) throw 'Node does not contain Tile component';
        return tile?.getCellCoordinates();
    }

    private _assertCountMatch(expected: number, actual: number) {
        if (expected === actual) return;
        throw `Loose tiles count equals ${actual} instead of ${expected}`;
    }

    private _assertTilesCollected = (looseTile: TileOffsetInfo) => {
        const { row, col } = looseTile.tile.getCellCoordinates();
        const trgRowIntended = this._currPattern?.pointsToOffset[col][row];
        if (!trgRowIntended) throw `Wrong tile collected: ${looseTile}`;
        const passed = trgRowIntended === looseTile.rowToSettleTo;
        if (!passed) throw `Tile ${looseTile} aimed at ${trgRowIntended}`;
    }
}