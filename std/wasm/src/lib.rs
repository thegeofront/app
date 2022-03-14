mod utils;

use wasm_bindgen::prelude::*;
use std::convert::TryInto;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// How to get js INTO rust 
#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

// How to get Rust INTO js 
#[wasm_bindgen]
pub fn greet() {
    alert("Hello, game-of-life!");
}

#[wasm_bindgen]
pub fn add(a: f32, b: f32) -> f32 {
    return a + b;
}

#[wasm_bindgen]
pub fn hello_world(a: f32, b: f32, c: f32, d: f32) -> f32 {
    return a + b * c + d;
}

#[wasm_bindgen]
pub fn subtract(a: f32, b: f32) -> f32 {
    return a - b;
}

#[wasm_bindgen]
pub fn get_list(a: f32, length: usize) -> Vec<f32> {
    let arr = vec![a; length];
    return arr;
}

#[wasm_bindgen]
pub fn get_something(a: f32, c: f32, b: f32) -> f32 {
    return a + b + c;
}

#[wasm_bindgen]
pub struct Matrix {
    width: usize,
    data: Vec<f32>
}

#[wasm_bindgen]
impl Matrix {

    // #[wasm_bindgen(constructor)]
    pub fn matrix(width: usize, height: usize) -> Matrix {
        let data = get_list(0.0, height * width);
        Matrix { width, data }
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        (self.data.len() / self.width)
    }

    pub fn size(&self) -> usize {
        self.data.len()
    }

    pub fn data(&self) -> *const f32 {
        self.data.as_ptr()
    }
}