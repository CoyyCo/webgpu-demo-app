struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>
}
@vertex
fn main(@location(0) xyz: vec3<f32>, @location(1) color: vec3<f32>) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4<f32>(xyz, 1.0);
    output.color = vec4<f32>(color, 1.0);
    return output;
}