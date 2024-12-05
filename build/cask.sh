#!/bin/sh

cwd=$(dirname "$0")
echo "cask \"commas\" do
  arch arm: \"arm64\", intel: \"x64\"

  version \"$(node -e "console.log(require('${cwd}/../package.json').version)")\"
  sha256 arm:   \"$(shasum -a 256 "${cwd}/../release/Commas-darwin-arm64.zip" | cut -d' ' -f1)\",
         intel: \"$(shasum -a 256 "${cwd}/../release/Commas-darwin-x64.zip" | cut -d' ' -f1)\"

  url \"https://github.com/CyanSalt/commas/releases/download/v#{version}/Commas-darwin-#{arch}.zip\"
  name \"Commas\"
  homepage \"https://github.com/CyanSalt/commas\"

  app \"Commas-darwin-#{arch}/Commas.app\"
end" | pbcopy
