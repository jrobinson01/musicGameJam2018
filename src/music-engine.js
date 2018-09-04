const Tone = require("Tone");
var PolySynth = Tone.PolySynth;
var Reverb = Tone.Reverb;

Tone.Transport.bpm.value = 140;
var verb = new Reverb({ decay: 4, wet: 0.6 }).toMaster();
verb.generate();
var delay = new Tone.PingPongDelay("6n", 0.2).connect(verb);
delay.set({ wet: 0.5 });
var dist = new Tone.BitCrusher(1).toMaster();
dist.set({ wet: 1 });

var errorSynth = new Tone.DuoSynth({
  modulation: { type: "square" },
  modulationEnvelope: { attack: 0.001 },
  harmonicity: 2,
  detune: 3,
  voice0: {
    oscillator: { type: "sawtooth" },
    envelope: { release: 0.001 }
  },
  voice1: {
    envelope: { release: 0.01 }
  }
}).connect(dist);

var backgroundSynth = new PolySynth({}).connect(verb);
backgroundSynth.set({
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.005,
    decay: 1,
    sustain: 0.8,
    release: 8.005
  }
});

var foregroundSynth = new PolySynth({}).connect(delay);
foregroundSynth.set({
  oscillator: { type: "sawtooth" },
  envelope: {
    attack: 0.005,
    decay: 1,
    sustain: 0.3,
    release: 8.005
  }
});

export class MusicEngine {
  constructor({ scale = [0, 3, 5, 10] }) {
    // this.scale = [0, 3, 5, 7, 8, 10];

    Tone.Transport.start();
    this.pattern = [];
    this.userPattern = [];

    this.scale = scale;
    this.extendedScale = [
      ...this.scale,
      ...this.scale.map(x => x + 12),
      ...this.scale.map(x => x + 24)
    ];

    this.sequence = new Tone.Sequence(
      (time, col) => {
        if (this.pattern[col]) {
          this.pattern[col].forEach(note => {
            if (this.userPattern[col] && this.userPattern[col].includes(note)) {
              foregroundSynth.triggerAttackRelease(
                Tone.Frequency.mtof(60 + this.extendedScale[note]),
                "8n"
              );
            }
            // else {
            backgroundSynth.triggerAttackRelease(
              Tone.Frequency.mtof(60 + this.extendedScale[note]),
              "8n"
            );
            // }
          });
        }
        if (this.userPattern[col]) {
          this.userPattern[col].forEach(userNote => {
            if (!this.pattern[col] || !this.pattern[col].includes(userNote)) {
              document.dispatchEvent(new CustomEvent("patternError"));
              errorSynth.triggerAttackRelease(
                Tone.Frequency.mtof(48 + this.extendedScale[userNote]),
                "16n"
              );
            }
          });
        }
      },
      [0, 1, 2, 3, 4, 5, 6, 7],
      "4n"
    );
  }

  togglePlay() {
    if (this.sequence.state === "stopped") {
      this.sequence.start();
    } else {
      this.sequence.stop();
    }
  }
  play() {
    this.sequence.start();
  }
  generateRandomSequence() {
    for (let i = 0; i < 8; i++) {
      if (i % 2 == 1) {
        if (Math.random() > 0.6) {
          const note = Math.floor(Math.random() * 8);
          this.addNote(i, note);
        }
      } else {
        if (Math.random() > 0.2) {
          const note = Math.floor(Math.random() * 5);
          this.addNote(i, note);
          if (Math.random() > 0.4) {
          }
        }
      }
    }
  }
  addNote(index, note) {
    if (!this.pattern[index]) {
      this.pattern[index] = [];
    }
    this.pattern[index].push(note);
    this.pattern[index].sort();
  }
  addUserNote(index, note) {
    if (!this.userPattern[index]) {
      this.userPattern[index] = [];
    }
    this.userPattern[index].push(note);
    this.userPattern[index].sort();
  }
  getPosition() {
    return Math.floor(this.sequence.progress * 8);
  }
  getCorrectMarkers(position) {
    if (this.pattern[position]) {
      return this.pattern[position].reduce((arr, curr) => {
        if (
          this.userPattern[position] &&
          this.userPattern[position].includes(curr)
        ) {
          return [...arr, curr];
        } else {
          return arr;
        }
      }, []);
    }
    return false;
  }
  checkForWin() {
    if (JSON.stringify(this.pattern) === JSON.stringify(this.userPattern)) {
      return true;
    }
    return false;
  }
  clear() {
    this.pattern = [];
  }
  clearUserPattern() {
    this.userPattern = [];
  }
}

// synth.triggerAttackRelease('c3', '4n');
