import * as Vex from 'https://cdn.skypack.dev/vexflow';
import * as Tone from 'https://cdn.skypack.dev/tone';

const VF = Vex.Flow;

let keysDown = new Set();
const keyDownUpdate = () => {
    document.getElementById("treble").innerText = "";
    if (keysDown.size == 0) return;
    const treble = new VF.Factory({
        renderer: { elementId: 'treble', width: 200, height: 200 },
    });

    const score = treble.EasyScore();
    const sys = treble.System();
    let tVoices = [];

    for (let i of keysDown) {
        let addOct = "";
        if (i.indexOf("#") != -1) {
            addOct = i.charAt(0) + "#" + (parseInt(i.charAt(2)) + 1);
        } else {
            addOct = i.charAt(0) + (parseInt(i.charAt(1)) + 1);
        }
        tVoices.push(score.voice(score.notes(addOct + "/w", { stem: "up" })));
    }
    sys
        .addStave({
            voices: tVoices
        })
        .addClef('treble')
        .addTimeSignature('4/4');

    treble.draw();
}
// keyDownUpdate();

const keyboard = document.getElementById("keyboard");

// Disable Element Drag, Set MouseState Listeners 
// (allows drag to affect keyboard @ onmouseover)
document.documentElement.ondragstart = function () { return (false); };

let mouseDown = false;
document.documentElement.addEventListener("mousedown", () => mouseDown = true);
document.documentElement.addEventListener("mouseup", () => mouseDown = false);
const synth = new Tone.PolySynth({ voice: Tone.Synth }).toMaster();

// Update Key Colors for Pressed/Released States
const updateColor = (key, keyState) => {
    let keyColor = key.matches(".white") ? "white" : "black";
    if (keyColor == "white" && keyState == "up") {
        key.style.backgroundColor = "#CBCBCB";
    }
    else if (keyColor == "white" && keyState == "down") {
        key.style.backgroundColor = "#BBBBDD";
    }
    else if (keyColor == "black" && keyState == "up") {
        key.style.backgroundColor = "#222222";
    }
    else if (keyColor == "black" && keyState == "down") {
        key.style.backgroundColor = "#666699";
    }
}

let keyMap = new Map();
for (let i of keyboard.children) keyMap.set(i.dataset.note, i);

// Key Pressed/Released Callbacks
const playNote = (key) => {
    if (keysDown.has(key)) return;
    keysDown.add(key);
    synth.triggerAttack([key], undefined, 1);
    updateColor(keyMap.get(key), "down");
    keyDownUpdate();
}
const releaseNote = (key) => {
    keysDown.delete(key);
    synth.triggerRelease(key, undefined);
    updateColor(keyMap.get(key), "up");
    keyDownUpdate();
}

const keys = {
    "a": "C3",
    "w": "C#3",
    "s": "D3",
    "e": "D#3",
    "d": "E3",
    "f": "F3",
    "t": "F#3",
    "g": "G3",
    "y": "G#3",
    "h": "A3",
    "u": "A#3",
    "j": "B3",
    "k": "C4",
    "o": "C#4",
    "l": "D4",
    "p": "D#4",
    ";": "E4"
};

for (let i of keyboard.children) {
    let note = i.dataset.note;
    i.addEventListener("mouseover", () => { if (mouseDown) playNote(note) });
    i.addEventListener("mousedown", () => playNote(note));
    i.addEventListener("touchstart", () => playNote(note));
    i.addEventListener("mouseleave", () => releaseNote(note));
    i.addEventListener("mouseup", () => releaseNote(note));
    i.addEventListener("touchend", () => releaseNote(note));
}

window.addEventListener("keydown", (e) => {
    if (Object.keys(keys).includes(e.key.toLowerCase())) {
        e.preventDefault();
        playNote(keys[e.key]);
    }
});
window.addEventListener("keyup", (e) => {
    if (Object.keys(keys).includes(e.key.toLowerCase())) {
        e.preventDefault();
        releaseNote(keys[e.key]);
    }
});