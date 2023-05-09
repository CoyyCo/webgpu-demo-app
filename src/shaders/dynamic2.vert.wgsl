@vertex
fn main(@location(0) pos: vec2<f32>,@location(1) z:f32) -> @builtin(position) vec4<f32> {
    return vec4<f32>(pos, z, 1.0);
}