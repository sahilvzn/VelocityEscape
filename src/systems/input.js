export class Input {
  constructor(ui) {
    this.keys = new Set();
    this.state = { left: false, right: false, accel: false, brake: false, reverse: false };

    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));

    if (ui && ui.touch) {
      const bind = (button, on, off) => {
        if (!button) return;
        const press = (ev) => { ev.preventDefault(); on(); };
        const release = (ev) => { ev.preventDefault(); off(); };
        button.addEventListener('touchstart', press);
        button.addEventListener('mousedown', press);
        button.addEventListener('touchend', release);
        button.addEventListener('mouseup', release);
        button.addEventListener('mouseleave', release);
      };
      bind(ui.touch.left, () => this.state.left = true, () => this.state.left = false);
      bind(ui.touch.right, () => this.state.right = true, () => this.state.right = false);
      bind(ui.touch.accel, () => this.state.accel = true, () => this.state.accel = false);
      bind(ui.touch.brake, () => this.state.brake = true, () => this.state.brake = false);
    }
  }

  onKey(e, down) {
    const k = e.key.toLowerCase();
    const map = {
      'arrowleft': 'left', 'a': 'left',
      'arrowright': 'right', 'd': 'right',
      'arrowup': 'accel', 'w': 'accel',
      'arrowdown': 'brake', 's': 'brake',
    };
    const action = map[k];
    if (action) { this.state[action] = down; }
    if (k === 's' || k === 'arrowdown') this.state.reverse = down;
  }

  get() { return this.state; }
}
