import Text from './Text'

export default class FpsText extends Text {
  constructor(scene) {
    super(scene)
  }

  update() {
    this.setText(`fps: ${Math.floor(this.scene.game.loop.actualFps)}`)
  }
}
