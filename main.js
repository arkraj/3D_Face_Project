// main.js

// Import necessary modules
import { setupFaceDetection } from './detect_landmarks.js';
import { setupImageTo3DFace } from './img_to_face.js';
//import { setupVideoDetection } from './detect_landmark_video.js';
import { setupVideoTo3DFace } from './video_to_face.js';

// Function to handle the initialization of the application
document.addEventListener('DOMContentLoaded', function () {
// Set up the face detection functionality with the corresponding output canvas
const faceDetectionCanvas = document.getElementById('output-canvas');
setupFaceDetection(faceDetectionCanvas);

// Set up the image to 3D face functionality with the corresponding output canvas
const imageTo3DFaceCanvas = document.getElementById('output-canvas-img');
 setupImageTo3DFace(imageTo3DFaceCanvas);

// Set up the live video landmark detection functionality with the corresponding output canvas
// const videoDetectionCanvas = document.getElementById('output_canvas_lm');
// setupVideoDetection(videoDetectionCanvas);
// Set up the live video to 3D face functionality with the corresponding output canvas
 const videoTo3DFaceCanvas = document.getElementById('output_canvas');
 setupVideoTo3DFace(videoTo3DFaceCanvas);
});
