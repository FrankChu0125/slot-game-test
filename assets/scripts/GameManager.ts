import { _decorator, Component, Node } from "cc";
import { Slot } from "./slots/Slot";
import { Dice } from "./slots/Dice";
import { testData } from "./test";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Node, tooltip: "老虎機本體" })
  machine: Node = null;

  // 關閉開關
  private block = false;
  public result: ResultInterface = null;

  /** 滾軸數量 */
  private _reelCount = 0;

  get reelCount(): number {
    if (this._reelCount <= 0) {
      this._reelCount = this.machine.getComponent(Slot).numberOfReels;
    }

    return this._reelCount;
  }

  // 角子數量
  private _diceCount = 0;

  get diceCount(): number {
    if (this._diceCount <= 0) {
      this._diceCount = this.machine.getComponentInChildren(Dice).diceCount;
    }

    return this._diceCount;
  }

  //
  //  methods：
  //
  protected start(): void {
    this.machine.getComponent(Slot).createMachine();
  }

  protected update(dt: number): void {
    if (this.block && this.result != null) {
      console.log("關閉了");
      this.informStop();
      this.result = null;
    }
  }

  click(): void {
    if (!this.machine.getComponent(Slot).spinning) {
      this.block = false;
      this.machine.getComponent(Slot).spin();
      this.requestResult();
    } else if (!this.block) {
      this.block = true;
      this.machine.getComponent(Slot).lock();
    }
  }

  requestResult() {
    this.result = null;
    this.result = this.getAnswer();
  }

  getAnswer(): ResultInterface {
    if (!testData) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * testData.length);
    const answer = testData[randomIndex];
    return answer;
  }

  informStop(): void {
    this.machine.getComponent(Slot).stop(this.result);
  }
}
