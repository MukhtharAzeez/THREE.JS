import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


const startingPosition = document.getElementById("starting");
const endingPosition = document.getElementById("ending");
const button = document.getElementById("findPath");

function dijkstra(graph, start, end) {
    const distances = {};
    const previous = {};
    const nodes = [];

    for (let node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
        nodes.push(node);
    }

    distances[start] = 0;

    while (nodes.length) {
        let smallestNode = nodes[0];
        for (let node of nodes) {
            if (distances[node] < distances[smallestNode]) {
                smallestNode = node;
            }
        }

        if (smallestNode === end) {
            let path = [];
            while (previous[smallestNode] !== null) {
                path.push(smallestNode);
                smallestNode = previous[smallestNode];
            }
            path.push(start);
            return path.reverse();
        }

        nodes.splice(nodes.indexOf(smallestNode), 1);

        for (let neighbor of graph[smallestNode]) {
            let alt = distances[smallestNode] + neighbor.weight;
            if (alt < distances[neighbor.node]) {
                distances[neighbor.node] = alt;
                previous[neighbor.node] = smallestNode;
            }
        }
    }

    return null;
}

const mapUrl = new URL('../assets/mapd2.glb', import.meta.url);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 10;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a GLTFLoader
const loader = new GLTFLoader();

const ambientLight1 = new THREE.AmbientLight(0xffffff, 1.0);
const ambientLight2 = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight1, ambientLight2);



// Load the 3D model
loader.load(mapUrl.href, (gltf) => {
    const model = gltf.scene;
    model.scale.set(30, 30, 30);
    scene.add(model);
    model.position.set(0, 0, 0);

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();
}, undefined, (error) => {
    console.error(error);
});

// Handle window resizing
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
});
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.maxPolarAngle = Math.PI / 3;


// renderer.setClearColor(0xffffff); // Set clear color to white

const points = [
    { name: 'circle', coordinates: [-25, 2, -13] },
    { name: 'secondCircle', coordinates: [-20, 2, -10] },
    { name: 'thirdCircle', coordinates: [-10, 2, -10] },
    { name: 'fourthCircle', coordinates: [-10, 2, 0] },
    { name: 'hospital', coordinates: [5, 2, 0] },
    { name: 'exam', coordinates: [18, 2, 8] },
]

const nodes = { };

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
points.forEach((point)=>{
    const geometry = new THREE.SphereGeometry();
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(point.coordinates[0], point.coordinates[1], point.coordinates[2]);
    sphere.scale.set(0.5, 0.5, 0.5);
    scene.add(sphere);
    nodes[point.name] = sphere
})

points.forEach((optionData) => {
    const option = document.createElement("option");
    option.value = optionData.name;
    option.text = optionData.name;
    startingPosition.appendChild(option);

    const options = document.createElement("option");
    options.value = optionData.name;
    options.text = optionData.name;
    endingPosition.appendChild(options);
});


const weightedGraph = {
    circle: [
        { node: "secondCircle", weight: 1 },
        { node: "fourthCircle", weight: 6 },
    ],
    secondCircle: [
        { node: "circle", weight: 1 },
        { node: "thirdCircle", weight: 3 },
    ],
    thirdCircle: [
        { node: "secondCircle", weight: 3 },
        { node: "fourthCircle", weight: 4 },
        { node: "hospital", weight: 8 },
    ],
    fourthCircle: [
        { node: "thirdCircle", weight: 4 },
        { node: "circle", weight: 6 },
        { node: "hospital", weight: 7 },
        { node: "exam", weight: 1 },
    ],
    hospital: [
        { node: "thirdCircle", weight: 8 },
        { node: "fourthCircle", weight: 7 },  
        { node: "exam", weight: 4 },
    ],
    exam: [
        { node: "hospital", weight: 4 },
        { node: "fourthCircle", weight: 1 },
    ]
};


let lines = []
let start ;
let end ;
startingPosition.addEventListener('change',(event)=>{
    start = event.target.value
})

endingPosition.addEventListener('change', (event) => {
    end = event.target.value 
})

button.addEventListener('click',()=>{
    clearLines()
    findShortestPath()
})

function clearLines() {
    for (const line of lines) {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
    }
    lines = []; // Clear the lines array
}


function findShortestPath() {
    if(!start || !end) return 
    const shortestPath = dijkstra(weightedGraph, start, end);

    // Create a line geometry
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 5 });
    for (let i = 0; i < shortestPath.length - 1; i++) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            nodes[shortestPath[i]].position, // Position of the first plot
            nodes[shortestPath[i + 1]].position // Position of the second plot
        ]);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        lines.push(line);
    }
}

renderer.domElement.addEventListener('click', (event) => {
    console.log(event.clientX)
})

// const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);

camera.position.set(0, 30, 30)
orbit.update()


