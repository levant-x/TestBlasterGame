
import { _decorator, Component } from 'cc';
import { ITile } from '../types';

type GamefieldParams = {
    gamefield: ITile[][];
    w: number;
    h: number;
}

/**
 Provides a mutable 2d-array context of the ITile gamefield
 and its dimensions. Necessary and sufficient to init by calling
 the initCtx. Index the context the way [col][row]
 */
export class GamefieldContext extends Component {
   private static _gamefield: ITile[][] = []; 
   private static _w = 0;
   private static _h = 0;

   protected gamefield: ITile[][] = [];
   protected height: number = 0;
   protected witdh: number = 0;

   constructor() {
       super();
       if (!GamefieldContext._gamefield) return;
       this._initThisCtxFromStatic()        
   }

   protected initCtx(args?: GamefieldParams) {
       if (!args) return;

       GamefieldContext._gamefield = args.gamefield;
       GamefieldContext._h = args.h;
       GamefieldContext._w = args.w;
       this._initThisCtxFromStatic();
   }

   private _initThisCtxFromStatic() {
       this.gamefield = GamefieldContext._gamefield;
       this.height = GamefieldContext._h;
       this.witdh = GamefieldContext._w;
   }
}