
import SlotEnum from "../SlotEnum";
import Reel from "./Reel";

const { ccclass, property } = cc._decorator;

@ccclass()
export class Slot extends cc.Component {
  @property({ type: cc.Button, tooltip: "spin按鈕" })
  spinBtn: cc.Button = null;

  @property({ type: cc.Label, tooltip: "spin按鈕的文字" })
  spinBtnLabel: cc.Label = null;

  @property({ type: cc.Node, tooltip: "開獎動畫node" })
  glows: cc.Node = null;

  @property(cc.Prefab)
  _reelPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: "滾軸prefab" })
  get reelPrefab(): cc.Prefab {
    return this._reelPrefab;
  }

  set reelPrefab(newPrefab: cc.Prefab) {
    this._reelPrefab = newPrefab;
    this.node.removeAllChildren();

    if (newPrefab !== null) {
      this.createMachine();
    }
  }

  @property(cc.Integer)
  _numberOfReels = 3;

  @property({
    type: cc.Integer,
    range: [1, 6],
    slide: true,
    tooltip: "控制每軸的數量",
  })
  get numberOfReels(): number {
    return this._numberOfReels;
  }

  set numberOfReels(newNumber: number) {
    this._numberOfReels = newNumber;
    // 創建
    if (this.reelPrefab !== null) {
      this.createMachine();
    }
  }
  /** 滾軸組 */
  private reels = [];
  /** 是否正在spin */
  public spinning = false;

  /** 創建拉霸機 */
  createMachine(): void {
    // 先初始化
    this.node.destroyAllChildren();
    this.reels = [];

    let newReel: cc.Node;

    for (let i = 0; i < this.numberOfReels; i++) {
      // 實例化每個角子 後加到軸中
      newReel = cc.instantiate(this.reelPrefab);
      this.node.addChild(newReel);
      this.reels[i] = newReel;

      // 軸的初始化
      const reel = newReel.getComponent(Reel);
      reel.shuffle();
      reel.reelGroup.getComponent(cc.Layout).enabled = false;
    }

    // 更新版面
    this.node.getComponent(cc.Widget).updateAlignment();
  }

  /** 開始轉動 */
  spin(): void {
    this.spinning = true;
    this.switchSpinBtn(true, "STOP!");
    this.disableGlow();

    for (let i = 0; i < this.numberOfReels; i += 1) {
      const theReel = this.reels[i].getComponent(Reel);

      // 基數往上 偶數往下
      if (i % 2) {
        theReel.spinDirection = SlotEnum.Direction.Down;
      } else {
        theReel.spinDirection = SlotEnum.Direction.Up;
      }

      theReel.doSpin(0.03 * i);
    }
  }

  /**
   * 按鈕顯示切換
   * @param {boolean} isOpen - 是否打開交互
   * @param {string} btnName - 按鈕文字更替
   */
  switchSpinBtn(isOpen: boolean, btnName: string): void {
    this.spinBtn.interactable = isOpen;
    this.spinBtnLabel.string = btnName;
  }

  lock(): void {
    this.spinBtn.interactable = false;
  }
  /**
   * 停止轉動
   * @param {ResultInterface} result - 開獎結果的資料物件。預設值為 null。
   *  */
  stop(result: ResultInterface): void {
    console.log("停止後顯示結果", result);

    // 2.5秒後打開spin動畫 並且將按鈕恢復可點擊狀態
    setTimeout(() => {
      this.spinning = false;
      this.switchSpinBtn(true, "SPIN!");
      this.enableGlow(result);
    }, 2500);

    // 設定每軸的旋轉效果
    const randomOffset = Math.random() / 2;
    for (let i = 0; i < this.numberOfReels; i++) {
      /**
       * 每個軸的延遲時間:i < 2 + randomOffset < 2的話就 i /4 ，否則就 randomOffet * (i - 2) + i / 4 為的
       * 是製造出更自然的旋轉效果，創造一種在前兩個迭代中具有較小延遲，而在之後的迭代中具有較大延遲的效
       * 果。這種效果是為了模擬在遊戲中滾軸開始轉動時的加速效果，然後減緩至最終停止 */
      const spinDelay =
        i < 2 + randomOffset ? i / 4 : randomOffset * (i - 2) + i / 4;
      const theReel = this.reels[i].getComponent(Reel);

      // 停止滾軸
      setTimeout(() => {
        theReel.readyStop(result.reels[i]);
      }, 1000);
    }
  }

  /**
   * 根據開獎結果撥放動畫
   * @param {ResultInterface} result - 開獎結果的資料物件。預設值為 null。
   *  */
  enableGlow(result: ResultInterface) {
    for (const lineIndex of result.equalLines) {
      // 找到需要顯示開獎的node
      const line: cc.Node = this.glows.children[lineIndex];

      // 播放動畫
      for (const glow of line.children) {
        const skel: sp.Skeleton = glow.getComponent(sp.Skeleton);
        skel.animation = "loop";
      }
    }
  }

  /** 關閉動畫顯示 */
  disableGlow() {
    for (const line of this.glows.children) {
      for (const glow of line.children) {
        const skel: sp.Skeleton = glow.getComponent(sp.Skeleton);
        skel.animation = null;
      }
    }
  }
}
