const Tone = require('Tone');
var PolySynth = Tone.PolySynth;
var Reverb = Tone.Reverb;

Tone.Transport.bpm.value = 140;
var delay = new Tone.PingPongDelay('6n', 0.3).toMaster();
delay.set({wet: 0.2});
var bassdelay = new Tone.PingPongDelay('4n.', 0.1).toMaster();
bassdelay.set({wet: 0.7});
var dist = new Tone.BitCrusher(2).toMaster();
dist.set({wet: .8});
var dist2 = new Tone.BitCrusher(4).toMaster();
dist2.set({wet: 0});

var ghostAtmo = new Tone.Player('assets/sounds/Atmospheres-05.mp3').toMaster();
ghostAtmo.set({
  loop: true,
  volume: -4
});

var sampler = new Tone.Sampler({
  C3: 'assets/sounds/kick4.mp3',
  'C#3': 'assets/sounds/g.mp3',
  D3: 'assets/sounds/f.mp3',
  'D#3': 'assets/sounds/snare22.mp3',
  E3: 'assets/sounds/hihat11.mp3',
  F3: 'assets/sounds/hihat12.mp3',
  C4: 'assets/sounds/bling.mp3',
  'C#4': 'assets/sounds/HIT.mp3'
}).toMaster();
sampler.set({volume: -18});

var sfx = new Tone.Sampler({
  C4: 'assets/sounds/bling.mp3',
  'C#4': 'assets/sounds/HIT.mp3'
}).toMaster();
sfx.set({volume: -18});

var bass = new Tone.Synth({
  volume: -6,
  envelope: {
    attack: 0.01,
    decay: 0.15,
    sustain: 0.2,
    release: 24
  }
}).connect(bassdelay);

// JR: new errorSynth, very similar to foreground synth
var errorSynth = new PolySynth({}).connect(dist2);
errorSynth.set({
  polyphony: 16,
  oscillator: {type: 'square'},
  volume: -28,
  envelope: {
    attack: 0.005,
    decay: 0.7,
    sustain: 0.3,
    release: 4.005
  }
});

var backgroundSynth = new PolySynth({}).connect(dist2);
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
  oscillator: {type: 'square'},
  volume: -28,
  envelope: {
    attack: 0.005,
    decay: 1,
    sustain: 0.3,
    release: 4.005
  }
});

var ghostSynth = new Tone.Synth({}).connect(delay);
ghostSynth.set({
  oscillator: {type: 'square'},
  volume: -Infinity,
  envelope: {
    attack: 0.5,
    decay: 1,
    sustain: 0.8,
    release: 4.005
  }
});

