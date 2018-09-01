const Tone = require("Tone");
var PolySynth = Tone.PolySynth;
var Reverb = Tone.Reverb;

var verb = new Reverb({ decay: 4, wet: 0.6 }).toMaster();
verb.generate();

var synth = new PolySynth({}).connect(verb);
synth.set({
    oscillator: { type: "triangle" },
    envelope: {
        attack: 0.005,
        decay: 1,
        sustain: 0.2,
        release: 4.005
    }
});

synth.triggerAttackRelease('c3', '4n');
