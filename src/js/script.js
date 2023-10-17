import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


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

// const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);
// renderer.setClearColor(0xffffff); // Set clear color to white


camera.position.set(-10, 30, 30)
orbit.update()


