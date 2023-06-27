// A3 MINI vertex shader.  The vertex shader is called once per vertex.
precision mediump float; 

// Attributes change for each execution of the vertex shader.
attribute vec3 position; // the position of each vertex
attribute vec3 normal; // the normal of each vertex
attribute vec2 uv; // the uv texture coordinates of each vertex

// Uniforms are the same for every execution of the vertex and fragment shader.
uniform mat4 M_model; // the transform and viewing matrices
uniform mat4 M_view;
uniform mat4 M_pro;
uniform vec3 color; // the color of this part of the MINI
uniform vec3 lightPos;
uniform bool spot;
uniform bool tone;

// Varyings are passed to the fragment shader.  The hardware performs
// barycentric interpolation between vertices for the fragment shader.
varying vec3 baseColor; // the color of this part
varying vec3 baseNormal;
varying vec2 baseUV;
varying vec3 Half;

// light variable that need to go to the fragment shader
varying vec3 lightIntensity;
varying vec3 lightDir;

void main() 
{  
	// Set the color for this vertex.  Can also experimentally examine
	// the normal or uv coordinates.
    baseColor = color;
    baseNormal = normal;
    baseUV = uv;

    vec4 pos = M_view * M_model * vec4(position, 1.0);

    // set lightPos
    vec4 lightPosition = M_view * vec4(lightPos, 1.0);

    // set lightDir
    if (spot || tone) lightDir = normalize(lightPosition.xyz - pos.xyz);
    else lightDir = normalize(vec3(1000, 0, 1000));
    // calculate half
    Half = normalize(-pos.xyz + lightDir);
    // set light intensity
    lightIntensity = vec3(1., 1., 1.);

    // For this part, transform vertices
    gl_Position = M_pro * pos;
}
