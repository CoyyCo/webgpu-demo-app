struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>
}

@fragment
fn main(output:VertexOutput)->@location(0) vec4<f32>{
    return output.color;
}