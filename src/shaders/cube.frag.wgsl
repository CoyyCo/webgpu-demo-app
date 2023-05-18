@fragment
fn main(@location(0) fragPostion: vec4<f32>) -> @location(0) vec4<f32> {
    return fragPostion;
}   