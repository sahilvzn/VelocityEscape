export class AssetStore {
  constructor() {
    this.textures = new Map();
    this.sounds = new Map();
  }

  async loadPlaceholders() {
    // For skeleton, nothing heavy to load. Textures and sounds could be fetched here.
    return;
  }
}
