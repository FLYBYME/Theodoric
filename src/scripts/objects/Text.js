export default class Text extends Phaser.GameObjects.Text {
  constructor(scene, x = 10, y = 10) {
    super(scene, x, y, '', { color: 'black', fontSize: '20px' })
    scene.add.existing(this)
    this.setOrigin(0)
  }

  update() {
    this.setText(`empty text`)
  }
}
