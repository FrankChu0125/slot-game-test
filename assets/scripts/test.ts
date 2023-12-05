import { _decorator, Component, Node, tween, UITransform, v2, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("test")
export class test extends Component {
  @property(Node)
  to: Node = null;
  @property(Node)
  by: Node = null;

  doStart() {
    tween()
      .target(this.to)
      .to(1.0, { position: new Vec3(0, 10, 0) })
      .start();

    tween()
      .target(this.by)
      .by(1.0, { position: new Vec3(0, 10, 0) })
      .start();
  }
}
