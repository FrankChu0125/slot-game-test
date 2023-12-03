import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Node, tooltip: "老虎本體" })
  slot: Node = null;

  // 關閉開關
  private block = false;
  private result: ResultInterface = null;

  start() {}

  update(deltaTime: number) {}
}
