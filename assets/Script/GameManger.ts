import { Dice } from "./slot/Dice";
import { Slot } from "./slot/Slot";
import { testData } from "./db";
const { ccclass, property } = cc._decorator;

@ccclass()
export class GameManager extends cc.Component {
  @property({ type: cc.Node, tooltip: "老虎機本體" })
  machine: cc.Node = null;

  // 關閉開關
  private block = false;
  private _result: ResultInterface = null;

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
    if (this.block && this._result != null) {
      console.log("關閉了");
      this.informStop();
      this._result = null;
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

  async requestResult() {
    this._result = null;
    this._result = await this.getAnswer();
    // this.result =   {
    //   equalLines: [2],
    //   equalTile: 2,
    //   reels: [
    //     [0, 4, 2],
    //     [2, 5, 2],
    //     [0, 6, 2],
    //     [5, 29, 2],
    //     [28, 5, 2],
    //   ],
    // }
    console.log("結果", this._result.reels);
  }

  getAnswer(): Promise<ResultInterface> {
    return new Promise<ResultInterface>((resolve) => {
      // 亂數取得模擬的結果
      const randomIndex = Math.floor(Math.random() * testData.length);
      const answer: ResultInterface = testData[randomIndex];
      resolve(answer);
    });
  }

  informStop(): void {
    this.machine.getComponent(Slot).stop(this._result);
  }
}
