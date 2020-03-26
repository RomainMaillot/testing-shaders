import './css/style.styl'
import {Curtains} from 'curtainsjs'
console.log('hello webpack')

// Hot reload
if(module.hot)
{
    module.hot.accept()

    module.hot.dispose(() =>
    {
        console.log('dispose')
    })
}

let mousePosition = {
    x: 0,
    y: 0,
}

// wait for everything to be ready
window.addEventListener("load", function() {
    // set up our WebGL context and append the canvas to our wrapper
    var curtains = new Curtains({
    container: "canvas"
    });

    // get our plane element
    var planeElement = document.getElementsByClassName("plane")[0];

    // could be useful to get pixel ratio
    let pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1.0

    // set our initial parameters (basic uniforms)
    var params = {
    vertexShaderID: "plane-vs", // our vertex shader ID
    fragmentShaderID: "plane-fs", // our fragment shader ID
    uniforms: {
    time: {
        name: "uTime", // uniform name that will be passed to our shaders
        type: "1f", // this means our uniform is a float
        value: 0,
    },
    resolution: { // resolution of our plane
        name: "uResolution",
        type: "2f", // notice this is an length 2 array of floats
        value: [pixelRatio * planeElement.clientWidth, pixelRatio * planeElement.clientHeight],
    },
    mousePosition: { // our mouse position
        name: "uMousePosition",
        type: "2f", // again an array of floats
        value: [mousePosition.x, mousePosition.y],
    },
    },
    };

    // create our plane
    var plane = curtains.addPlane(planeElement, params);

    // if our plane has been successfully created
    if(plane) {
        let wrapper = document.querySelector("body")
        wrapper.addEventListener("mousemove", function(e) {
            handleMovement(e, plane)
        })

        // on resize, update the resolution uniform
        window.addEventListener("resize", function() {
            // get our plane dimensions
            let planeBoundingRect = plane.getBoundingRect()

            plane.uniforms.resolution.value = [planeBoundingRect.width * curtains.pixelRatio, planeBoundingRect.height * curtains.pixelRatio]

            // size our canvas
            // we are dividing it by the pixel ratio value to gain performance
            planeElement.width = planeBoundingRect.width / curtains.pixelRatio
            planeElement.height = planeBoundingRect.height / curtains.pixelRatio
        })
        plane.onRender(function() {
        // use the onRender method of our plane fired at each requestAnimationFrame call
        plane.uniforms.time.value++; // update our time uniform value
    });
}
});

// handle the mouse move event
function handleMovement(e, plane) {

    // touch event
    if(e.targetTouches) {

        mousePosition.x = e.targetTouches[0].clientX
        mousePosition.y = e.targetTouches[0].clientY
    }
    // mouse event
    else {
        mousePosition.x = e.clientX
        mousePosition.y = e.clientY
    }

    // convert our mouse/touch position to coordinates relative to the vertices of the plane
    let mouseCoords = plane.mouseToPlaneCoords(mousePosition.x, mousePosition.y)
    // update our mouse position uniform
    plane.uniforms.mousePosition.value = [mouseCoords.x, mouseCoords.y]
}