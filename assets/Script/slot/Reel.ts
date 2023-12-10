import SlotEnum from "../SlotEnum";
import { Dice } from "./Dice";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Reel extends cc.Component {
  @property({ type: cc.Node })
  public reelGroup = null;

  @property({ type: cc.Enum(SlotEnum.Direction) })
  public spinDirection = SlotEnum.Direction.Down;

  @property({ type: [cc.Node], visible: false })
  private tiles = [];

  @property({ type: cc.Prefab })
  public _tilePrefab = null;

  @property({ type: cc.Prefab })
  get tilePrefab(): cc.Prefab {
    return this._tilePrefab;
  }

  set tilePrefab(newPrefab: cc.Prefab) {
    this._tilePrefab = newPrefab;
    this.reelGroup.removeAllChildren();
    this.tiles = [];

    if (newPrefab !== null) {
      this.createReel();
      this.shuffle();
    }
  }

  private result: Array<number> = [];

  public stopSpinning = false;

  /** 建立滾軸 */
  createReel(): void {
    let newTile: cc.Node;
    for (let i = 0; i < 5; i += 1) {
      newTile = cc.instantiate(this.tilePrefab);
      this.reelGroup.addChild(newTile);
      this.tiles[i] = newTile;
    }
  }

  /** 重新設定圖案和打亂每個角子 */
  shuffle(): void {
    for (let i = 0; i < this.tiles.length; i += 1) {
      this.tiles[i].getComponent(Dice).setRandom();
    }
  }

  readyStop(newResult: Array<number>): void {
    /** 根據 spinDirection 屬性的值來決定方向修飾符的值（1 或 -1）往下還是往上 */
    const check =
      this.spinDirection === SlotEnum.Direction.Down || newResult == null;
    this.result = check ? newResult : newResult.reverse();
    this.stopSpinning = true;
  }

  /** 執行選轉動畫 */
  doSpinning(element: cc.Node, times = 1): void {
    const dirModifier = this.spinDirection === SlotEnum.Direction.Down ? -1 : 1;
    // 移動動畫: y: 144 為直列角子的第一顆 0第二顆 -144第三顆
    const move = cc.tween().by(0.04, { position: cc.v2(0, 144 * dirModifier) });
    const doChange = cc.tween().call(() => this.changeCallback(element));
    // 依照傳入的數值重複執行移動且執行更換角子
    const repeat = cc.tween(element).repeat(times, move.then(doChange));
    // 確認執行完畢後進行最後的回調函式
    const checkEnd = cc.tween().call(() => this.checkEndCallback(element));

    repeat.then(checkEnd).start();
  }
  /** 更換角子的回調函式 */
  changeCallback(element: cc.Node): void {
    const el = element;
    const dirModifier = this.spinDirection === SlotEnum.Direction.Down ? -1 : 1;
    /**
     * 調整位置
     * 288 表示超出了第一顆的位置，將他向下擺
     */
    if (el.position.y * dirModifier > 288) {
      el.position = cc.v3(0, -288 * dirModifier);

      let pop = null;
      if (this.result != null && this.result.length > 0) {
        // 從 result 中取出最後一個元素
        pop = this.result.pop();
      }

      // 如果有新的值，就重新設定軸內的骰子，其餘沒有結果就是再重新設定一次
      if (pop != null && pop >= 0) {
        el.getComponent(Dice).setDice(pop);
      } else {
        el.getComponent(Dice).setRandom();
      }
    }
  }

  /** 停止動畫後最後的動作 */
  checkEndCallback(element: cc.Node): void {
    const el = element;
    if (this.stopSpinning) {
      this.doStop(el);
    } else {
      this.doSpinning(el);
    }
  }

  /** 轉動動畫執行 */
  doSpin(windUp: number): void {
    this.stopSpinning = false;

    this.reelGroup.children.forEach((element: any) => {
      const dirModifier =
        this.spinDirection === SlotEnum.Direction.Down ? -1 : 1;

      const delay = cc.tween(element).delay(windUp);
      const start = cc
        .tween(element)
        .by(
          0.25,
          { position: cc.v2(0, 144 * dirModifier) },
          { easing: "backIn" }
        );
      const doChange = cc.tween().call(() => this.changeCallback(element));
      const callSpinning = cc
        .tween(element)
        .call(() => this.doSpinning(element, 5));

      delay.then(start).then(doChange).then(callSpinning).start();
    });
  }

  /** 動畫結束 */
  doStop(element: cc.Node = null): void {
    const dirModifier = this.spinDirection === SlotEnum.Direction.Down ? -1 : 1;
    const move = cc
      .tween(element)
      .by(0.04, { position: cc.v3(0, 144 * dirModifier) });
    const doChange = cc.tween().call(() => this.changeCallback(element));
    const end = cc
      .tween()
      .by(
        0.2,
        { position: cc.v2(0, 144 * dirModifier) },
        { easing: "bounceOut" }
      );

    move
      .then(doChange)
      .then(move)
      .then(doChange)
      .then(end)
      .then(doChange)
      .start();
  }
}
