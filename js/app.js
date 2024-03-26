const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const stateBtn = document.getElementById('stateBtn');
const transitionBtn = document.getElementById('transitionBtn');

const states = [];
const transitions = [];
let currentMode = 'state';
let startState = null;
const stateRadius = 20;
const arrowWidth = 10;
const solidColor = "#111";
const lightColor = "#999";
const invalidColor = "#ff8888";

let isDrawing = false;
let tempTransition = null;
let debugText = document.getElementById("debugText");
let debugMode = true;

function addDebugText(text) {
  if(!debugMode) {
    debugText.innerHTML = "";
    return;
  }
  debugText.innerHTML = "DEBUG: " + text;
}

function drawLoop(x, y, offset, color) {
  ctx.beginPath();
  ctx.ellipse(x, y - 1.5*offset, stateRadius, 2*stateRadius, 0, 5*Math.PI/6,  13*Math.PI/6 );
  ctx.strokeStyle = color;
  ctx.stroke();

  const angle = 7*Math.PI/12;

  x +=  stateRadius * Math.cos(Math.PI/6)
  y -= stateRadius*Math.sin(Math.PI/6)

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - arrowWidth * Math.cos(angle - Math.PI / 6), y - arrowWidth * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x - arrowWidth * Math.cos(angle + Math.PI / 6), y - arrowWidth * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawArrow(x1, y1, x2, y2, offset, color) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);

  x1 += offset*Math.cos(angle);
  y1 += offset*Math.sin(angle);

  x2 -= offset*Math.cos(angle);
  y2 -= offset*Math.sin(angle);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - arrowWidth * Math.cos(angle - Math.PI / 6), y2 - arrowWidth * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - arrowWidth * Math.cos(angle + Math.PI / 6), y2 - arrowWidth * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawTransition(x1, y1, x2, y2, offset = 0, color = solidColor) {
  if(x1 == x2 && y1 == y2) {
    drawLoop(x1, y1, offset, color);
  }
  else {
    drawArrow(x1, y1, x2, y2, offset, color);
  }
  
}

function drawState(x, y, radius, color = solidColor) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.stroke();
}

// Draw states and transitions
function drawShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  states.forEach(state => {
    drawState(state.x, state.y, stateRadius);
  });

  transitions.forEach(transition => {
    drawTransition(transition.start.x, transition.start.y, transition.end.x, transition.end.y, stateRadius);
  });

  if (tempTransition) {
    drawTransition(startState.x, startState.y, tempTransition.x, tempTransition.y, stateRadius, lightColor);
  }
}

// Add a new state
function addState(x, y) {
  const existingState = states.find(state => {
    const distance = Math.sqrt((state.x - x) ** 2 + (state.y - y) ** 2);
    return distance <= 40; // Adjust this value to control the minimum distance between states
  });

  if (!existingState) {
    states.push({ x, y });
    drawShapes();
  }
}

// Add a new transition
function addTransition(start, end) {
  const existingTransition = transitions.find(
    transition => (transition.start === start && transition.end === end)
  );

  if (!existingTransition) {
    transitions.push({ start, end });
    drawShapes();
  }
}

// Handle canvas mouse events
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (currentMode === 'state') {
    addState(x, y);
  } else if (currentMode === 'transition') {
    const clickedState = states.find(state => {
      const distance = Math.sqrt((state.x - x) ** 2 + (state.y - y) ** 2);
      return distance <= 20;
    });

    if (clickedState) {
      startState = clickedState;
      isDrawing = true;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  drawShapes();
  if (currentMode == "state" && !isDrawing) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const existingState = states.find(state => {
      const distance = Math.sqrt((state.x - x) ** 2 + (state.y - y) ** 2);
      return distance <= 40; // Adjust this value to control the minimum distance between states
    });

    if(existingState)
      drawState(x, y, stateRadius, invalidColor);
    else
      drawState(x, y, stateRadius, lightColor)
  }
  if (currentMode === 'transition' && isDrawing) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    tempTransition = { x, y };
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (currentMode === 'transition' && isDrawing) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const endState = states.find(state => {
      const distance = Math.sqrt((state.x - x) ** 2 + (state.y - y) ** 2);
      return distance <= 20;
    });

    if (endState) {
      addTransition(startState, endState);
    }

    startState = null;
    isDrawing = false;
    tempTransition = null;
    drawShapes();
  }
});

// Handle button clicks
stateBtn.addEventListener('click', () => {
  currentMode = 'state';
  stateBtn.classList.add('active');
  transitionBtn.classList.remove('active');
});

transitionBtn.addEventListener('click', () => {
  currentMode = 'transition';
  transitionBtn.classList.add('active');
  stateBtn.classList.remove('active');
});

// Initial draw
drawShapes();