@group(0) @binding(0) var<uniform> mvpMatrix:mat4x4<f32>;
struct outputVertex {
    @builtin(position) position: vec4<f32>,
    @location(0) fragPostion: vec4<f32>
}
@vertex
fn main(@location(0) position: vec4<f32>) -> outputVertex {
    var output:outputVertex;
    output.position = mvpMatrix * position;
    output.fragPostion = 0.5 * (position + vec4<f32>(1.0, 1.0, 1.0, 1.0));
    // output.fragPostion  = position;
    return output;
}