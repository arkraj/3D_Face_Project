
function setupFaceDetection(){
const landmarkColorPicker = document.getElementById("landmark-color-picker");
let color="#FF0000";
 // Add event listener to the color picker
 landmarkColorPicker.addEventListener('change', () => {
  // Get the selected color value from the color picker
  color = landmarkColorPicker.value;
});

const canvas = document.getElementById("output-canvas");
const ctx = canvas.getContext("2d");

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

function onResults(results) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      // Creating an array for storing pixel coordinates
      const coordinates = [];
      for (const landmark of landmarks) {
        coordinates.push({ x: parseInt(landmark.x * canvas.width), y: parseInt(landmark.y * canvas.height) });
      }

      if (coordinates.length > 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (let i = 0; i < FACEMESH.length; i += 3) {
          ctx.beginPath();
          ctx.moveTo(coordinates[FACEMESH[i]].x, coordinates[FACEMESH[i]].y);
          ctx.lineTo(coordinates[FACEMESH[i + 1]].x, coordinates[FACEMESH[i + 1]].y);
          ctx.lineTo(coordinates[FACEMESH[i + 2]].x, coordinates[FACEMESH[i + 2]].y);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  }

  ctx.restore();
}

const fileInput = document.getElementById("file-input");
let image = new Image();

fileInput.addEventListener("change", (event) => {
  image.onload = async () => {
    await faceMesh.send({ image });
  };
  const file = event.target.files[0];
  if (file) {
    image.src = URL.createObjectURL(file);
  }
});
faceMesh.onResults(onResults);
}
// Export the faceMesh object and onResults function to be used in main.js
export {setupFaceDetection};
