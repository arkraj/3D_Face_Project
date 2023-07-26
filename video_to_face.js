
// Import necessary modules
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

function setupVideoTo3DFace(){
     // Get the video and canvas elements
     const videoElement = document.getElementsByClassName('input_video')[0];
     const videoSize = [550, 400];
     const rendererSize = [550, 400]; // width, height
     let scene = null, renderer = null, mesh = null, light = null, threejsCamera = null;
     let camDistance = 5.0;

     function initThreejsObjs() {
         // Create the scene
         if (scene === null) scene = new THREE.Scene();
         // Create the renderer
         if (renderer === null) {
             renderer = new THREE.WebGLRenderer();
             renderer.setSize(rendererSize[0], rendererSize[1]);
             document.getElementById("threejs1").appendChild(renderer.domElement);
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

         if (landmarks === null) {
             alert("Face landmarks not detected");
             return;
         }
         if (scene !== null) {
             if (mesh !== null) scene.remove(mesh);
             if (threejsCamera !== null) scene.remove(threejsCamera);
         }

         // Create a geometry object
         var geometry = new THREE.Geometry();

         // Add vertices to the geometry
         for (var i = 0; i < landmarks.length; i++) {
             var vertex = new THREE.Vector3(landmarks[i].x, -landmarks[i].y, -landmarks[i].z);
             // Map the landmarks to three.js coordinate system (y and z values are negated)
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

         // Add the mesh to the scene
         scene.add(mesh);

         mesh.geometry.computeBoundingSphere();
         let fov = 4 * Math.atan(0.15 / camDistance) * (180 / Math.PI); // 0.15 is a hack for bounding sphere's radius at the normal distance of 2 ft between camera and face

         // Create the threejsCamera
         threejsCamera = new THREE.PerspectiveCamera(fov, 1, 0.1, 1000);
         threejsCamera.position.x = 0.5;
         threejsCamera.position.y = mesh.geometry.boundingSphere.center.y;
         threejsCamera.position.z = camDistance;

         renderer.render(scene, threejsCamera);
     }

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
     faceMesh.onResults(onResults);

     const devCamera = new Camera(videoElement, {
         onFrame: async () => {
             await faceMesh.send({ image: videoElement });
         },
         width: videoSize[0],
         height: videoSize[1]
     });

     initThreejsObjs();
     devCamera.start();
}
export{setupVideoTo3DFace};