import {
  _decorator,
  Component,
  resources,
  SpriteFrame,
  Sprite,
  UIOpacity,
} from "cc";
const { ccclass, property } = _decorator;

/** 角子相關設定 */
@ccclass("Dice")
export class Dice extends Component {
  @property({
    type: [SpriteFrame],
    tooltip: "角子圖案樣式數組",
  })
  private textures: SpriteFrame[] = [];

  get diceCount() {
    return this.textures.length;
  }

  async onLoad() {
    // 在設定完圖片之前先關閉顯示
    this.node.getComponent(UIOpacity).opacity = 0;
    await this.loadTextures();
    if (this.node) {
      this.node.getComponent(UIOpacity).opacity = 255;
    }
  }

  /** 讀取圖片 */
  async loadTextures(): Promise<boolean> {
    const self = this;
    return new Promise<boolean>((resolve) => {
      resources.loadDir(
        "dice",
        SpriteFrame,
        function afterLoad(err, loadedTextures) {
          self.textures = loadedTextures;
          resolve(true);
        }
      );
    });
  }

  /** 設定角子 */
  setDice(index: number): void {
    if (this.node) {
      this.node.getComponent(Sprite).spriteFrame = this.textures[index];
    }
  }

  /** 亂數決定 */
  setRandom() {
    // this.node.getComponent(UIOpacity).opacity = 255
    const randomIndex = Math.floor(Math.random() * this.textures.length);
    this.setDice(randomIndex);
  }
}
