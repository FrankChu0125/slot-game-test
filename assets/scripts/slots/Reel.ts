import {
  _decorator,
  Component,
  Enum,
  instantiate,
  Node,
  Prefab,
  tween,
  v3,
  Vec3,
} from "cc";
import SlotEnum from "../SlotEnum";
import { Dice } from "./Dice";
import { GameManager } from "../GameManager";
const { ccclass, property } = _decorator;

@ccclass("Reel")
/** 滾軸設置 */
export class Reel extends Component {
  @property({ type: Node })
  reelGroup: Node = null;

  @property({ type: Enum(SlotEnum.Direction) })
  spinDirection = SlotEnum.Direction.Down;

  @property({ type: Node, visible: false })
  diceGroup = [];

  @property(Prefab)
  _dicePrefab = null;

  @property(Prefab)
  get dicePrefab(): Prefab {
    return this._dicePrefab;
  }

  set dicePrefab(newPrefab: Prefab) {
    this._dicePrefab = newPrefab;
    this.reelGroup.removeAllChildren();
    this.diceGroup = [];

    if (!newPrefab) {
      this.createReel();
      this.shuffle();
    }
  }

  _gameManger: GameManager

  private result: Array<number> = [];
  public stopSpinning = false;
  /** 根據 spinDirection 屬性的值來決定方向修飾符的值（1 或 -1）往下還是往上 */
  private dirModifier = this.spinDirection === SlotEnum.Direction.Down ? -1 : 1;

  /** 建立滾軸 */
  createReel() {
    let newDice: Node;
    for (let i = 0; i < 5; i++) {
      newDice = instantiate(this.dicePrefab);
      this.reelGroup.addChild(newDice);
      this.diceGroup[i] = newDice;
    }
  }

  /** 重新設定圖案和打亂每個角子 */
  shuffle() {
    for (let i = 0; i < this.diceGroup.length; i++) {
      this.diceGroup[i].getComponent(Dice).setRandom();
    }
  }

  readyStop(newResult: Array<number>): void {
    console.log("newResult", newResult);
    for (let i = 0; i < newResult.length; i++) {
      console.log("readyStop", newResult[i]);
    }
    const checkDirection =
      this.spinDirection === SlotEnum.Direction.Down || newResult === null;
    this.result = checkDirection ? newResult : newResult.reverse();
    this.stopSpinning = true;


  }

  /** 執行選轉動畫 */
  doSpinning(element: Node = null, times = 1): void {
    // 移動動畫: y: 144 為直列角子的第一顆 0第二顆 -144第三顆
    const move = tween(element).by(0.04, {
      position: new Vec3(0, 144 * this.dirModifier),
    });
    const doChange = tween().call(() => this.changeCallback(element));
    // 依照傳入的數值重複執行移動且執行更換餃子
    const repeat = tween(element).repeat(times, move.then(doChange));
    // 確認執行完畢後進行最後的回調函式
    const checkEnd = tween().call(() => this.checkEndCallback(element));

    repeat.then(checkEnd).start();
  }

  /** 更換角子的回調函式 */
  changeCallback(element: Node = null): void {
    const el = element;

    /**
     * 調整位置
     * 288 表示超出了第一顆的位置，將他向下擺
     */
    if (el.position.y * this.dirModifier > 288) {
      el.position = v3(0, -288 * this.dirModifier);
    }

    let pop = null;
    if (this.result && this.result.length > 0) {
      // 從 result 中取出最後一個元素
      pop = this.result.pop();
    }

    // 如果有新的值，就重新設定軸內的骰子，其餘沒有結果就是再重新設定一次
    if (pop && pop >= 0) {
      el.getComponent(Dice).setDice(pop);
    } else {
      el.getComponent(Dice).setRandom();
    }

  }

  /** 停止動畫後最後的動作 */
  checkEndCallback(element: Node = null): void {
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

    this.reelGroup.children.forEach((element: Node) => {
      const delay = tween(element).delay(windUp);
      const start = tween(element).by(
        0.25,
        {
          position: v3(0, 144 * this.dirModifier),
        },
        { easing: "backIn" }
      );
      const doChange = tween(element).call(() => {
        this.changeCallback(element);
      });
      const callSpinning = tween(element).call(() => {
        this.doSpinning(element, 5);
      });

      delay.then(start).then(doChange).then(callSpinning).start();
    });
  }

  /** 動畫結束 */
  doStop(element: Node): void {
    const move = tween(element).by(0.04, {
      position: new Vec3(0, 144 * this.dirModifier),
    });
    const doChange = tween().call(() => this.changeCallback(element));
    // 最後一個
    const end = tween().by(
      0.2,
      { position: new Vec3(0, 144 * this.dirModifier) },
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
