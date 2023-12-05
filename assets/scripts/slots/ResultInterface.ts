interface ResultInterface {
  /** 
   * 紀錄每排的角子如:
   * 0: [29, 29, 29]
   * 1: [29, 29, 0]
   */
  reels: Array<Array<number>>;
  /** 達成連線的橫排 */
  equalLines: Array<number>;
  /** 連線到的角子圖示是第幾個 */
  equalTile: number;
}
