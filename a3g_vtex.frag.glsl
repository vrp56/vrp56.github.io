// A3 MINI fragment shader.  A MESH is formed by many triangles, and the 
// surface of each triangle is known as a FRAGMENT.  The fragment shader is
// the code that runs in parallel on every pixel in each fragment.
precision mediump float;

// Varyings are passed from the vertex shader.  The hardware has performed 
// barycentric interpolation between vertices.
varying vec3 baseColor;
varying vec3 baseNormal;
varying vec2 baseUV;
varying vec3 Half;
varying vec3 lightDir;
varying vec3 lightIntensity;

uniform bool spot;
uniform bool tone;

// uniform vec2 Ia;
// uniform vec3 ka, kd, ks;
vec3 Ia = vec3(0.2, 0.2, 0.2);
vec3 ka = vec3(0.5, 0.5, 0.5);
vec3 ks = vec3(1.0, 1.0, 1.0);
vec3 intensity = vec3(0., 0., 0.);
// vec3 ks = vec3(0., 0., 0.);
float phongExp = 128.0;

float kw;
vec3 cw = vec3(0.8, 0.6, 0.6);
vec3 cc = vec3(0.4, 0.4, 0.7);



void main() 
{  
    vec3 n = normalize(baseNormal.xyz);
    vec3 h = normalize(Half);
    vec3 l = normalize(lightDir);
    
    if (spot)
    {
        intensity = ka * Ia 
                     + baseColor * lightIntensity * max(0.0, dot(n, l))
                     + ks * lightIntensity * pow(max(0.0, dot(n, h)), phongExp);
    }
    else if (tone)
    {
        kw = (1. + dot(n, l)) / 2.;
        intensity = kw * cw + (1. - kw)*cc;
    }
    else
    {
        intensity = baseColor * lightIntensity * max(0.0, dot(n, l));
    }
    // Just use the base color; shading is the next assignment
    //gl_FragColor = vec4(baseColor, 1.0);
    //gl_FragColor = vec4(baseNormal, 1.0);
    //gl_FragColor = vec4(baseUV, 1.0, 1.0);
    gl_FragColor = vec4(intensity, 1.0);
}