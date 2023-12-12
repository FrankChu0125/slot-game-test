# slot遊戲模擬
參考了網路上slot做法，將它吸收後自己動手做了一遍的測試專案。

模擬slot老虎機，使用cocos 2.4.12

## 專案結構
1. slot資料料夾
    - Dice.ts: 每顆角子的設定(設定Dice.prefab)
    - Reel.ts: 轉軸的設定(設定Reel.prefab) 
    - ResultInterface.ts: 定義遊戲開獎結果
    - Slot.ts: 拉霸機主體邏輯

2. 其他
    - db.ts: 模擬資料
    - GameManger.ts: 主要遊戲邏輯的入口
    - SlotEnum.ts: 定義拉霸機動畫相關的列舉

## 重點功能介紹
1. 資料層模擬

    專案中的ResultInterface是定義遊戲開獎結果，如下:
    
    ![Alt text](/readme-img/rm-resultInterface.png)
    - reels: 二維陣列，代表著每個轉軸的結果。
    - equalLines: 陣列代表著是連成線的是哪一條，如果是第一條就會是[0]沒有開到獎的話就是[]。
    - equalTile: 開出的圖示，以數字代表，沒有開到獎的話就是-1。
    
    目前專案上的資料皆為模擬狀態，在db.ts中有範例可參考。

2. 轉軸動畫製作，詳情可見Reels.ts檔案，簡單介紹兩點:
    - 每次角子移動Y軸都是0或±144的數值: 代表著每顆角子的位置，並且使用tween.by()相對位置移動，這樣移動下就會看起來自然。
    - SlotEnum是定義關於拉霸機的動畫，在1、3、5的位置轉軸會設定往上(up)，2、4的轉軸設定往下(down)。
    ![Alt text](/readme-img/rm-spinning.png)

3. 開獎延遲時間(詳情可見Slot.ts):

    在開獎後所觸發的stop方法中，會使用隨機性和不同的延遲時間來創造出更自然的動畫效果。每個滾軸都會在不同的時間點停止，以營造出遊戲中的滾軸效果。
    ![Alt text](/readme-img/rm-stop.png)


4. spine骨骼動畫使用(詳情可見Slot.ts):
