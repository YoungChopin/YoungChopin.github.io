const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("scene-container").appendChild(renderer.domElement);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(15, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
scene.add(sun);

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x3498db, wireframe: true })
);
scene.add(earth);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x888888 })
);
scene.add(moon);

sun.position.set(0, 0, 0);
earth.position.set(30, 0, 0);
moon.position.set(35, 0, 0);

camera.position.z = 100;

document.getElementById("scene-container").addEventListener('wheel', (event) => {
    const delta = event.deltaY;
    camera.position.z += delta * 0.02;
});

let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;

document.getElementById("scene-container").addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
});

document.getElementById("scene-container").addEventListener('mousemove', (event) => {
    if (isDragging) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const deltaYaw = (mouseX - previousMouseX) * 0.01;
        const deltaPitch = (mouseY - previousMouseY) * 0.01;
        camera.rotation.y += deltaYaw;
        camera.rotation.x += deltaPitch;
        previousMouseX = mouseX;
        previousMouseY = mouseY;
    }
});

document.getElementById("scene-container").addEventListener('mouseup', () => {
    isDragging = false;
});

const earthRotationSpeed = 0.02; // Increased rotation speed

const earthOrbitSpeed = 0.0001;
const earthOrbitRadius = 40;

const moonOrbitSpeed = 0.001;
const moonOrbitRadius = 15;

const animate = () => {
    requestAnimationFrame(animate);

    earth.rotation.y += earthRotationSpeed; // Increase the rotation speed

    earth.position.x = earthOrbitRadius * Math.cos(earthOrbitSpeed * Date.now());
    earth.position.z = earthOrbitRadius * Math.sin(earthOrbitSpeed * Date.now());

    moon.position.x = earth.position.x + moonOrbitRadius * Math.cos(moonOrbitSpeed * Date.now());
    moon.position.z = earth.position.z + moonOrbitRadius * Math.sin(moonOrbitSpeed * Date.now());

    renderer.render(scene, camera);
};

animate();
