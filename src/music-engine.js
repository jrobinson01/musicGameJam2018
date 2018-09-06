const Tone = require('Tone');
var PolySynth = Tone.PolySynth;
var Reverb = Tone.Reverb;

Tone.Transport.bpm.value = 140;
var delay = new Tone.PingPongDelay('6n', 0.2).toMaster();
delay.set({wet: 0.5});
var dist = new Tone.BitCrusher(1).toMaster();
dist.set({wet: 1});

// var player = new Tone.Player("assets/sounds/musicgametrack1.mp3", function() {
//   //sampler will repitch the closest sample
//   // console.log(sampler);
//   player.start();
// }).toMaster();
// player.set({ loop: true, volume: -16 });

var sampler = new Tone.Sampler({
  C3: 'assets/sounds/kick4.wav',
  'C#3': 'assets/sounds/g.wav',
  D3: 'assets/sounds/f.wav',
  'D#3': 'assets/sounds/snare22.wav',
  E3: 'assets/sounds/hihat11.wav',
  F3: 'assets/sounds/hihat12.wav',
}).toMaster();
sampler.set({volume: -8});

var errorSynth = new Tone.DuoSynth({
  modulation: {type: 'square'},
  modulationEnvelope: {attack: 0.001},
  harmonicity: 2,
  detune: 3,
  volume: -8,
  voice0: {
    oscillator: {type: 'sawtooth'},
    envelope: {release: 0.001}
  },
  voice1: {
    envelope: {release: 0.1}
  }
}).connect(dist);

var backgroundSynth = new PolySynth({}).toMaster();
backgroundSynth.set({
  polyphony: 16,
  oscillator: {type: 'triangle'},
  volume: -16,
  envelope: {
    attack: 0.005,
    decay: 1,
    sustain: 0.8,
    release: 4.005
  }
});

var foregroundSynth = new PolySynth({}).connect(delay);
foregroundSynth.set({
  polyphony: 16,
  oscillator: {type: 'sawtooth'},
  volume: -14,
  envelope: {
    attack: 0.005,
    decay: 1,
    sustain: 0.3,
    release: 1.005
  }
});

export class MusicEngine {
  constructor({scale = [0, 3, 5, 10]}) {
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
                '8n'
              );
            }
            // else {
            backgroundSynth.triggerAttackRelease(
              Tone.Frequency.mtof(60 + this.extendedScale[note]),
              '8n'
            );
            // }
          });
        }
        if (this.userPattern[col]) {
          this.userPattern[col].forEach(userNote => {
            if (!this.pattern[col] || !this.pattern[col].includes(userNote)) {
              document.dispatchEvent(
                new CustomEvent('patternError', {
                  detail: {x: col, y: userNote}
                })
              );
              errorSynth.triggerAttackRelease(
                Tone.Frequency.mtof(48 + this.extendedScale[userNote]),
                '16n'
              );
            }
          });
        }
        // drums
        if (col === 0) {
          this.playKickDrum();
          this.playClickSound();
        }
        if (col === 1) {
          this.playClickSound();
          this.playKickDrum(0.4);
          this.playKickDrum(0.6, '+8n');
        }
        if (col === 2) {
          this.playClickSound();
          this.playSnareDrum();
          this.playKickDrum(0.4, '+8n');
        }
        if (col === 3) {
          this.playClickSound();
          this.playClickSound(.5,"+8n");
        }
        if (col === 4) {
          this.playKickDrum();
          this.playClickSound(.5,"+8n");
        }
        if (col === 5) {
          this.playClickSound();
          this.playClickSound(.5,"+8n");
        }
        if (col === 6) {
          this.playClickSound();
          this.playClickSound(.5,"+8n");
          this.playSnareDrum();
        }
        if (col === 7) {
          this.playClickSound();
          this.playKickDrum(0.6, '+8n');
        }
      },
      [0, 1, 2, 3, 4, 5, 6, 7],
      '4n'
    );
  }
  playKickDrum(probability = 1, delay) {
    if (Math.random() < probability) {
      sampler.triggerAttack('c3', delay);
    }
  }
  playSnareDrum(probability = 1, delay) {
    if (Math.random() < probability) {
      switch (Math.floor(Math.random() * 3)) {
        case 0:
          sampler.triggerAttack('c#3', delay);
          break;
        case 1:
          sampler.triggerAttack('d3', delay);
          break;
        case 2:
          sampler.triggerAttack('d#3', delay);
          break;
      }
    }
  }
  playClickSound(probability = 1, delay) {
    if (Math.random() < probability) {
      switch (Math.floor(Math.random() * 2)) {
        case 0:
          sampler.triggerAttack('e3', delay);
          break;
        case 1:
          sampler.triggerAttack('f3', delay);
          break;
      }
    }
  }

  togglePlay() {
    if (this.sequence.state === 'stopped') {
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
        if (Math.random() > 0.4) {
          const note = Math.floor(Math.random() * 8);
          this.addNote(i, note);
          if (Math.random() > 0.8) {
            const interval = Math.floor(Math.random() * 2) + 1;
            if (note + interval < 8) {
              this.addNote(i, note + interval);
            }
          }
        }
      } else {
        if (Math.random() > 0.2) {
          const note = Math.floor(Math.random() * 5);
          this.addNote(i, note);
          if (Math.random() > 0.8) {
            const interval = Math.floor(Math.random() * 2) + 1;
            if (note + interval < 8) {
              this.addNote(i, note + interval);
            }
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
  getPattern() {
    return this.pattern;
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
