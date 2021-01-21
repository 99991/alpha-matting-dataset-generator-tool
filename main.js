var canvas = document.getElementById("myCanvas");
var gl = canvas.getContext("webgl");

var vertSrc = `precision highp float;

attribute vec2 apos;

void main(){
    gl_Position = vec4(apos, 0, 1);
}`;

var fragSrc = `precision highp float;

uniform float time;
uniform vec2 resolution;

const float TWO_PI = 6.283185307179586;

void main(){
    vec2 p = gl_FragCoord.xy;
    
    float scale = 0.01;
    float speed = 3.0;
    float steps_per_second = 4.0;
    float brightness = 1.0;
    
    float x = p.x*scale + (speed/13.0)*floor(steps_per_second*time);
    float y = p.y*scale + (speed/7.0)*floor(steps_per_second*time);
    
    //float gray = cos(TWO_PI * x) * 0.5 + 0.5;
    
    float gray = fract(x) > 0.5 != fract(y) > 0.5 ? brightness : 0.0;
    
    gl_FragColor = vec4(gray, gray, gray, 1);
}`;

function compileShaderSrc(src, shaderType){
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    console.log(gl.getShaderInfoLog(shader));
    return shader;
}

function makeShader(vertSrc, fragSrc){
    var vert = compileShaderSrc(vertSrc, gl.VERTEX_SHADER);
    var frag = compileShaderSrc(fragSrc, gl.FRAGMENT_SHADER);
    
    var program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);
    return program;
}

var program = makeShader(vertSrc, fragSrc);

var vertices = new Float32Array([
    -1, -1, 1, -1, 1, 1,
    -1, -1, 1, 1, -1, 1,
]);
var vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

var apos = gl.getAttribLocation(program, "apos");
gl.enableVertexAttribArray(apos);
gl.vertexAttribPointer(apos, 2, gl.FLOAT, false, 0, 0);

var uresolution = gl.getUniformLocation(program, "resolution");
var utime = gl.getUniformLocation(program, "time");

var time = 0.0;

function redraw(){
    if (canvas.width !== window.innerWidth || canvas.height !== canvas.innerHeight){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(utime, time);
    gl.uniform2f(uresolution, canvas.width, canvas.height);
    
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
    
    window.requestAnimationFrame(redraw);
    time += 1.0/60.0;
}

redraw();

function requestFullscreen(){
    if (canvas.requestFullScreen){
        canvas.requestFullScreen();
    }else if (canvas.webkitRequestFullScreen){
        canvas.webkitRequestFullScreen();
    }else if(canvas.mozRequestFullScreen){
        canvas.mozRequestFullScreen();
    }
}
