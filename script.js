// Resizer functionality
const resizer = document.getElementById('dragHandle');
const leftPanel = document.querySelector('.left-panel');
const rightPanel = document.querySelector('.right-panel');

let isResizing = false;
let startX;
let startLeftWidth;
let startRightWidth;

resizer.addEventListener('mousedown', initResize);
document.addEventListener('mousemove', resize);
document.addEventListener('mouseup', stopResize);

function initResize(e) {
    isResizing = true;
    startX = e.clientX;
    startLeftWidth = leftPanel.offsetWidth;
    startRightWidth = rightPanel.offsetWidth;
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    // Prevent any animation flicker
    leftPanel.style.transition = 'none';
    rightPanel.style.transition = 'none';
    resizer.style.transition = 'none';
}

function resize(e) {
    if (!isResizing) return;

    const totalWidth = startLeftWidth + startRightWidth;
    const dx = e.clientX - startX;
    
    const newLeftWidth = startLeftWidth + dx;
    const newRightWidth = startRightWidth - dx;
    
    // Apply min/max constraints
    if (newLeftWidth >= 200 && newRightWidth >= 200) {
        const leftPercent = (newLeftWidth / totalWidth * 100);
        const rightPercent = (newRightWidth / totalWidth * 100);
        
        if (leftPercent <= 80 && rightPercent >= 20) {
            leftPanel.style.flex = `0 0 ${leftPercent}%`;
            rightPanel.style.width = `${rightPercent}%`;
        }
    }
}

function stopResize() {
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Restore transitions
    leftPanel.style.transition = '';
    rightPanel.style.transition = '';
    resizer.style.transition = '';
}

// Graph visualization settings
const graphOptions = {
    nodes: {
        shape: 'circle',
        size: 30,
        font: {
            size: 20,
            color: '#ffffff'
        },
        color: {
            background: '#1e1e1e',
            border: '#666666',
            highlight: {
                background: '#264f78',
                border: '#ffffff'
            }
        },
        borderWidth: 2
    },
    edges: {
        width: 2,
        color: {
            color: '#666666',
            highlight: '#ffffff'
        },
        font: {
            size: 16,
            color: '#ffffff'
        },
        arrows: {
            to: { enabled: true }
        }
    },
    physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
            gravitationalConstant: -50,
            springLength: 100,
            springConstant: 0.08
        }
    }
};

// Graph data structure for algorithm
const graphData = {
    0: { 1: 4, 2: 2 },
    1: { 2: 1, 3: 5 },
    2: { 3: 8, 4: 10 },
    3: { 4: 2 },
    4: {}
};

// Visualization data
const graph = {
    nodes: [
        { id: 0, label: "0" },
        { id: 1, label: "1" },
        { id: 2, label: "2" },
        { id: 3, label: "3" },
        { id: 4, label: "4" }
    ],
    edges: [
        { from: 0, to: 1, label: "4" },
        { from: 0, to: 2, label: "2" },
        { from: 1, to: 2, label: "1" },
        { from: 1, to: 3, label: "5" },
        { from: 2, to: 3, label: "8" },
        { from: 2, to: 4, label: "10" },
        { from: 3, to: 4, label: "2" }
    ]
};

// Algorithm steps storage
let algorithmSteps = [];
let network = null;
let currentStep = 0;
let isPlaying = false;
let playInterval = null;

// DOM elements
const graphTracer = document.getElementById('graphTracer');
const arrayTracer = document.getElementById('arrayTracer');
const logTracer = document.getElementById('logTracer');
const codeTracer = document.getElementById('codeTracer');
const buildBtn = document.getElementById('buildBtn');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const speedSlider = document.getElementById('speedSlider');

