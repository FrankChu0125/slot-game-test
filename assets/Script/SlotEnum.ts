

const { ccclass } = cc._decorator;

enum Direction {
  Up,
  Down,
}

@ccclass
/** 拉霸機動畫列舉 */
export default class SlotEnum extends cc.Component {
  static Direction = Direction;
}

/** 
 * 列舉優點: 
 * 1. 常數不可改變
 * 2. 定義通用的變數更好維護
 * 3. 能馬上看懂此變數帶來的意義省去註解
 */
