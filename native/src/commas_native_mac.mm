#include <napi.h>
#import <AppKit/AppKit.h>

void ShowFontPanel(const Napi::CallbackInfo &info) {
  NSFontManager *font_manager = [NSFontManager sharedFontManager];
  NSWindow *window = [[NSApplication sharedApplication] keyWindow];
  [font_manager orderFrontFontPanel:window];
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(
    Napi::String::New(env, "showFontPanel"), Napi::Function::New(env, ShowFontPanel)
  );

  return exports;
}

NODE_API_MODULE(commas_native, Init)