// Generate algorithm steps
function generateSteps() {
    const distances = {};
    const visited = new Set();
    const previous = {};
    const steps = [];
    
    // Initialize distances
    steps.push({
        type: 'init-start',
        distances: { ...distances },
        visited: new Set(visited),
        current: null,
        message: 'Starting Dijkstra\'s algorithm',
        line: 2
    });

    for (let vertex in graphData) {
        distances[vertex] = Infinity;
        previous[vertex] = null;
        steps.push({
            type: 'init',
            distances: { ...distances },
            visited: new Set(visited),
            current: null,
            message: `Initializing distance to vertex ${vertex} as Infinity`,
            line: 8
        });
    }

    distances[0] = 0;
    steps.push({
        type: 'init',
        distances: { ...distances },
        visited: new Set(visited),
        current: 0,
        message: 'Setting distance to start vertex (0) as 0',
        line: 10
    });

    while (visited.size < Object.keys(graphData).length) {
        steps.push({
            type: 'loop-start',
            distances: { ...distances },
            visited: new Set(visited),
            current: null,
            message: 'Starting new iteration of main loop',
            line: 12
        });

        // Find unvisited vertex with smallest distance
        let current = null;
        let minDistance = Infinity;
        
        for (let vertex in distances) {
            steps.push({
                type: 'find-min',
                distances: { ...distances },
                visited: new Set(visited),
                current: parseInt(vertex),
                checking: true,
                message: `Checking vertex ${vertex} (distance: ${distances[vertex]})`,
                line: 15
            });

            if (!visited.has(vertex) && distances[vertex] < minDistance) {
                current = vertex;
                minDistance = distances[vertex];
                steps.push({
                    type: 'find-min',
                    distances: { ...distances },
                    visited: new Set(visited),
                    current: parseInt(vertex),
                    message: `Found new minimum at vertex ${vertex} (distance: ${distances[vertex]})`,
                    line: 17
                });
            }
        }

        if (current === null) {
            steps.push({
                type: 'break',
                distances: { ...distances },
                visited: new Set(visited),
                current: null,
                message: 'No more reachable vertices found',
                line: 22
            });
            break;
        }

        visited.add(current);
        steps.push({
            type: 'visit',
            distances: { ...distances },
            visited: new Set(visited),
            current: parseInt(current),
            message: `Marking vertex ${current} as visited`,
            line: 23
        });

        // Update distances to neighbors
        for (let neighbor in graphData[current]) {
            steps.push({
                type: 'check-neighbor',
                distances: { ...distances },
                visited: new Set(visited),
                current: parseInt(current),
                neighbor: parseInt(neighbor),
                message: `Checking neighbor ${neighbor} of vertex ${current}`,
                line: 26
            });

            const distance = distances[current] + graphData[current][neighbor];
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = current;
                steps.push({
                    type: 'update',
                    distances: { ...distances },
                    visited: new Set(visited),
                    current: parseInt(current),
                    neighbor: parseInt(neighbor),
                    message: `Updated distance to vertex ${neighbor}: ${distance}`,
                    line: 29
                });
            }
        }
    }

    steps.push({
        type: 'complete',
        distances: { ...distances },
        visited: new Set(visited),
        current: null,
        message: 'Algorithm complete',
        line: 35
    });

    return steps;
}

// Initialize network
function initNetwork() {
    network = new vis.Network(graphTracer, graph, graphOptions);
}

// Initialize array visualization
function initArray() {
    const arrayContainer = arrayTracer.querySelector('.array-container');
    arrayContainer.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const arrayItem = document.createElement('div');
        arrayItem.className = 'array-item';
        arrayItem.innerHTML = `
            <span class="array-index">${i}</span>
            <span class="array-value">∞</span>
        `;
        arrayContainer.appendChild(arrayItem);
    }
}

// Update step counter
function updateStepCounter() {
    const counter = document.querySelector('.step-counter');
    counter.textContent = `${currentStep + 1}/${algorithmSteps.length}`;
}

// Add log entry
function addLogEntry(message) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    logTracer.appendChild(entry);
    logTracer.scrollTop = logTracer.scrollHeight;
}

// Load code into code tracer with syntax highlighting
function loadCode() {
    const code = `// Dijkstra's Algorithm Implementation
function dijkstra(graph, start) {
    const distances = {};
    const visited = new Set();
    const previous = {};
    
    // Initialize distances
    for (let vertex in graph) {
        distances[vertex] = Infinity;
        previous[vertex] = null;
    }
    distances[start] = 0;

    while (visited.size < Object.keys(graph).length) {
        let current = null;
        let minDistance = Infinity;
        
        // Find unvisited vertex with smallest distance
        for (let vertex in distances) {
            if (!visited.has(vertex) && 
                distances[vertex] < minDistance) {
                current = vertex;
                minDistance = distances[vertex];
            }
        }

        if (current === null) break;
        visited.add(current);

        // Update distances to neighbors
        for (let neighbor in graph[current]) {
            const distance = distances[current] + 
                           graph[current][neighbor];
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = current;
            }
        }
    }

    return { distances, previous };
}`;

    codeTracer.innerHTML = code.split('\n').map((line, index) => `
        <div class="code-line" data-line="${index + 1}">
            <span class="line-number">${index + 1}</span>
            <span class="line-content">${highlightSyntax(line)}</span>
        </div>
    `).join('');
}

