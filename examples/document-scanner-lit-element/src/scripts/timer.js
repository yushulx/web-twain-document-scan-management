import {LitElement, html, css} from 'lit';
/* playground-fold */
import {play, pause, replay} from './icons.js';
/* playground-fold-end */

export class MyTimer extends LitElement {
  static properties = {
    duration: {},
    end: {state: true},
    remaining: {state: true},
  };
  static styles = css`/* playground-fold */

    :host {
      display: inline-block;
      min-width: 4em;
      text-align: center;
      padding: 0.2em;
      margin: 0.2em 0.1em;
    }
    footer {
      user-select: none;
      font-size: 0.6em;
    }
    /* playground-fold-end */`;

  constructor() {
    super();
    this.duration = 60;
    this.end = null;
    this.remaining = 0;
  }

  render() {
    const {remaining, running} = this;
    const min = Math.floor(remaining / 60000);
    const sec = pad(min, Math.floor((remaining / 1000) % 60));
    const hun = pad(true, Math.floor((remaining % 1000) / 10));
    return html`
      ${min ? `${min}:${sec}` : `${sec}.${hun}`}
      <footer>
        ${
          remaining === 0
            ? ''
            : running
            ? html`<span @click=${this.pause}>${pause}</span>`
            : html`<span @click=${this.start}>${play}</span>`
        }
        <span @click=${this.reset}>${replay}</span>
      </footer>
    `;
  }
  /* playground-fold */

  start() {
    this.end = Date.now() + this.remaining;
    this.tick();
  }

  pause() {
    this.end = null;
  }

  reset() {
    const running = this.running;
    this.remaining = this.duration * 1000;
    this.end = running ? Date.now() + this.remaining : null;
  }

  tick() {
    if (this.running) {
      this.remaining = Math.max(0, this.end - Date.now());
      requestAnimationFrame(() => this.tick());
    }
  }

  get running() {
    return this.end && this.remaining;
  }

  connectedCallback() {
    super.connectedCallback();
    this.reset();
  } /* playground-fold-end */
}
customElements.define('my-timer', MyTimer);
/* playground-fold */

function pad(pad, val) {
  return pad ? String(val).padStart(2, '0') : val;
} /* playground-fold-end */
