const pet = document.createElement("img");
pet.style.cssText =
  "position:fixed !important; bottom:20px !important; left:100px;" +
  "width:128px !important; image-rendering:pixelated !important;" +
  "z-index:2147483647 !important; pointer-events:none !important;";
document.body.appendChild(pet);

const frames = {
  idle:  ["idle1.png", "idle2.png", "idle3.png", "idle4.png"],
  walk:  ["walk1.png", "walk2.png", "walk3.png"],
  sit:   ["sit1.png", "sit2.png", "sit3.png"],
  sleep: ["sleep1.png", "sleep2.png"]
};

// how many milliseconds each frame stays on screen
const speed = { idle: 250, walk: 200, sit: 300, sleep: 700 };

// helper: random number between a and b (in seconds), returned in milliseconds
const secs = (a, b) => (a + Math.random() * (b - a)) * 1000;

let state = "idle", frame = 0, x = 100, dir = 1;
let stateEnds = Date.now() + secs(3, 5);
let sleepAfterSit = false;

function show() {
  pet.src = chrome.runtime.getURL(frames[state][frame]);
}

function setState(name, durationMs) {
  state = name;
  frame = 0;
  stateEnds = Date.now() + durationMs;
  show();
}

// animation: switch to the next frame
function animate() {
  frame = (frame + 1) % frames[state].length;
  show();
  setTimeout(animate, speed[state]);
}
show();
animate();

// choose what to do next
function pickNext() {
  const r = Math.random();
  if (r < 0.35) {
    dir = Math.random() < 0.5 ? 1 : -1;
    setState("walk", secs(8, 14));      // walking: longest
  } else if (r < 0.60) {
    setState("idle", secs(4, 6));       // idle: medium
  } else if (r < 0.80) {
    setState("sit", secs(6, 9));        // just sit: a little longer than idle
  } else {
    sleepAfterSit = true;               // sit down first, then fall asleep
    setState("sit", secs(2, 3));
  }
}

// movement and decisions, ~33 times per second
setInterval(() => {
  const maxX = window.innerWidth - 128;

  if (state === "walk") {
    x += dir * 3;
    if (x <= 0)    { x = 0;    dir = 1; }   // turn around at the edges
    if (x >= maxX) { x = maxX; dir = -1; }
  }

  if (Date.now() > stateEnds) {
    if (state === "sit" && sleepAfterSit) {
      sleepAfterSit = false;
      setState("sleep", secs(6, 9));    // sleep: same length as sit
    } else {
      pickNext();
    }
  }

  pet.style.left = x + "px";
  pet.style.transform = dir === -1 ? "scaleX(-1)" : "scaleX(1)";
}, 30);