// Simple syntax highlighting
function highlightSyntax(line) {
    return line
        .replace(/(\/\/.+)$/g, '<span style="color: #6A9955">$1</span>') // comments
        .replace(/\b(const|let|function|for|in|if|return|while|break)\b/g, '<span style="color: #C586C0">$1</span>') // keywords
        .replace(/\b(Set|Infinity|Object|null)\b/g, '<span style="color: #4EC9B0">$1</span>') // built-ins
        .replace(/(['"])(.*?)\1/g, '<span style="color: #CE9178">$1$2$1</span>'); // strings
}

// Update visualization based on current step
function updateVisualization() {
    const step = algorithmSteps[currentStep];
    if (!step) return;

    // Update graph
    const nodes = network.body.data.nodes.get();
    nodes.forEach(node => {
        if (step.visited.has(node.id.toString())) {
            node.color = { background: '#4CAF50', border: '#666666' };
        } else if (node.id === step.current) {
            node.color = { background: '#264f78', border: '#ffffff' };
        } else if (step.neighbor === node.id) {
            node.color = { background: '#ff69b4', border: '#ffffff' };
        } else {
            node.color = { background: '#1e1e1e', border: '#666666' };
        }
    });
    network.body.data.nodes.update(nodes);

    // Update edges
    const edges = network.body.data.edges.get();
    edges.forEach(edge => {
        if (step.current !== null && 
            ((edge.from === step.current && edge.to === step.neighbor) ||
             (edge.to === step.current && edge.from === step.neighbor))) {
            edge.color = { color: '#ff69b4' };
        } else {
            edge.color = { color: '#666666' };
        }
    });
    network.body.data.edges.update(edges);

    // Update array
    const arrayItems = arrayTracer.querySelectorAll('.array-item');
    arrayItems.forEach((item, index) => {
        const distance = step.distances[index];
        item.querySelector('.array-value').textContent = distance === Infinity ? '∞' : distance;
        
        if (step.visited.has(index.toString())) {
            item.classList.add('visited');
            item.classList.remove('current');
        } else if (index === step.current) {
            item.classList.add('current');
            item.classList.remove('visited');
        } else {
            item.classList.remove('visited', 'current');
        }
    });

    // Update log
    addLogEntry(step.message);

    // Update code highlighting
    const codeLines = codeTracer.querySelectorAll('.code-line');
    codeLines.forEach(line => line.classList.remove('highlight'));
    
    if (step.line) {
        const highlightLine = codeTracer.querySelector(`[data-line="${step.line}"]`);
        if (highlightLine) {
            highlightLine.classList.add('highlight');
            highlightLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateStepCounter();
}

// Play/Pause animation
function togglePlay() {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
    
    if (isPlaying) {
        playInterval = setInterval(() => {
            if (currentStep < algorithmSteps.length - 1) {
                currentStep++;
                updateVisualization();
            } else {
                isPlaying = false;
                playBtn.textContent = '▶ Play';
                clearInterval(playInterval);
            }
        }, 1000);
    } else {
        clearInterval(playInterval);
    }
}

// Event listeners
buildBtn.addEventListener('click', () => {
    currentStep = 0;
    logTracer.innerHTML = '';
    algorithmSteps = generateSteps();
    initNetwork();
    initArray();
    loadCode();
    updateVisualization();
});

playBtn.addEventListener('click', togglePlay);

prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        updateVisualization();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentStep < algorithmSteps.length - 1) {
        currentStep++;
        updateVisualization();
    }
});

speedSlider.addEventListener('input', (e) => {
    if (isPlaying) {
        clearInterval(playInterval);
        playInterval = setInterval(() => {
            if (currentStep < algorithmSteps.length - 1) {
                currentStep++;
                updateVisualization();
            } else {
                isPlaying = false;
                playBtn.textContent = '▶ Play';
                clearInterval(playInterval);
            }
        }, 2000 / e.target.value);
    }
});

// Initialize the visualization
buildBtn.click(); 