export class SceneGarage {
  constructor(game) { this.game = game; }

  async onEnter() {
    this.game.showGarage();
  }
}
