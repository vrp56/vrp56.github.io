// A3 Vertex Processing Code
// Parts for students complete are marked by TODO; the rest is preprocessing.
// !! Updated for Programming Assignment #4

// Load regl module into full-sized element on the page
const regl = createREGL();

// Four data elements loaded from web server: two shader programs, geometry, and materials
// vertexSource/fragmentSource: glsl strings for the shaders.
let vertexSource = undefined;
let fragmentSource = undefined;

// geometry: An associative array with three keys:
//      - vertexdata:   An Array of floating point vertex data. It is an 
//                      interleaved float array of 3 position coordinates, 
//                      3 normal coordinates, and 2 texture coordinates. 
//                      Only the positions are strictly needed for Assignment 3.

//      - indexdata:    An array of unsigned integers for the index/element 
//                      buffer. Specifies how the triangles are connected.

//      - groups:       A dictionary mapping Strings to Arrays. The strings
//                      are the names of the parts, the arrays are indices
//                      into geometry.indexdata that defines that part.

// So geometry.vertexdata, geometry.indexdata, and geometry.group is your 
// information loaded here. geometry.groups.keys() are the names of the parts
// used for materials and the values of the indexdata indices mentioned above.
let geometry = undefined;

// materials:   An associative Array with String:Associative Array pairs. The 
//              keys are the name of the parts from geometry.groups, the 
//              associative array defines material properties for lighting and
//              texture mapping. For A3, only the "color" key should be used 
//              (the textures are not provided in this assignment).
let materials = undefined;

// Set up transformation matrices (as uniforms)
// The model matrix
const M_model = mat4.create();
// The view matrix TODO
const M_view = mat4.lookAt(
    mat4.create(), // output matrix
    [500, 0, 75], // eye point (e)
    [0, 0, 75], // center of regard (gaze direction g)
    [0, 0, 1]); // up vector (t)
// The projection matrix.  Because it changes when the viewport width or 
// height changes, it must be set per-frame in the draw() function.
const M_pro = mat4.create();

// light mode and movement variables
let lightPos = vec3.fromValues(800, 400, 200);
let spot = true;
let tone = false;
let x_move = false;
let y_move = false;
let z_move = false;


// Set up four Fetch calls for the resources and process accordingly. 
// Each one calls the init() function; this function only completes when
// all resources are loaded.
function load()
{
    fetch('a3g_vtex.vert.glsl')
    .then(function(response) {
        return response.text();
    })
    .then(function(txt) {
        vertexSource = txt;
        init();
    });

    fetch('a3g_vtex.frag.glsl')
    .then(function(response) {
        return response.text();
    })
    .then(function(txt) {
        fragmentSource = txt;
        init();
    });

    fetch('mini_geometry.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(obj) {
        geometry = obj;
        init();
    });

    fetch('mini_material.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(obj) {
        materials = obj;
        init();
    });

    // Add key listener for keyboard events
    document.addEventListener('keydown', (event) => {
        const keycode = event.key;
        console.log(`keypress: ${keycode}`)
        if(keycode == 'ArrowRight')
        {
            // lightPos[1] += 100;
            // console.log(`Light Position: ${lightPos}`);
            // mat4.rotateZ(M_model, M_model, (Math.PI * .25));
        }
        else if(keycode =='ArrowLeft')
        {
            // lightPos[1] -= 100;
            // console.log(`Light Position: ${lightPos}`);
            // mat4.rotateZ(M_model, M_model, (Math.PI * -.25));
        }
        else if(keycode =='ArrowUp')
        {
            if (x_move) lightPos[0] += 100;
            else if (y_move) lightPos[1] += 100;
            else if (z_move) lightPos[2] += 100;

            console.log(`Light Position: ${lightPos}`);
        }
        else if(keycode =='ArrowDown')
        {
            if (x_move) lightPos[0] -= 100;
            else if (y_move) lightPos[1] -= 100;
            else if (z_move) lightPos[2] -= 100;

            console.log(`Light Position: ${lightPos}`);
        }
        else if(keycode == 'm')
        {
            spot = !spot;
            if (spot) 
            {
                tone = false;
                console.log(`Current Light Mode: Spot`);
            }
            
            else 
            {
                tone = false;
                console.log(`Current Light Mode: Directional`);
            }
            
        }
        else if (keycode == 'x')
        {
            x_move = !x_move;
            if (x_move)
            {
                y_move = false;
                z_move = false;
            }
            console.log(`Movement modes: X: ${x_move}, Y: ${y_move}, Z: ${z_move}`);
        }
        else if (keycode == 'y')
        {
            y_move = !y_move;
            if (y_move)
            {
                x_move = false;
                z_move = false;
            }
            console.log(`Movement modes: X: ${x_move}, Y: ${y_move}, Z: ${z_move}`);
        }
        else if (keycode == 'z')
        {
            z_move = !z_move;
            if (z_move)
            {
                x_move = false;
                y_move = false;
            }
            console.log(`Movement modes: X: ${x_move}, Y: ${y_move}, Z: ${z_move}`);
        }
        else if (keycode == 't')
        {
            tone = !tone;
            if (tone)
            {
                spot = false;
                console.log(`Current Light Mode: Tone`);
            } 
            else 
            {
                spot = true;
                console.log(`Current Light Mode: Spot`);
            }
            
        }
        else if (keycode == 'd')
        {
            console.log("Returned to default light position and spot light mode");
            vec3.set(lightPos, 800, 400, 200);
            spot = true;
            tone = false;
            x_move = false;
            y_move = false;
            z_move = false;
            // console.log(`Light Position: ${lightPos}`);
        }
       });
}

