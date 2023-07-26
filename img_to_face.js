
    import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
    import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
    // import { BufferGeometryUtils } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/utils/BufferGeometryUtils.js';
    function  setupImageTo3DFace(){

    // Get file input element and image display element
    const fileInput = document.getElementById('file-input-img');
    const imageDisplay = document.getElementById('imageDisplay');
    let scene = null, renderer = null, mesh = null, light = null, camera = null;
    let camDistance = 5.0;

    // Add event listener to file input element
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];

        // Create FileReader object
        const reader = new FileReader();

        // Set onload event handler for FileReader
        reader.onload = (e) => {
            const faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            initThreejsObjs();
            faceMesh.onResults(results => onResults(results));

            // Check if file type is an image
            if (file.type.startsWith('image/')) {
                // Set image display source to the loaded data URL
                imageDisplay.onload = () => {
                    // Send image to faceMesh (example)
                    faceMesh.send({ image: imageDisplay });
                }
                imageDisplay.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    });

    function initThreejsObjs() {
        // Create the scene
        if (scene === null) scene = new THREE.Scene();
        // Create the renderer
        if (renderer === null) {
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(300, 280);
            document.getElementById("threejs").appendChild(renderer.domElement);
        }

        // Hemisphere Light (Simulates sky light)
        if (light === null) {
            light = new THREE.HemisphereLight(0xffffff, 0x0000ff, 1);
            light.position.set(0, 0, 20);
            scene.add(light);
        }
    }

    function onResults(results) {
        let landmarks = null;
        if (results.multiFaceLandmarks) {
            for (const lm of results.multiFaceLandmarks) {
                landmarks = lm;
            }
        }

        if (landmarks === null) { alert("face landmarks not detected"); return; }
        if (scene !== null) {
            if (mesh !== null) scene.remove(mesh);
            if (camera !== null) scene.remove(camera);
        }

        // Create a geometry object
        var geometry = new THREE.Geometry();

        // Add vertices to the geometry
        for (var i = 0; i < landmarks.length; i++) {
            var vertex = new THREE.Vector3(landmarks[i].x, -landmarks[i].y, -landmarks[i].z); // -ve values for y and z values to map to the three.js coordinate system
            geometry.vertices.push(vertex);
        }

        // Add faces to the geometry using the indices
        for (var i = 0; i < FACEMESH.length; i += 3) {
            var face = new THREE.Face3(FACEMESH[i], FACEMESH[i + 1], FACEMESH[i + 2]);
            geometry.faces.push(face);
        }

        // Compute face normals and vertex normals for smooth shading
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({ color: 0xffddcc, side: THREE.DoubleSide });

        // Create a mesh using the geometry and material
        mesh = new THREE.Mesh(geometry, material);

        // Add the mesh to the scene or do any other necessary operations
        scene.add(mesh);
        mesh.geometry.computeBoundingSphere();
        let fov = 2* Math.atan(mesh.geometry.boundingSphere.radius/camDistance) * (180 / Math.PI);

        // Create the camera
        camera = new THREE.PerspectiveCamera(fov, imageDisplay.clientHeight / imageDisplay.clientWidth, 0.1, 1000);
        camera.position.x = mesh.geometry.boundingSphere.center.x;
        camera.position.y = mesh.geometry.boundingSphere.center.y;
        camera.position.z = camDistance;

        // Create the OrbitControls for camera movement
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.autoRotate = true;
        controls.target = mesh.geometry.boundingSphere.center; // set the camera target (lookat) to the center of the object


        // Animation function to update and render the scene continuously
        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // Update the OrbitControls state
            renderer.render(scene, camera); // Render the scene with the camera
        }

        animate(); // Start the animation loop
    }


}
export {setupImageTo3DFace};
