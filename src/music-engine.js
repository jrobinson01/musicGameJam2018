const Tone = require("Tone");
var PolySynth = Tone.PolySynth;
var Reverb = Tone.Reverb;

Tone.Transport.bpm.value = 140;
var verb = new Reverb({ decay: 4, wet: 0.6 }).toMaster();
verb.generate();
var delay = new Tone.PingPongDelay("6n", 0.2).connect(verb);
delay.set({ wet: 0.5 });

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
            } else {
              backgroundSynth.triggerAttackRelease(
                Tone.Frequency.mtof(60 + this.extendedScale[note]),
                "8n"
              );
            }
          });
        }
      },
      [0, 1, 2, 3, 4, 5, 6, 7],
      "4n"
    );
    // this.sequence.removeAll();
  }

  togglePlay() {
    if (this.sequence.state === "stopped") {
      this.sequence.start();
    } else {
      this.sequence.stop();
    }
  }
  generateRandomSequence() {
    for (let i = 0; i < 8; i++) {
      if (i % 2 == 1) {
        if (Math.random() > 0.6) {
          this.addNote(i, Math.floor(Math.random() * 8));
        }
      } else {
        if (Math.random() > 0.2) {
          this.addNote(i, Math.floor(Math.random() * 8));
        }
      }
      if (Math.random() > 0.4) {
        this.addNote(i, Math.floor(Math.random() * 8));
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