export class MusicEngine {
  constructor({scale = [0, 3, 5, 7, 10, 14, 15, 19]}) {
    document.addEventListener('levelUnlock', () => {
      sfx.triggerAttack('c4');
    });
    document.addEventListener('gameOver', () => {
      sfx.triggerAttack('c#4');
    });
    document.addEventListener('ghostSound', () => {
      sfx.triggerAttack('c#4');
    });

    Tone.Transport.start();
    this.pattern = [];
    this.userPattern = [];

    this.scale = scale;
    this.extendedScale = [
      ...this.scale,
      ...this.scale.map(x => x + 12),
      ...this.scale.map(x => x + 24)
    ];
    this.ghostPattern = [null, null, 3, 2];
    this.ghostSequence = new Tone.Sequence(
      (time, col) => {
        if (this.ghostPattern[col % 4]) {
          ghostSynth.triggerAttackRelease(
            Tone.Frequency.mtof(this.ghostPattern[col % 4] + 72),
            '8n'
          );
        }
      },
      [0, 1, 2, 3, 4, 5, 6, 7],
      '8n'
    );
    this.bassSequence = new Tone.Sequence(
      (time, col) => {
        if (col === 0) {
          bass.triggerAttackRelease('C2', '2n');
        }
        if (col === 1) {
          switch (Math.floor(Math.random() * 4)) {
            case 0:
              bass.triggerAttackRelease('D#2', '2n');
              break;
            case 1:
              bass.triggerAttackRelease('G2', '2n');
              break;
            case 2:
              bass.triggerAttackRelease('A#1', '2n');
              break;
          }
        }
        if (col === 2) {
          switch (Math.floor(Math.random() * 3)) {
            case 0:
              bass.triggerAttackRelease('D#2', '2n');
              break;
            case 1:
              bass.triggerAttackRelease('G2', '2n');
              break;
            case 2:
              bass.triggerAttackRelease('C2', '2n');
              break;
          }
        }

        if (col === 3) {
          switch (Math.floor(Math.random() * 4)) {
            case 0:
              bass.triggerAttackRelease('G2', '2n');
              break;
            case 1:
              bass.triggerAttackRelease('A#1', '2n');
              break;
          }
        }
      },
      [0, 1, 2, 3],
      '4m'
    );
    this.sequence = new Tone.Sequence(
      (time, col) => {
        if (this.pattern[col]) {
          this.pattern[col].forEach((note, i) => {
            if (this.userPattern[col] && this.userPattern[col].includes(note)) {
              foregroundSynth.triggerAttackRelease(
                Tone.Frequency.mtof(60 + this.extendedScale[note]),
                '16n',
                `+${(i * 4) / 100}`
              );
            }
            // else {
            backgroundSynth.triggerAttackRelease(
              Tone.Frequency.mtof(60 + this.extendedScale[note]),
              '16n',
              `+${(i * 4) / 100}`
            );
            // }
          });
        }
        // test the column we're on for a user match
        if (this.userPattern[col]) {
          this.userPattern[col].forEach((userNote, i) => {
            if (!this.pattern[col] || !this.pattern[col].includes(userNote)) {
              // doesn't match
              document.dispatchEvent(
                new CustomEvent('patternError', {
                  detail: {x: col, y: userNote}
                })
              );
              // play the note the user entered
              errorSynth.triggerAttackRelease(
                Tone.Frequency.mtof(60 + this.extendedScale[userNote]),
                '16n',// a 16th note
                `+${(i * 4) / 100}`// time?
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
          this.playClickSound(0.4, '+8n');
        }
        if (col === 4) {
          this.playKickDrum();
          this.playClickSound();
          this.playClickSound(0.3, '+8n');
        }
        if (col === 5) {
          this.playClickSound();
          this.playClickSound(0.3, '+8n');
        }
        if (col === 6) {
          this.playClickSound();
          this.playClickSound(0.3, '+8n');
          this.playSnareDrum();
        }
        if (col === 7) {
          this.playClickSound();
          this.playKickDrum(0.6, '+8n');
          this.playSnareDrum(0.3);
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
      this.bassSequence.start();
      this.ghostSequence.start();
    } else {
      this.sequence.stop();
      this.bassSequence.stop();
      this.ghostSequence.start();
    }
  }

  play() {
    this.sequence.start();
    this.bassSequence.start();
    this.ghostSequence.start();
  }
  revealGhostPattern() {
    ghostSynth.volume.rampTo(-50, '2n');
    sampler.volume.rampTo(-42, '2m');
    dist2.wet.rampTo(0.05, '12m');
    backgroundSynth.volume.rampTo(-20, '12m')
    ghostAtmo.start();
  }
  silenceGhostPattern() {
    ghostSynth.volume.rampTo(-Infinity, '2n');
    sampler.volume.rampTo(-18, '2n');
    dist2.wet.rampTo(0, '4n');
    backgroundSynth.volume.rampTo(-1, '4n')
    ghostAtmo.stop();
  }
  generateRandomSequence(level) {
    if (level <= 3) {
      for (let i = 0; i < 8; i++) {
        if (i % 2 == 0) {
          this.addNote(i, Math.floor(Math.random() * 4));
        }
        if (i == 5) {
          if (Math.random() < 0.5) {
            this.addNote(i, Math.floor(Math.random() * 4));
          }
        }
      }
      return;
    }
    if (level <= 8) {
      for (let i = 0; i < 8; i++) {
        if (i % 2 == 0) {
          this.addNote(i, Math.floor(Math.random() * 4));
        }
        if (i % 2 == 1) {
          if (Math.random() < 0.5) {
            this.addNote(i, Math.floor(Math.random() * 8));
          }
        }
      }
      return;
    }
    for (let i = 0; i < 8; i++) {
      if (i % 2 == 1) {
        if (Math.random() < 0.7) {
          const note = Math.floor(Math.random() * 8);
          this.addNote(i, note);
          if (Math.random() < level / 30) {
            const interval = Math.floor(Math.random() * 2) + 2;
            if (note + interval < 8) {
              this.addNote(i, note + interval);
            }
          }
        }
      } else {
        if (Math.random() < 0.9) {
          const note = Math.floor(Math.random() * 5);
          this.addNote(i, note);
          if (Math.random() < level / 30) {
            const interval = Math.floor(Math.random() * 2) + 2;
            if (note + interval < 8) {
              this.addNote(i, note + interval);
            }
          }
        }
      }
    }
    if (level > 20) {
      for (let i = 0; i < 4; i++) {
        this.addNote(
          Math.floor(Math.random() * 8),
          Math.floor(Math.random() * 8)
        );
      }
    }
  }
  addNote(index, note) {
    if (!this.pattern[index]) {
      this.pattern[index] = [];
    }
    if (!this.pattern[index].includes(note)) {
      this.pattern[index].push(note);
    }
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
