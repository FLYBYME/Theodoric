import Text from './Text'

export default class ScoreText extends Text {
  constructor(scene, name) {
    super(scene);
    this.name = name;
  }

  update(score) {
    this.setText(`${this.name || 'score'}: ${score}`)
  }
}