// The initialization function. Checks for all resources before continuing.
function init()
{
    // Is everything loaded?
    if(vertexSource === undefined 
        || fragmentSource === undefined 
        || geometry === undefined
        || materials === undefined)
        return;

    // Roatate car at start
    mat4.rotateZ(M_model, M_model, (Math.PI * .25));

    // print possible commands
    console.log("Swap between spot and directional light: Press m");
    console.log("Turn on tone lighting (turns off spot or direction light: Press t");
    console.log("Move light along X-axis: Press x and then use up and down arrows");
    console.log("Move lgith along Y-axis: Press y and then use up and down arrows");
    console.log("Move light alogn Z-axis: Press z and then use up and down arrows");
    console.log("Return to default settings: Press d");

    // print light type at start (should be spot)
    console.log(`Current Light Mode: Spot`);

    // Sizing for buffer strides & offsets 
    const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

    // Populate the buffers for the MINI: the VERTEX BUFFER OBJECT from geometry.vertexdata 
    // and the INDEX BUFFER OBJECT from geometry.indexdata.
    const vertexBuffer = regl.buffer(new Float32Array(geometry.vertexdata));
    const indexBuffer = regl.elements(new Uint16Array(geometry.indexdata));

    // Query the vertexdata
    // console.log(`geometry.vertexdata.length: ${geometry.vertexdata.length}`);
    // console.log(`geometry.indexdata.length:  ${geometry.indexdata.length}`);
    //console.log(`max(geometry.indexdata): ${Math.max(geometry.indexdata)}`);

    // Draw function. Draws the part passed in as a property. Color is passed
    // in from that part.  Called once per frame.
    const drawMINI = regl({
        // The DEPTH BUFFER is how the rendering hardware draws triangles that
        // are closer to eye point in front of triangles farther from the
        // viewpoint.  These are the state settings for the hardware depth
        // buffer.
        depth: { 
            enable: true,
            mask: true,
            func: 'less',
            range: [0, 1]
          },     
          // CULLING is the process of removing triangles that cannot be seen
          // from the current viewpoint.  This culls back-facing polygons.
          cull: {
            enable: true,
            face: 'back'
          },
        // The fragment shader code.
        frag: fragmentSource,  
        // The vertex shader code.
        vert: vertexSource, 
        // Attribute variables are passed into the fragment shader, and change
        // on a per-vertex basis.
        attributes: {    
            // Set the parameters of the hardware vertexBuffer object, which 
            // holds the vertices of the MINI model.  NEW: The vertex list has 8 values
            // per vertex: 3 coord, 3 normal, 2 uv (for texturing).
            position: { 
                buffer: vertexBuffer, 
                size: 3,
                stride: 8 * FLOAT_SIZE, // Skips 3 normal values, 2 uv values
                offset: 0 // Begins at 0 in list of 8 values
            },
            normal: {
                buffer: vertexBuffer,
                size: 3,
                stride: 8 * FLOAT_SIZE,
                offset: 3 * FLOAT_SIZE // Skips 3 position values
            },
            uv: {
                buffer: vertexBuffer,
                size: 2,
                stride: 8 * FLOAT_SIZE,
                offset: 6 * FLOAT_SIZE // Skips 3 uv values
            }
        },
        // Uniform variables are passed into the fragment shader, and are the
        // same (uniform) for each vertex.  They can change frame-by-frame.
        uniforms: { 
            // The transform and viewing matrices.
            M_model: (context, {M_model}) => M_model,
            M_view: (context, {M_view}) => M_view,
            M_pro: (context) => mat4.perspective(
                M_pro, // output matrix
                glMatrix.toRadian(45.), // vertical field of view (55)
                context.viewportWidth / context.viewportHeight, // aspect ratio
                5., 1500.), // near plane, far plane
            // The color of each MINI part.
            color: (context, {color}) => color,
            lightPos: (context, {lightPos}) => lightPos, // pass the light pos to the vertex shader
            spot: (context, {spot}) => spot, // tell vertex and frag shader what type of light to use (spot or directional)
            tone: (context, {tone}) => tone // tell the vert and frag shader if it needs to use tone lighting
        },
        // Elements wraps the vertexBuffer object.  It contains the indices that
        // map vertices to triangles.
        elements: indexBuffer,
        // Set the drawing properties.  
        primitive: "triangles", 
        offset: (context, {offset}) => offset, 
        count: (context, {count}) => count
    });
    // The per-frame callback function.
    regl.frame(function(context)
    {
        //console.log('in regl.frame');
        for(let part in geometry.groups)
        {
            //console.log(`regl.frame: ${part}`)
            drawMINI({
                M_model: M_model,
                M_view: M_view,
                // Offset in triangle list for this part.
                offset: 3 * geometry.groups[part][0],
                // Size of this part in triangles.
                count: 3 * (geometry.groups[part][1] - geometry.groups[part][0]),
                // Color of this part.
                color: materials[part].color,
                lightPos: lightPos,
                spot: spot,
                tone: tone
            });
        }
    });
}

// Load the resources.
load();
