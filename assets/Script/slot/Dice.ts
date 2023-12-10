const { ccclass, property } = cc._decorator;

/** 角子相關設定 */
@ccclass("Dice")
export class Dice extends cc.Component {
  @property({
    type: [cc.SpriteFrame],
    tooltip: "角子圖案樣式數組",
  })
  private textures: cc.SpriteFrame[] = [];

  get diceCount() {
    return this.textures.length;
  }

  async onLoad(): Promise<void> {
    // 在設定完圖片之前先關閉顯示
    this.node.opacity = 0;
    await this.loadTextures();
    if (this.node) {
      this.node.opacity = 255;
    }
  }

  async resetInEditor(): Promise<void> {
    await this.loadTextures();
    this.setRandom();
  }

  /** 讀取圖片 */
  async loadTextures(): Promise<boolean> {
    const self = this;
    this.textures = [];
    return new Promise<boolean>((resolve) => {
      cc.resources.loadDir(
        "Dice",
        cc.SpriteFrame,
        function afterLoad(err, loadedTextures) {
          self.textures = loadedTextures;
          resolve(true);
        }
      );
    });
  }

  /** 設定角子 */
  setDice(index: number) {
    if (this.node) {
      this.node.getComponent(cc.Sprite).spriteFrame = null;
      this.node.getComponent(cc.Sprite).spriteFrame = this.textures[index];
    }
  }

  /** 亂數決定 */
  setRandom() {
    const randomIndex = Math.floor(Math.random() * this.textures.length);
    this.setDice(randomIndex);
  }
}
