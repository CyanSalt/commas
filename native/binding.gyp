{
  "targets": [{
    "target_name": "commas_native",
    "sources": [],
    "conditions": [
      ['OS=="mac"', {
        "sources": [
          "src/commas_native_mac.mm"
        ],
      }],
      ['OS=="linux"', {
        "sources": [
          "src/commas_native_linux.mm"
        ],
      }],
      ['OS=="win"', {
        "sources": [
          "src/commas_native_win.mm"
        ],
      }]
    ],
    "include_dirs": [
      "<!@(node -p \"require('node-addon-api').include\")"
    ],
    "dependencies": [
      "<!(node -p \"require('node-addon-api').gyp\")"
    ],
    "defines": [
      "NAPI_DISABLE_CPP_EXCEPTIONS"
    ],
    "xcode_settings": {
      "OTHER_CFLAGS": ["-std=c++17"]
    }
  }]
}
