# Changelog

## [0.38.0](https://github.com/CyanSalt/commas/compare/v0.37.0...v0.38.0) (2025-04-10)

### Features

* **ai:** refactor with openai api ([7e763ed](https://github.com/CyanSalt/commas/commit/7e763ed229de59497c2a2e0f0186a7783b346895))
* **ai:** streaming output ([1e3b5cd](https://github.com/CyanSalt/commas/commit/1e3b5cd2ae6064acde06b917bfed725ea34df1d4))
* **cli:** replace usage with fig arg spec ([5c8f32e](https://github.com/CyanSalt/commas/commit/5c8f32e47519114c7bd29848588a43a5bcfc694a))
* fig arg default ([bf0087c](https://github.com/CyanSalt/commas/commit/bf0087c7940dc9dd3b0ee514c7ae946ad3ed336a))
* fig arg suggestCurrentToken ([90d4506](https://github.com/CyanSalt/commas/commit/90d450658c787cbd55f979b895fac1f945af0d48))
* fig arg suggestions ([f05bcb9](https://github.com/CyanSalt/commas/commit/f05bcb9324babf4dffa11be08ba22ed0b0f53e0c))
* fig option isRepeatable ([279474f](https://github.com/CyanSalt/commas/commit/279474f985fd0d4b7d295592a2eec4141c59abdd))
* fig option persistent ([6b9118f](https://github.com/CyanSalt/commas/commit/6b9118f19d18604e08670a24d976946f11eb3ba6))
* fig spec completions ([6b987f6](https://github.com/CyanSalt/commas/commit/6b987f6c1a0e85b2ccfcb21255f2e251563e3ba1))
* support completion command collection ([9b6b78f](https://github.com/CyanSalt/commas/commit/9b6b78f8a50a87d0d2b6aea3e8609b6fb3ec19d7))
* support experimental settings ([c34bbeb](https://github.com/CyanSalt/commas/commit/c34bbeb0d55b434b1c861b6a40be1476caaaa37a))
* support experimental zsh capture completions ([555a705](https://github.com/CyanSalt/commas/commit/555a705145dca862bb1b75394dd3d1536fb9972b))
* support fig deprecated flag ([109ca46](https://github.com/CyanSalt/commas/commit/109ca46d61a76d096c11cf1337bd2ff6452ad90c))

### Bug Fixes

* completion type priority ([6a59e03](https://github.com/CyanSalt/commas/commit/6a59e03a6877f3e86bbcfaf6a15560ddbc0c435f))
* make pending completion second at most ([e7ac7b5](https://github.com/CyanSalt/commas/commit/e7ac7b52ce969ecd64305f0de7c5f065bbd14621))
* missing fig generated spec ([715c59d](https://github.com/CyanSalt/commas/commit/715c59d1a377a57d1740fd8adee2c9d7ded744a9))
* refine completion ui ([2a2878c](https://github.com/CyanSalt/commas/commit/2a2878cdedce3e7faa2f9e7b2826c4542c243efb))
* safe completion ([74e75f4](https://github.com/CyanSalt/commas/commit/74e75f4984aba19ddd3c20979446ca392e3bf186))
* skip key bindings when composing ([39fcc97](https://github.com/CyanSalt/commas/commit/39fcc97a5975abac18a994aaa90cf86685860f7e))
* tab key on direct completion ([6c9f20f](https://github.com/CyanSalt/commas/commit/6c9f20fce8866f43f97ab226cbd5b073f58bbe9d))
* typos ([ea2602e](https://github.com/CyanSalt/commas/commit/ea2602eb9eaf8e5571c918356ed99f42402e9a59))

## [0.37.0](https://github.com/CyanSalt/commas/compare/v0.36.0...v0.37.0) (2025-01-16)

### Features

* **ai:** add command completion ([2f58c3b](https://github.com/CyanSalt/commas/commit/2f58c3b0f5f9892e2ba89fdb0926c4c3ce8c298c))
* **ai:** refactor with coze ([fd9afcb](https://github.com/CyanSalt/commas/commit/fd9afcb41a36d470bda71cddc3bd2ffd5d966a2f))
* loading completions ([13e5065](https://github.com/CyanSalt/commas/commit/13e506522e8cc5967339c2bc085314efc5befbcd))

### Bug Fixes

* **addon-manager:** preserve order when toggling ([1e49f35](https://github.com/CyanSalt/commas/commit/1e49f35d2ba8dd2015eb2eae0152d582fcb101ac))
* ai anchor colors ([811327a](https://github.com/CyanSalt/commas/commit/811327af6610a0a2a9a6d586c80de335c70113f6))
* **ai:** auto enable ([26d052b](https://github.com/CyanSalt/commas/commit/26d052b73b97efaabccbd3e6b72e3929e6641acb))
* **ai:** auto enable after authorization ([de72678](https://github.com/CyanSalt/commas/commit/de7267808a4d586bab162a9bb353e8602c42b923))
* **ai:** cli error message ([04b0430](https://github.com/CyanSalt/commas/commit/04b0430ca11f10f994c0694c3822734395a7f5c7))
* **ai:** colorful ai icon ([c9ab88f](https://github.com/CyanSalt/commas/commit/c9ab88f478ecbe815987050dc8ba886b2b37ac1c))
* **ai:** compatible with invalid output ([45b4b58](https://github.com/CyanSalt/commas/commit/45b4b58f72882c4b0a193e90521f387008f7d8aa))
* **ai:** dependencies ([776aa2b](https://github.com/CyanSalt/commas/commit/776aa2b3ef980053f83dafefba1f5285e15f1fdb))
* **ai:** execute with args ([6e5a12c](https://github.com/CyanSalt/commas/commit/6e5a12c014f5f5d4ca3da54ec6699091c00962af))
* **ai:** reduce id generation ([90b581d](https://github.com/CyanSalt/commas/commit/90b581d2c5e243417cd12eb1b747c69e9b7af5da))
* **ai:** refresh token only after file loaded ([a1aaf47](https://github.com/CyanSalt/commas/commit/a1aaf47d2bd6dff547a1420806557a8fc08c3754))
* **ai:** skip fixing terminated command ([fdb18ef](https://github.com/CyanSalt/commas/commit/fdb18eff134dbe7ccb8c6226751a11ac7236625a))
* **ai:** token expires ([c8e215f](https://github.com/CyanSalt/commas/commit/c8e215f04867aff6b5f23138e4e8784968e0b0e7))
* **browser:** clean useless logics ([28b7cc8](https://github.com/CyanSalt/commas/commit/28b7cc88a5747ed761354771e1d93ae626314070))
* **browser:** find in pane view ([9406846](https://github.com/CyanSalt/commas/commit/9406846b4855b5a1b113b4930c1f36fda264c463))
* **camera:** end stream after closed ([4b96ade](https://github.com/CyanSalt/commas/commit/4b96ade78ea6da47931de0c969c33284326a3b2d))
* **camera:** remove text shadow ([21a1475](https://github.com/CyanSalt/commas/commit/21a14751f71b34c99ce6bb9affd0b1ce15984701))
* **cli:** manually exit ai prompt ([7b9e083](https://github.com/CyanSalt/commas/commit/7b9e08396f1c6f57b50972ac935ff828764c5d90))
* clipboard-ex issues ([df6cf10](https://github.com/CyanSalt/commas/commit/df6cf10596a8e62c9827b6e04799f9b5dcc26136))
* **cli:** terminal completions ([b1b89b3](https://github.com/CyanSalt/commas/commit/b1b89b3c88aa8afe9910279c16543ed398ea0a8d))
* completion when query is empty ([76cf09f](https://github.com/CyanSalt/commas/commit/76cf09fb62f272878908da51161f42294f298488))
* error code range ([ce5992b](https://github.com/CyanSalt/commas/commit/ce5992bde96e2493c5eae47d5f040f61a6bfee05))
* **explorer:** refine interaction between target xterm and explorer pane ([27ab25d](https://github.com/CyanSalt/commas/commit/27ab25d5479318b3133a358a900368c113fa6fea))
* filled icons ([73b36a4](https://github.com/CyanSalt/commas/commit/73b36a42a2ca77e741d87970623e1e27f6f9cfb1))
* flat completion style ([3695bda](https://github.com/CyanSalt/commas/commit/3695bda5734bb8330291b5b6fdef9bc20112f7ad))
* icon foreground color ([9a0f488](https://github.com/CyanSalt/commas/commit/9a0f488c62bb2220cf3c2d131c634b2c3d85a374))
* incomplete commands in history ([b0ace15](https://github.com/CyanSalt/commas/commit/b0ace15ec55dbf0d3ab4e97b0c30bd89f7a88d84))
* key binding args ([e905f6e](https://github.com/CyanSalt/commas/commit/e905f6e245f3eaba10b14066007ff0925509cc77))
* look up keyword ellipsis ([3c69d85](https://github.com/CyanSalt/commas/commit/3c69d85503998555956dc5d0bc7d34bd29fdab13))
* lucide icon ([874c244](https://github.com/CyanSalt/commas/commit/874c244747c31edcee20ecab972e8a6fe83b2bf3))
* optimize fuzzy searching for completions ([ff8b68f](https://github.com/CyanSalt/commas/commit/ff8b68fa769881e12b3533c04542ae5b6090a472))
* **paint:** use cdn assets ([99bb2c6](https://github.com/CyanSalt/commas/commit/99bb2c6e7b6ca26e799055747c0c98dca72a505b))
* **recorder:** share commas url scheme ([79ca59e](https://github.com/CyanSalt/commas/commit/79ca59e5b6e784f84fe9981524685e1e7569a088))
* remove editing accelerator ([89f515d](https://github.com/CyanSalt/commas/commit/89f515d4d78f4e2f7b1f48525c4d91ebbc2f1eb6))
* remove empty overridden list ([547bb74](https://github.com/CyanSalt/commas/commit/547bb742f409b6fd9ac10aee6629823e6fcf9fd5))
* **shell-integration:** preserve command record on replacement ([8b32084](https://github.com/CyanSalt/commas/commit/8b32084cc5051a8f60e9f1759217e70fc9eeb380))
* update completion api ([7004c86](https://github.com/CyanSalt/commas/commit/7004c86842626da9e6cf0a43088cfa58c68840c4))

## [0.36.0](https://github.com/CyanSalt/commas/compare/v0.35.0...v0.36.0) (2024-12-05)

### Features

* add more CLI commands ([6c89796](https://github.com/CyanSalt/commas/commit/6c89796a6ee9196abce61a3272a69a4c1a933a3c))
* **addon-manager:** add settings slot ([e9a75e6](https://github.com/CyanSalt/commas/commit/e9a75e65eac1c0a54c21485dd240078057589d91))
* builtin file icons ([2e599dd](https://github.com/CyanSalt/commas/commit/2e599dd5c9c11b70f7d73f1e316b6b8ec2c1664a))
* **camera:** add os info ([d595927](https://github.com/CyanSalt/commas/commit/d595927ed3d7c7276f24556b1ce93bd0f8c70ae2))
* **camera:** add recorder anchor ([de35664](https://github.com/CyanSalt/commas/commit/de356643033664e0b8ef4d77647387874a36f2b8))
* **camera:** add ttyrec opener ([0fba113](https://github.com/CyanSalt/commas/commit/0fba113f2bc3c66024f87dd8ad6fc5466695f1e3))
* **camera:** sharable tty ([900405e](https://github.com/CyanSalt/commas/commit/900405ee12c9714b048b940d0a17135bb8abd976))
* **cli:** add imgcat ([4c26883](https://github.com/CyanSalt/commas/commit/4c268834114cb4797a514b3e3ff3b9c46fcbd436))
* colorful tab icon ([b59805e](https://github.com/CyanSalt/commas/commit/b59805e305d2b0249ad3e691104a0ef056eb2ef6))
* **editor:** support dragging files ([a395216](https://github.com/CyanSalt/commas/commit/a39521689f9518fc14046905e9258b14a8b1b5f0))
* **explorer:** file actions ([6fb99e8](https://github.com/CyanSalt/commas/commit/6fb99e84e78231695103577b766751a01a9deeac))
* **explorer:** interactive connection ([fdea578](https://github.com/CyanSalt/commas/commit/fdea578a284db98e32cd4d09aa7f685c02e84439))
* file icon from addons ([8f8aee0](https://github.com/CyanSalt/commas/commit/8f8aee00e0e61b53cc81c28e551993c41c947b3f))
* make webgl be default renderer ([30b6bbb](https://github.com/CyanSalt/commas/commit/30b6bbbb9516db3925f305b2e7f47f0454bf2fbd))
* open file with quick look on macos ([3116dbb](https://github.com/CyanSalt/commas/commit/3116dbb9fafe9ca880acf0703376d75276244dbe))
* **paint:** initialize ([4f8293e](https://github.com/CyanSalt/commas/commit/4f8293eaa2d884d206ac84e77f28c407a47d8761))
* **recorder:** add ttyrec controls ([975fe3c](https://github.com/CyanSalt/commas/commit/975fe3c5d38b0cd1e6087f0e7c605d10ab6a5840))
* rename file from tab item ([45f1232](https://github.com/CyanSalt/commas/commit/45f12321d2290c835ce8fffc1d5fc7d796e683b1))
* **settings:** add font selector ([a477cd7](https://github.com/CyanSalt/commas/commit/a477cd7b4a6ce7f38d6b020be6c7a56b5efd6b39))
* style on window blur ([6576710](https://github.com/CyanSalt/commas/commit/6576710597d64bdc746bdd90f54f9144104fb88a))
* support custom shells for addons ([89248d0](https://github.com/CyanSalt/commas/commit/89248d0ee51f0ac5bb41c6f05f6c85d6f95047a3))
* support dragging directories ([f0761ba](https://github.com/CyanSalt/commas/commit/f0761baf18a993fa9d5f287820c68c60241f77a2))
* support terminal.style.accentColor ([9a36808](https://github.com/CyanSalt/commas/commit/9a36808b1ebf6d2586805b4877aff6329cadf8c2))
* **sync:** add settings slot ([86fd1ad](https://github.com/CyanSalt/commas/commit/86fd1add5348512a1ec31b51f9c28a5d6d0aea80))
* **theme:** add settings slot ([f9a70d1](https://github.com/CyanSalt/commas/commit/f9a70d1b12e42f5d03b3a3e0a4397a7f2c41e1f8))

### Bug Fixes

* add `terminal.external.extraLinkModifier` ([7cd58c1](https://github.com/CyanSalt/commas/commit/7cd58c1c6776650d518d7ffb27775bd7aecad5e1))
* add file if available ([ef9ca3a](https://github.com/CyanSalt/commas/commit/ef9ca3a3e247c2a6477d29ff0243fe15e3020ac8))
* **addon-manager:** order ([8a4f2b4](https://github.com/CyanSalt/commas/commit/8a4f2b4dae3fa5b247f5869f96143e3edf13619a))
* async transition functions ([ef569c9](https://github.com/CyanSalt/commas/commit/ef569c983923f2b9fbaa233d5041c54674f523e0))
* better external link logics ([10857b1](https://github.com/CyanSalt/commas/commit/10857b11f8d2ff2bab581e4acd5c8c752e7f16c8))
* **browser:** add loading state ([2af4fd3](https://github.com/CyanSalt/commas/commit/2af4fd3e6494059e423893426eb7d7387e0b2a34))
* **browser:** open from keybindings ([dc0c57b](https://github.com/CyanSalt/commas/commit/dc0c57bf01c761c3d8a725ec3282cf0e7ec888fd))
* **browser:** url interaction ([de2d1d1](https://github.com/CyanSalt/commas/commit/de2d1d1c5f0f667755b2ad7eeeae557aaf197394))
* **camera:** open file after recording ([2306868](https://github.com/CyanSalt/commas/commit/23068684da23109fd88b47711e7b9d3f6ccd7c9c))
* **camera:** screenshot corner radius ([a3809e1](https://github.com/CyanSalt/commas/commit/a3809e1b24c00ef08707f7e755e946e8eb9fc77c))
* check file before addFile ([8d9e703](https://github.com/CyanSalt/commas/commit/8d9e703c2a61539b96e588757d966b79770bd84c))
* clearer selection ([786ec22](https://github.com/CyanSalt/commas/commit/786ec223acd1061bbe354618d00e1a76b8d3bec8))
* **cli:** remove eval command ([0aba1f7](https://github.com/CyanSalt/commas/commit/0aba1f7b9283bad43df33c677b051d0bbc5446bb))
* command marker layer ([129f7f8](https://github.com/CyanSalt/commas/commit/129f7f88146c239139739dc83921600e4f330b7d))
* context as window args ([5f505f9](https://github.com/CyanSalt/commas/commit/5f505f9aac74dd23cf08d1434295fcf683952abd))
* css file ([2eed84d](https://github.com/CyanSalt/commas/commit/2eed84d5e8278103b8e7837f8f929079cc237716))
* default isLightTheme ([a1992dc](https://github.com/CyanSalt/commas/commit/a1992dcf21e30a3e9b7a337dd6718b9298df950a))
* drop indicator style ([9b8461b](https://github.com/CyanSalt/commas/commit/9b8461b26476088f61fa70f415aa38ad9b9d1438))
* **editor:** default file path ([69ac946](https://github.com/CyanSalt/commas/commit/69ac9466e8a98ac1b3bdbfc22dfebd619ce9fa6f))
* **editor:** keybinding and style ([379efed](https://github.com/CyanSalt/commas/commit/379efedd39ff547daf4d8476fdf0c6d56b668c6d))
* **editor:** non-existing file alerting ([cc1a281](https://github.com/CyanSalt/commas/commit/cc1a2816ec512e7d7043eb1f9965f1d894768184))
* **editor:** reduce reactivity ([be0dd77](https://github.com/CyanSalt/commas/commit/be0dd7794097f076956164f944ed4a09cb938138))
* **editor:** save non-existing files ([23a84ff](https://github.com/CyanSalt/commas/commit/23a84ffc1c0e5ab8cc8c0172005a1e46d052c003))
* **explorer:** clear ui ([7227629](https://github.com/CyanSalt/commas/commit/722762909f33aea0dcd8f294ffcb7f39d5a65cf8))
* **explorer:** focusable entities ([5ce44e5](https://github.com/CyanSalt/commas/commit/5ce44e5657f59d6a050762f6bd09c2e40bdfdfc0))
* **explorer:** restart when changing directory ([69c62cd](https://github.com/CyanSalt/commas/commit/69c62cda3f82cd08c02d3291240878d5cd5b4be1))
* **explorer:** split when calling from cli ([f5ccbf1](https://github.com/CyanSalt/commas/commit/f5ccbf1501a09772b2d59d534e105f2dee20ea7e))
* **explorer:** support `terminal.external.explorer` ([f1cda8a](https://github.com/CyanSalt/commas/commit/f1cda8a3ce65ad4372b9b86578f6e9be172a4e88))
* **explorer:** symlink error ([a63a149](https://github.com/CyanSalt/commas/commit/a63a149ebadd9e3a8b4b388e4a503635ee5e3b87))
* **explorer:** toggle dotfiles with context menu ([b2ab498](https://github.com/CyanSalt/commas/commit/b2ab498c5c0e3a7e25bbf5aa96f1694088055d66))
* external link modifier for local files ([a2abecc](https://github.com/CyanSalt/commas/commit/a2abecc54d6aa25e288d60f43277953292f49525))
* focus styles ([9068bfc](https://github.com/CyanSalt/commas/commit/9068bfcf37852e6508fac189fd4f2ff45c31135e))
* focusable switch control ([c554b12](https://github.com/CyanSalt/commas/commit/c554b12b979dd21723a93d7ab2d568427139cb6f))
* force focus after xterm open ([03e3095](https://github.com/CyanSalt/commas/commit/03e30952a3ae6860eb46d59e040097332e528122))
* icon colors ([b641b2a](https://github.com/CyanSalt/commas/commit/b641b2a4c60855f5d47cd75905832801a25698c8))
* icon prefix ([d466152](https://github.com/CyanSalt/commas/commit/d46615295abe5450deeff15cebd7be4329bc178e))
* icon style ([c213fb6](https://github.com/CyanSalt/commas/commit/c213fb6d190a046dbcd721b973e79bab86f9e6d8))
* idle state and shell icons ([5d321b0](https://github.com/CyanSalt/commas/commit/5d321b0dd955c772eb37d05cdb5fac9a9c54a992))
* iterm2 badge style ([c8de751](https://github.com/CyanSalt/commas/commit/c8de751aee75a4f97bab4bca2830a2a6b449b700))
* json named exports ([0b80f79](https://github.com/CyanSalt/commas/commit/0b80f79dd9a4cc2882a7d2dd305fa8bfc0a44516))
* **launcher:** hide launching for pane launchers ([b687576](https://github.com/CyanSalt/commas/commit/b6875760438a7a6a10dbb3bc27fe3dc9023963c0))
* lint errors ([7fce19e](https://github.com/CyanSalt/commas/commit/7fce19ee2e85991763b195e395258e0ec00f72d1))
* make createTabPane async ([9b02ce1](https://github.com/CyanSalt/commas/commit/9b02ce11ebc23de07dfb91f57579fd028f40c73f))
* menu item event in args ([688068a](https://github.com/CyanSalt/commas/commit/688068ae8efa5f357066c62131a57d7e3b6ef64d))
* mix space ([b205435](https://github.com/CyanSalt/commas/commit/b2054351194370790745fbdfd1a42d83a1582286))
* more readonly addons ([83fbec1](https://github.com/CyanSalt/commas/commit/83fbec187521afa25b7a035eead5e9c1fa07e5a0))
* opener algo ([dd93032](https://github.com/CyanSalt/commas/commit/dd930323f4cab81d631d7443486ebce87fc5f829))
* **paint:** clean ui ([d259549](https://github.com/CyanSalt/commas/commit/d259549eb694ddc45600c37e976bac9a35f6ece0))
* **paint:** disable builtin context menu ([dbfc886](https://github.com/CyanSalt/commas/commit/dbfc88639c414c47e2a18d0301bda61f34d89418))
* **paint:** excalidraw local assets ([e83673d](https://github.com/CyanSalt/commas/commit/e83673d169314ad846b0edcd37048df0fc848dee))
* **paint:** file system interaction ([9016976](https://github.com/CyanSalt/commas/commit/9016976aa0d3b05f3871eba2b78e17154043e568))
* **paint:** icons for png boards ([14014f4](https://github.com/CyanSalt/commas/commit/14014f4b4ad7203fe91f9d133433eb677ecaf70a))
* **paint:** support saving to clipboard ([da9b2d2](https://github.com/CyanSalt/commas/commit/da9b2d2497d80d26f89c9c4806ad87db8070d5d7))
* **paint:** use remote lang instead of navigator.language since [@use](https://github.com/use) ([54fba81](https://github.com/CyanSalt/commas/commit/54fba817f52f0608518a4c1fcdecdae890dd1a95))
* **preference:** focusable pane ([19e730c](https://github.com/CyanSalt/commas/commit/19e730cbd0cbebced303dfc7533719009197ba11))
* **recorder:** graceful empty recorder ([9b7e644](https://github.com/CyanSalt/commas/commit/9b7e644721c4d1907c7b0d97efcdd024fa29a67a))
* refine group style ([d0a5e64](https://github.com/CyanSalt/commas/commit/d0a5e64b9ef073c5d61ecda160267c58062c4610))
* refine icon style ([e4b48d7](https://github.com/CyanSalt/commas/commit/e4b48d7c17703296354b6fb2f96da73e0bdb1edf))
* reset tab list by double click ([69b1bee](https://github.com/CyanSalt/commas/commit/69b1beeb27048191ccc67bdd89e0667771545ed8))
* revert electron to fix context menu ([c2cbf11](https://github.com/CyanSalt/commas/commit/c2cbf11f94188a43b82ca8534c1f23d6b6f7c3cb))
* sass deprecations ([626ff10](https://github.com/CyanSalt/commas/commit/626ff10a899a3aeca78ecd7dd5701c8c412c021e))
* **settings:** accept command as id ([bcace19](https://github.com/CyanSalt/commas/commit/bcace197274acb783edeb698c9f15c09d88f9bb8))
* **settings:** color picker ([0e5ee88](https://github.com/CyanSalt/commas/commit/0e5ee887dec7975cbee4b5d44543e6d0d15b91f8))
* **settings:** line gap ([3c56703](https://github.com/CyanSalt/commas/commit/3c56703f68b7901a8f99b3516e0b4fab806dc500))
* skip notification for empty file list ([f8bc8db](https://github.com/CyanSalt/commas/commit/f8bc8db9b33fc15912cab1cd88f8bcc8086cc2b9))
* term focus visible ([942c628](https://github.com/CyanSalt/commas/commit/942c628942f17c61987a66deeb69e2fde80b6a78))
* **theme:** add settings link ([f430d4f](https://github.com/CyanSalt/commas/commit/f430d4fcb02e13e7ad79a070be0b7c83bd2ac94b))
* **theme:** focusable theme card ([259ed90](https://github.com/CyanSalt/commas/commit/259ed90e4fdb2ebae0c9d1c05b2b422805e76541))
* try to catch autoUpdater errors ([660bcf7](https://github.com/CyanSalt/commas/commit/660bcf7a7f584f8e508c539ab9d5607d98be6912))
* ui transition ([9c68f5f](https://github.com/CyanSalt/commas/commit/9c68f5f6c7d463db24ff66ef27cc276ef25c6050))
* unused filename incrementer ([a4895b7](https://github.com/CyanSalt/commas/commit/a4895b7967eff05227aab50d486cb3eb30523975))
* update preference icon ([ef2ff55](https://github.com/CyanSalt/commas/commit/ef2ff551b2abeb73f31f0d36de23cfde9420a038))
* weaken idle light ([86a2b86](https://github.com/CyanSalt/commas/commit/86a2b86ca613021f929985fe73b7344fc151a77a))

## [0.35.0](https://github.com/CyanSalt/commas/compare/v0.34.0...v0.35.0) (2024-10-16)

### Features

* a11y for find box ([26b8445](https://github.com/CyanSalt/commas/commit/26b844559dc0057cc7b50dab0809193edccf04e9))
* add camera addon ([c74721f](https://github.com/CyanSalt/commas/commit/c74721f74e4abc6e65dca1f664d3767b9d5aff4d))
* add icons for addons ([4c11727](https://github.com/CyanSalt/commas/commit/4c11727b89f4db32f2292448621d49041031b1c9))
* add remote methods for renderer api ([553e49f](https://github.com/CyanSalt/commas/commit/553e49f33327e00f3ab4669aadc173def5828731))
* add view transitions ([011a7c4](https://github.com/CyanSalt/commas/commit/011a7c44d48d3b638f292e3bc613c5e3f9aed46c))
* add WebContents and overridable open-url ([c1ff607](https://github.com/CyanSalt/commas/commit/c1ff607cc76ade64af53fd7a0dc784f15746163c))
* **addon-manager:** default builtin state ([4a1ee03](https://github.com/CyanSalt/commas/commit/4a1ee0354db235172ed2b3c86a79643c8ea985ae))
* auto enable future addons ([f732338](https://github.com/CyanSalt/commas/commit/f732338fc48693abd095d49d5731e6b473a95285))
* **browser:** add browser addon ([3638855](https://github.com/CyanSalt/commas/commit/3638855fff7a1562bd8e2649ca2cb64ffb2e7442))
* **browser:** add keybindings ([d5f1c8b](https://github.com/CyanSalt/commas/commit/d5f1c8be6afc525102e3483fa12fcc7ab29cda58))
* **browser:** add omitbox ([6479753](https://github.com/CyanSalt/commas/commit/64797538c51940d35b4f9257462e55b4697815db))
* **explorer:** add breadcrumbs ([b3a0f47](https://github.com/CyanSalt/commas/commit/b3a0f47577dbce3c5258384e103a8371b25a8d49))
* **explorer:** add explorer addon ([5d1d09d](https://github.com/CyanSalt/commas/commit/5d1d09d55e30bfa68c7aee7bb5888e61a080fdbc))
* **explorer:** add keyboard shortcut ([e28a356](https://github.com/CyanSalt/commas/commit/e28a3564e26e992054f1ac59d53e3678057d3199))
* **explorer:** customizable directory ([ff8d748](https://github.com/CyanSalt/commas/commit/ff8d7480add2219f9ea8c0f69b8aa300fdbaf243))
* **explorer:** update icon color ([6210f73](https://github.com/CyanSalt/commas/commit/6210f73c2bbec1d161d59b221b0d24e911ce6b31))
* **git:** move to title ([72acf65](https://github.com/CyanSalt/commas/commit/72acf652325bf3d0359888527dabc7c8ce64513a))
* pass url params ([c950c91](https://github.com/CyanSalt/commas/commit/c950c919225afc4f276fdff3370eb4bb721dcaf5))
* **preference:** refine ui ([51f0cd9](https://github.com/CyanSalt/commas/commit/51f0cd9d79d77888a8e4a7b7061e1d3f77fb388c))
* refine button style ([da8da9f](https://github.com/CyanSalt/commas/commit/da8da9fa9aaab6a3dcd68486582d477e1a957b15))
* refine tab item opacity ([a0f5bf5](https://github.com/CyanSalt/commas/commit/a0f5bf5a9f54942b089d3351ea2388b63b8bc179))
* simplify pane definitions ([481c62c](https://github.com/CyanSalt/commas/commit/481c62c7873ade1ceb5f6d222c20d3f3462172c0))
* support directory pane ([ac410b0](https://github.com/CyanSalt/commas/commit/ac410b0dbfe4a9de05b367e1dda522d9718d8239))
* tab list transition ([e032cbe](https://github.com/CyanSalt/commas/commit/e032cbeeddeb6b4237430d56acd258e5d0ae59d5))
* terminal url opener ([fff04dd](https://github.com/CyanSalt/commas/commit/fff04dd3e83a3f37ca73791a752867e331f5ca7f))
* update external icon ([182b95f](https://github.com/CyanSalt/commas/commit/182b95f1354b5278645a3c985376a50c5b96ab5f))
* update system colors ([e8614c2](https://github.com/CyanSalt/commas/commit/e8614c226fb980a79a1d040ee78e6a1cfb183aff))
* web icon for browser ([ae2a77b](https://github.com/CyanSalt/commas/commit/ae2a77b46fd96a0d7da9035ad3560a31e59f7b1a))

### Bug Fixes

* a11y for title customization ([9953c2c](https://github.com/CyanSalt/commas/commit/9953c2ce5aff368828275491a15d2eff0db27d83))
* add border radius to web contents ([2405683](https://github.com/CyanSalt/commas/commit/2405683beb44b9b6dfc162ffdc0d6ec612fc3bef))
* **browser:** compact ui ([095bb05](https://github.com/CyanSalt/commas/commit/095bb052a164aef6b2ab40d384f7d6042b32d683))
* **camera:** watermark text font ([2d330d0](https://github.com/CyanSalt/commas/commit/2d330d02700dbccdf6402e19edfa63f309cffc44))
* clear completion while output starting ([44d32a7](https://github.com/CyanSalt/commas/commit/44d32a7e3cec55a7a3fb23318989ef895d026ed2))
* **clippy:** use jsdelivr by default ([98e162f](https://github.com/CyanSalt/commas/commit/98e162f2b2d95f029515b9612ed87bc99c8a304e))
* drop file on terminal ([cfb18bb](https://github.com/CyanSalt/commas/commit/cfb18bb396a2ba6749c217a38a18a0ad4f68354d))
* electron version script ([c55ff0d](https://github.com/CyanSalt/commas/commit/c55ff0da19efba2147fb6b18f51fe8e601e22e71))
* **explorer:** interact with launcher ([6c22c1b](https://github.com/CyanSalt/commas/commit/6c22c1beefc37a69d727700b89c2abd8ec3e948a))
* **explorer:** send to terminal with panes ([99e210c](https://github.com/CyanSalt/commas/commit/99e210c45ecec938adc6e619ecae214c62dc7af4))
* **explorer:** support home sign ([5312f50](https://github.com/CyanSalt/commas/commit/5312f50e28dc101291884893f5f5234c7f3f5b68))
* faster transition ([bff3fa8](https://github.com/CyanSalt/commas/commit/bff3fa8e9df1e65f35a4e16d0f9f6d7efd49488a))
* **git:** simplify ui ([fa9dfe7](https://github.com/CyanSalt/commas/commit/fa9dfe7b1ffe544a072effec41cb939c48c42afa))
* highlight new tab button when hover ([e994ded](https://github.com/CyanSalt/commas/commit/e994ded4fe468ead21c0e331f2b20f7743804e69))
* keyboard args ([8c641fe](https://github.com/CyanSalt/commas/commit/8c641fe28dbfcc7ee41f33238ed590117af1e68c))
* **launcher:** default profile ([a247e8d](https://github.com/CyanSalt/commas/commit/a247e8d652a0738b1d84ea3e5b7c2f56005abb6d))
* layout overflow ([6d63e57](https://github.com/CyanSalt/commas/commit/6d63e572b017b729e0924054b2a0f48d77e7e814))
* optimize folder icons ([f1c6d79](https://github.com/CyanSalt/commas/commit/f1c6d79dba013d097c519983de127f7bc440dfce))
* pane factory ([9f844fe](https://github.com/CyanSalt/commas/commit/9f844fe4cb8cd0d096d3f93781625de1a92b2a3d))
* recognize directory symlinks ([c078fcc](https://github.com/CyanSalt/commas/commit/c078fccc0099ed13ad10ed3ebc41c37d44c881b5))
* remove detached and optimize title display ([dc6e7dc](https://github.com/CyanSalt/commas/commit/dc6e7dcfa5ba98012a081fb159b9faad2e5c5380))
* repeating event listener ([999fe4c](https://github.com/CyanSalt/commas/commit/999fe4c988eba7a12aa3e65260256fe9f875bee6))
* tab list at bottom ([7e58573](https://github.com/CyanSalt/commas/commit/7e58573db2cd5fd03f595bd467273e5447ff0a52))
* title bar overlay on linux ([95358fc](https://github.com/CyanSalt/commas/commit/95358fca11c12dde47f51a01a57b18825bcb98ed))
* translation for platform ([073f4ef](https://github.com/CyanSalt/commas/commit/073f4ef786b3db099693fb413153925e5c8a4ed8))

## [0.34.0](https://github.com/CyanSalt/commas/compare/v0.33.1...v0.34.0) (2024-09-11)


### Features

* auto select custom title ([302f98a](https://github.com/CyanSalt/commas/commit/302f98a36107b0a5252704b595695a4d5093c766))
* **cli:** add user command ([dee662d](https://github.com/CyanSalt/commas/commit/dee662d1eaf7ec8b8535256fb7a5e41ca3588c4c))
* **launcher:** add key modifier ([2c7b69f](https://github.com/CyanSalt/commas/commit/2c7b69f2063d67646fe943544cec813150461c90))
* **launcher:** drag to favorate when horizontal ([458cdb5](https://github.com/CyanSalt/commas/commit/458cdb55391b8ebf4a5bc87254a1a81bcbee9dcc))
* **settings:** add reset to all changed items ([1ee639a](https://github.com/CyanSalt/commas/commit/1ee639aa6c5861cf056ac35e875d9f3392f4bceb))
* **settings:** recoverable ([e1c0710](https://github.com/CyanSalt/commas/commit/e1c07102f07979775953ac26199c865921a9d0f1))
* **shell-integration:** pnpm quick fix actions ([55c2c82](https://github.com/CyanSalt/commas/commit/55c2c82073006205990a146c8b3cdc91ca58b652))
* tab list button on top ([3bb4b2f](https://github.com/CyanSalt/commas/commit/3bb4b2f206cd46835852ad069a6b6ff48287ae41))
* update icons ([5261d11](https://github.com/CyanSalt/commas/commit/5261d117a50367fc6e5d2025d54d36c6a1854aa9))


### Bug Fixes

* **addon:** lifo ([a76f164](https://github.com/CyanSalt/commas/commit/a76f1645d5c266f3c67d336530c41d543e7e31e4))
* aliases as completions ([22e244e](https://github.com/CyanSalt/commas/commit/22e244e8c7eb260bbb12b0a1377bdcf2ceaf8a53))
* **cli:** cfonts spacing ([f39599e](https://github.com/CyanSalt/commas/commit/f39599e1ccbaa56ea189ef7f2170e5a612eea134))
* **completion:** clear completion on processing ([216c5c2](https://github.com/CyanSalt/commas/commit/216c5c2113c3063e18a6bd7460a403816f7b0c88))
* control style ([a482911](https://github.com/CyanSalt/commas/commit/a48291181d4a305389c67f5df75db9c9da9a1495))
* **editor:** sticky widget style ([4fa0ebf](https://github.com/CyanSalt/commas/commit/4fa0ebf38f07abc17a1fcb4bab5d9209073609e7))
* error highlighting ([08d8b7e](https://github.com/CyanSalt/commas/commit/08d8b7e1d116a63ee3b315b39d453e10c019155e))
* group style ([3b64bf4](https://github.com/CyanSalt/commas/commit/3b64bf42d59d94a6ec1549b5bb236012761cb657))
* **launcher:** remove pane logics ([3418fa5](https://github.com/CyanSalt/commas/commit/3418fa5833de864fd4503ce3ff76af428dbc8871))
* **launcher:** respect script profile ([b708b80](https://github.com/CyanSalt/commas/commit/b708b80119204fb31d8533024fb5e77ccdffe6db))
* lint errors ([868d533](https://github.com/CyanSalt/commas/commit/868d5338c7cbb589e5b40c9c8584577f56f5dbe5))
* pnpm workspace packages ([c5d65a3](https://github.com/CyanSalt/commas/commit/c5d65a36f1f81a67143732cbc75f71ded47ccd89))
* pnpm workspaces ([f0b895d](https://github.com/CyanSalt/commas/commit/f0b895da794d72528c6bbaceb05458a0d71e2094))
* reduce renderer events ([b51f243](https://github.com/CyanSalt/commas/commit/b51f243a58b55cffb4aa634d1bb7f25b6eb98164))
* **settings:** hide value if not customized ([06536a8](https://github.com/CyanSalt/commas/commit/06536a8dcc5f4627d1a79811489e0b941a5a3009))
* tab item context menu key bindings ([57ced5a](https://github.com/CyanSalt/commas/commit/57ced5a75a4b1580605e8b91db4f2f84bc498cae))
* tab item interaction ([b29b101](https://github.com/CyanSalt/commas/commit/b29b101872565dcf19892fc325ef563edaa8a9ca))
* **theme:** add shadow ([f0c163a](https://github.com/CyanSalt/commas/commit/f0c163ad5d28b22b9adadcf6c58656ee40e6fdf0))
* **theme:** refine user interaction ([42bc4aa](https://github.com/CyanSalt/commas/commit/42bc4aa3087d1f9210a1cc39bce0edd930f1a514))
* top tab list ([9bd9d37](https://github.com/CyanSalt/commas/commit/9bd9d37419d06a69271429a848c09f6cf02d89a9))
* **updater:** check only when writable ([629de87](https://github.com/CyanSalt/commas/commit/629de8709e36523c9ac1ffa1b4c79c49aacd33fd))
* vibrancy with theme ([f86a6ea](https://github.com/CyanSalt/commas/commit/f86a6ea9f2a66336310a7abecbfde6a516be503a))

## [0.33.1](https://github.com/CyanSalt/commas/compare/v0.33.0...v0.33.1) (2024-07-12)


### Bug Fixes

* remove backdrop-filter to avoid bugs ([4a8525a](https://github.com/CyanSalt/commas/commit/4a8525a799fa931058fc26873449bec9e5e0734a))
* **sync:** refine icons ([39f62ae](https://github.com/CyanSalt/commas/commit/39f62ae0a3170af070222bddbfcd9e0b68d75e0c))

## [0.33.0](https://github.com/CyanSalt/commas/compare/v0.32.1...v0.33.0) (2024-07-12)


### Features

* **ai:** switch for doctor ([5e4a156](https://github.com/CyanSalt/commas/commit/5e4a15615decc169710e210089f556c52aaeff54))
* alt navigation by default ([54c8f64](https://github.com/CyanSalt/commas/commit/54c8f6436b40367efdb0e49b2e0754042a42c54b))
* bouncy tab items ([33f977c](https://github.com/CyanSalt/commas/commit/33f977cc8d322c26cdc2c2acd5bf5900ebf6e4b5))
* launcher folder as drop target ([82c67b1](https://github.com/CyanSalt/commas/commit/82c67b128ca3aa9fc5648a883c10933fbdb63799))
* **launcher:** pane as launcher ([083b782](https://github.com/CyanSalt/commas/commit/083b782e1430e3c066d5151f2983eecb9cf577be))
* modern ui ([cff8970](https://github.com/CyanSalt/commas/commit/cff89706b9cf776439a8cb064880cf5e91e0d143))
* refine tab list entry ([4aac850](https://github.com/CyanSalt/commas/commit/4aac8508cf39705cda509f630291c9ca807b0de0))
* tab list context menu ([741c8dc](https://github.com/CyanSalt/commas/commit/741c8dc2732d5bf242b0a2b11c6c7847c3e27d28))
* third party quick fix icon ([cb48613](https://github.com/CyanSalt/commas/commit/cb48613e0dc8b31f815707ea6f12ec9eb8680bb5))


### Bug Fixes

* **ai:** refine prompts ([5116335](https://github.com/CyanSalt/commas/commit/5116335f7b2789bc6d92f0f424aa1e280fb9d976))
* **ai:** remove native events ([d9bcd9d](https://github.com/CyanSalt/commas/commit/d9bcd9d2e872612d48ae2ae05b083ba08dfa95f0))
* **ai:** skip invalid completions ([b8b08ee](https://github.com/CyanSalt/commas/commit/b8b08ee28a6be7b189cbdf579adc9589dde6e3f7))
* avoid triggering completion in vim ([49d1a32](https://github.com/CyanSalt/commas/commit/49d1a32659a36b375c00fdb31e1063dbaeb2a20d))
* drop indicator style ([51e36f9](https://github.com/CyanSalt/commas/commit/51e36f9527916b89eb5e3ee710b471e8bf934dd2))
* enable nav sash ([7527bf4](https://github.com/CyanSalt/commas/commit/7527bf4f55b810492f9ecdab87baa3d7ae56fa5e))
* hide tab list icon in touch bar if useless ([f2dfdb1](https://github.com/CyanSalt/commas/commit/f2dfdb1bc20b56b26798eac7b9a64489e79ece12))
* home ident ([eb75c41](https://github.com/CyanSalt/commas/commit/eb75c41343c224830128a1e01bc5a6a8216f3436))
* input and idle light style ([dbd620d](https://github.com/CyanSalt/commas/commit/dbd620d512610450a8f428015bdc3bb9c1f214bc))
* **launcher:** disallow dragging pane as launcher ([4c0dd35](https://github.com/CyanSalt/commas/commit/4c0dd357b51c2baa7e0fe05369edf9111e19a43f))
* **launcher:** icon style ([842052c](https://github.com/CyanSalt/commas/commit/842052cf7fcf7a7f8240d348da19450d91ea458c))
* npm completions ([384ad3e](https://github.com/CyanSalt/commas/commit/384ad3e686c93c0c1c87ce721204830eb25a23ed))
* **proxy:** recommend to use fnm ([7fee81b](https://github.com/CyanSalt/commas/commit/7fee81b0abc27373f5d384b9d6d1a0192ee16b6f))
* **proxy:** right click to open context menu ([1914d03](https://github.com/CyanSalt/commas/commit/1914d03110e84f6627a051d17de299af96bcee2e))
* refine context menu api ([e0726f4](https://github.com/CyanSalt/commas/commit/e0726f4da7fa75c1c678ea001c04ca64294f9a38))
* simplify active background color ([ae76b53](https://github.com/CyanSalt/commas/commit/ae76b533377e05b2b2e98e6810e7a22414409f6b))
* spacing for completions ([1ae6b67](https://github.com/CyanSalt/commas/commit/1ae6b679aa03d85884fe0c4ac4675fcc8b7a3a74))
* support app.on ([b8a0d6c](https://github.com/CyanSalt/commas/commit/b8a0d6c33182355f655b6797ebb9264565008c57))
* theme colors ([67e7005](https://github.com/CyanSalt/commas/commit/67e70051f8e96885e39ac0642da620790c05bd85))
* thin scroll bar ([148c8dd](https://github.com/CyanSalt/commas/commit/148c8dd546638d588819ebea42ec888caf8c4c1e))
* translucent sticky term ([fc38aba](https://github.com/CyanSalt/commas/commit/fc38aba5e194f9e7c41b9d937055fad01cb6bc84))
* vibrancy setting comment ([a6551b8](https://github.com/CyanSalt/commas/commit/a6551b8ba20bb3eb2a6987c7d127d24bb7887712))
* vibrancy without opacity ([8a3598f](https://github.com/CyanSalt/commas/commit/8a3598f0b427283ddb7ee7f9d25fad2267b15f83))

## [0.32.1](https://github.com/CyanSalt/commas/compare/v0.32.0...v0.32.1) (2024-05-23)


### Features

* **ai:** use user defined api key ([affbdf2](https://github.com/CyanSalt/commas/commit/affbdf2f33a3db0a1232d9f160254f7a09730f66))
* **cli:** support `commas open` ([c8049aa](https://github.com/CyanSalt/commas/commit/c8049aa34be6006abb742d9ad32a6791c8f89ad3))


### Bug Fixes

* **preference:** open from menu ([a1867c1](https://github.com/CyanSalt/commas/commit/a1867c18a9de9cba52877d4243e889c8b846d4ca))

## [0.32.0](https://github.com/CyanSalt/commas/compare/v0.31.0...v0.32.0) (2024-05-23)


### Features

* add ai command ([b8ec7ee](https://github.com/CyanSalt/commas/commit/b8ec7eeb70889144ef2888097934ad87ec9e9499))
* auto scroll ([ce85836](https://github.com/CyanSalt/commas/commit/ce8583609a1afcbd8a865b82268e6f2888602615))
* better dnd for tab items ([b534b7d](https://github.com/CyanSalt/commas/commit/b534b7dad14f5997c5265da7d74f3374d86291c4))
* **cli:** support prompt ([6c2a008](https://github.com/CyanSalt/commas/commit/6c2a008ca15f27f8f611e7e04a804a782fa39b74))
* drag self to split ([29c4396](https://github.com/CyanSalt/commas/commit/29c43966b11b0a7e427ca5a9b20b2e05cc1feb96))
* experimental ai addon ([66e81d9](https://github.com/CyanSalt/commas/commit/66e81d9c877d363ac3033102837f4a4cd0991a73))
* **launcher:** fast customization ([901e850](https://github.com/CyanSalt/commas/commit/901e8507c6a764980a3d06e0c859b3d56aa49567))
* **launcher:** interactive launcher list ([b65b944](https://github.com/CyanSalt/commas/commit/b65b9445619aba0d0e74f873fd7f07390f67a44f))


### Bug Fixes

* **cleaner:** missing style ([aeda13a](https://github.com/CyanSalt/commas/commit/aeda13a891ddfa655dbf2fc4ceeadbcfb4e61097))
* disallow spliting panes ([ac6f6c9](https://github.com/CyanSalt/commas/commit/ac6f6c98bd2e98b6a85eabb3774b994fb0de25b1))
* **editor:** focus outline and padding ([debd393](https://github.com/CyanSalt/commas/commit/debd39397bd906cf1b1024300aaaf6de9720917d))
* fit light colors ([9ea0c2d](https://github.com/CyanSalt/commas/commit/9ea0c2d599e709ab87e7e46b55ff6682fd261675))
* **launcher:** remove keyword matching ([e28beba](https://github.com/CyanSalt/commas/commit/e28bebac069aa7e250ee424e65d7a97abb24b3e9))
* paste before initialization ([4a5bada](https://github.com/CyanSalt/commas/commit/4a5bada732a24d44e61f99cbf74fa3d8fd7a977f))
* **proxy:** anchor space ([eb1166a](https://github.com/CyanSalt/commas/commit/eb1166a378a714242a47994b05ab7cffbdada5b9))
* **shell-integration:** move actions to exact command ([28b0f53](https://github.com/CyanSalt/commas/commit/28b0f531800ed1375ef99bc0bf06dc446ce12e1c))
* **shell-integration:** record output end ([ff82c64](https://github.com/CyanSalt/commas/commit/ff82c6406b147478bcc4f3fd12ee37f7ea318e4b))
* sticky drop target ([4c067e3](https://github.com/CyanSalt/commas/commit/4c067e32263d3d84aec471defced6ea3a821dc42))
* tab list layout ([ae44b97](https://github.com/CyanSalt/commas/commit/ae44b97f91f19e155547d189e5b48fc3345ba3c9))
* title bar custom button style ([ecb8e78](https://github.com/CyanSalt/commas/commit/ecb8e781404d9c64fe3e57ac7eb47bf051becf14))
* title overflow ([e69e6e2](https://github.com/CyanSalt/commas/commit/e69e6e2751f447ca3498c26f5288736334da1d5b))
* wide title bar ([0a64960](https://github.com/CyanSalt/commas/commit/0a64960a229568d8dc692c3d4f01b7ff5c6ac8b2))
* xterm line height ([061f094](https://github.com/CyanSalt/commas/commit/061f0942a9e5a2929f680b19ec7b4aed6095a196))

## [0.31.0](https://github.com/CyanSalt/commas/compare/v0.30.0...v0.31.0) (2024-04-08)


### Features

* add terminal.style.lineHeight ([9741442](https://github.com/CyanSalt/commas/commit/9741442957d2949dca96ec909332b8ff0c49538c))
* interactive command marks ([1d366ca](https://github.com/CyanSalt/commas/commit/1d366ca6fcea87cbc57cdd9330c00cecabf4ff9f))
* sticky scroll ([63b2a07](https://github.com/CyanSalt/commas/commit/63b2a07bebd3cbbea98472867234a4c7d3540c13))


### Bug Fixes

* add overview for highlighted errors ([e779f79](https://github.com/CyanSalt/commas/commit/e779f79835a3ebd2087a5fb6dc51ddc39b54dfea))
* arrow control for completions ([2088d14](https://github.com/CyanSalt/commas/commit/2088d14aa479a1b2c7dadb86831af5db899e16d7))
* auto reveal completions ([45f2001](https://github.com/CyanSalt/commas/commit/45f200115b5dbb191dd0c7259864e4e31a1b09f2))
* continuous completion for directories ([d24e08e](https://github.com/CyanSalt/commas/commit/d24e08e22210c594e85f896d12895869f43fe5ad))
* dictionary reactivity ([77c4db8](https://github.com/CyanSalt/commas/commit/77c4db89a788a5c93c3a6843f3ecdd570ad07a89))
* double title bar on linux ([9e0a04a](https://github.com/CyanSalt/commas/commit/9e0a04a184615035afe54ececafaa785ea9a1460))
* electron compatible accelerator ([c3a6836](https://github.com/CyanSalt/commas/commit/c3a68362296a87cbca3f214d12b263f591eb522f))
* highlight block alignment ([f9bef54](https://github.com/CyanSalt/commas/commit/f9bef5423c1d384b8c01203eb148fba5e589b090))
* highlight block size ([468000c](https://github.com/CyanSalt/commas/commit/468000c45eff69105645a880e3432f4be549cbf0))
* **iterm2:** clean up disposed markers ([1d944e3](https://github.com/CyanSalt/commas/commit/1d944e39f2511ca8b13481e66169e84ea35e36a5))
* max sticky rows ([cc80029](https://github.com/CyanSalt/commas/commit/cc80029234520158c472d66fcd2b85fddb9b0c87))
* optimize batch input ([908bea0](https://github.com/CyanSalt/commas/commit/908bea0185353549d23051ebd6f9624eed94a501))
* refine marker style ([a8efa2b](https://github.com/CyanSalt/commas/commit/a8efa2b1875b15b0ccd4924faf1788b00c12cce8))
* refine term padding ([c18abab](https://github.com/CyanSalt/commas/commit/c18abab395e858f5cbe19dbd93d67092ee0b6530))
* release after clear ([12ee2b8](https://github.com/CyanSalt/commas/commit/12ee2b8115877f53996b3861815f22c11993659b))
* remove sticky at the last line ([edb5b5d](https://github.com/CyanSalt/commas/commit/edb5b5d643e4bdbbdf09c5678a291984c7553ec0))
* select completion only if element found ([353af00](https://github.com/CyanSalt/commas/commit/353af00266ff2c2a28fffb66a103eb17f2150ffe))
* write dropping data as pasting ([ea916d1](https://github.com/CyanSalt/commas/commit/ea916d102f8f6352b7addf6dd1d40dd1cad0ed34))

## [0.30.0](https://github.com/CyanSalt/commas/compare/v0.29.2...v0.30.0) (2024-02-07)


### Features

* **cli:** support `commas history` ([e77aa5d](https://github.com/CyanSalt/commas/commit/e77aa5db363f3c800c06861a6068914d27662fdf))
* **cli:** support `commas version [mod]` ([04c0b50](https://github.com/CyanSalt/commas/commit/04c0b50c703e8510fa55ab0a92b18756a0f8c433))
* **editor:** refine theme and language support ([a799273](https://github.com/CyanSalt/commas/commit/a799273803a2453b6a16b5ee66e2813460fbcdc3))
* macOS colors ([31247af](https://github.com/CyanSalt/commas/commit/31247af897144cca1f1f38e12d95cbc5f936bbb1))
* refine default ui options ([72b5d48](https://github.com/CyanSalt/commas/commit/72b5d48fe6c2a9a19fc9142f5d1fed18b1ff8ecb))
* show definition on macOS ([3774b2e](https://github.com/CyanSalt/commas/commit/3774b2e49d132aa2152b7b850011907ffcc35ea2))


### Bug Fixes

* a11y support ([621fac2](https://github.com/CyanSalt/commas/commit/621fac276a679508fca198a7e1d34a5f70daa742))
* **cli:** ignore completion when subcommand provided ([2c5b65b](https://github.com/CyanSalt/commas/commit/2c5b65b2bfc5edded1f20fd619c031ed634987d7))
* disable scroll delay ([d505587](https://github.com/CyanSalt/commas/commit/d5055871796cbe320a65ca67a67ed7e2738a0af7))
* **editor:** resolve file path ([d4ec967](https://github.com/CyanSalt/commas/commit/d4ec967fb326029dab96ebc73cee7186afd8309e))
* **editor:** widget style ([4a00869](https://github.com/CyanSalt/commas/commit/4a00869ef1f550b2bb142e2cbabca8bf929e7d9d))
* electron packager exports ([34eb18d](https://github.com/CyanSalt/commas/commit/34eb18d52edb4b492631e31add308be0e3e313ed))
* icon compilation ([e68da92](https://github.com/CyanSalt/commas/commit/e68da92fe9c17130df993ba5ff40cb70751f78f6))
* import meta resolve ([93cf560](https://github.com/CyanSalt/commas/commit/93cf560856b1f155dbad88b896c5da5792b50528))
* lint autofix ([9d00531](https://github.com/CyanSalt/commas/commit/9d00531ff2301bf3e168a90d365e2b3fe9859d25))
* non vibrant background ([8e11692](https://github.com/CyanSalt/commas/commit/8e11692364eacda67d31bae72f4d647fd8339656))

## [0.29.2](https://github.com/CyanSalt/commas/compare/v0.29.1...v0.29.2) (2023-10-24)


### Bug Fixes

* error reporting ([8927869](https://github.com/CyanSalt/commas/commit/892786977fa994ff5dc37f7eaca0301b9155fe26))

## [0.29.1](https://github.com/CyanSalt/commas/compare/v0.29.0...v0.29.1) (2023-10-24)


### Bug Fixes

* handle error for addons ([626efb1](https://github.com/CyanSalt/commas/commit/626efb166dcf149309148224366c03fcc61d08c3))

## [0.29.0](https://github.com/CyanSalt/commas/compare/v0.28.0...v0.29.0) (2023-10-24)


### Features

* better secondary background colors ([3d1c740](https://github.com/CyanSalt/commas/commit/3d1c7405a3276778e6b431f2c212d0a76da033a7))
* completion for npm scripts ([faf2cbf](https://github.com/CyanSalt/commas/commit/faf2cbf5f47d852b7200fad330302cc6d5666ef8))
* remove vibrancyOpacity settings ([47aa04e](https://github.com/CyanSalt/commas/commit/47aa04ecf210c5565ce4a9febe9b95fa8c8c8545))
* replace icon sets ([099f2eb](https://github.com/CyanSalt/commas/commit/099f2eb833180d16d764be4e4c70f89207b5aae6))


### Bug Fixes

* action bar layout ([af27126](https://github.com/CyanSalt/commas/commit/af27126a845f672a79b95e49879f0f8de77b90af))
* build for arm ([d76c5db](https://github.com/CyanSalt/commas/commit/d76c5db7eb062bb3f871ad79a04ea8cc9751ba66))
* code lint ([4ed0240](https://github.com/CyanSalt/commas/commit/4ed02405ef84f12bf51e94e8f581b52f0e2e4927))
* find box new look ([ad1648c](https://github.com/CyanSalt/commas/commit/ad1648c0f19de225aa2097895caf8ac7030663cd))
* find box text icon ([7fba629](https://github.com/CyanSalt/commas/commit/7fba6294921b491419d36b387e68d12d9489c7c6))
* input and sep color ([0e1dd5e](https://github.com/CyanSalt/commas/commit/0e1dd5e772d3060e9119ee104bac28d470cb7b01))
* **l10n-ext:** consistent locale name ([88a5d8b](https://github.com/CyanSalt/commas/commit/88a5d8bb180721aa3bdf2e5b039c7c1f02a6bd7f))
* **proxy:** replace icon ([c3b5f90](https://github.com/CyanSalt/commas/commit/c3b5f90a6b16ec232863b7fa3cffa7f5b68518b5))
* **proxy:** version style ([be208ee](https://github.com/CyanSalt/commas/commit/be208eeb343a6a64e91e2f4379913835f057ad27))
* rebuild node native modules ([b8ff232](https://github.com/CyanSalt/commas/commit/b8ff2328a3ed6f13aa00ff67fd8de4696a995485))
* remove useless styles ([03c6bc2](https://github.com/CyanSalt/commas/commit/03c6bc2c46f5015450726bcc66318f2f2c9fa504))
* scrollbar style and shadow ([1feb89e](https://github.com/CyanSalt/commas/commit/1feb89eab933706c4d927d5e56de125417632d4f))
* svg icon vertical align ([baef0b9](https://github.com/CyanSalt/commas/commit/baef0b9c0210c5be3c00414b22b8605c0f9d9e53))
* use canvas renderer by default ([0df633d](https://github.com/CyanSalt/commas/commit/0df633d57d57a019c33c49a7196546dbd5025311))
* vibrancy style ([23c3387](https://github.com/CyanSalt/commas/commit/23c3387c5b5a3dfed0c87b4b9ebd13edade3f62c))
* vulnerabilities ([d5b9ea5](https://github.com/CyanSalt/commas/commit/d5b9ea50a2bc185aba0a3a4079a495e72a937a88))
* xterm scroll bar ([4e681e4](https://github.com/CyanSalt/commas/commit/4e681e4fccd40f66ee650c8bd791ee37795ecca4))

## [0.28.0](https://github.com/CyanSalt/commas/compare/v0.27.1...v0.28.0) (2023-09-13)


### Features

* **theme:** follow system dark mode ([00afecd](https://github.com/CyanSalt/commas/commit/00afecddbacf2c83dcd2acaf4ee595f8ac48091d))


### Bug Fixes

* accent color on linux ([6fb0fea](https://github.com/CyanSalt/commas/commit/6fb0fea467be7b2935b7a101f57648461c80e872))
* dispose canvas renderer before terminal ([0be990b](https://github.com/CyanSalt/commas/commit/0be990b24ea80f1d012567022bb270e161ce53e1))
* dynamic accent color ([71a6f11](https://github.com/CyanSalt/commas/commit/71a6f117150cefbbd68b17c71464f74991cdfbf8))
* file casing ([3317ec7](https://github.com/CyanSalt/commas/commit/3317ec7ffbad61ef017a96bb93f4a3288b98f2be))

## [0.27.1](https://github.com/CyanSalt/commas/compare/v0.27.0...v0.27.1) (2023-09-13)


### Bug Fixes

* webgl renderer disposing ([8949f53](https://github.com/CyanSalt/commas/commit/8949f537b9ba98d7d5f4edaae4e7bbcce57f6a32))

## [0.27.0](https://github.com/CyanSalt/commas/compare/v0.26.0...v0.27.0) (2023-09-13)


### Features

* cancel tab grouping ([a5e0662](https://github.com/CyanSalt/commas/commit/a5e066211e6cfeba9245d8aad5525520225a0bbc))
* **completion:** show command aliases ([7126e17](https://github.com/CyanSalt/commas/commit/7126e17a455fd5c43b4de525d632adc3156ba31b))
* **launcher:** composable launchers ([30e2359](https://github.com/CyanSalt/commas/commit/30e23597bd804d383d8c1e725861ee1604c1ecde))
* new look ([1971d32](https://github.com/CyanSalt/commas/commit/1971d3274585d15789e245f4c5f5587470a420cc))
* new pty process compat ([1141078](https://github.com/CyanSalt/commas/commit/1141078265064ba8c0255eb99212661194cb274c))
* replace default themes ([4d5e29c](https://github.com/CyanSalt/commas/commit/4d5e29cd69b71c554bb2dff916d33dac1cba2bea))
* screen reader mode ([8df4f68](https://github.com/CyanSalt/commas/commit/8df4f6830583f3479360e1270319d6c914462bdd))
* show launcher process icons ([891f415](https://github.com/CyanSalt/commas/commit/891f415cf51f4491964888c07e060f1dc70a645f))
* update default vibrancy ([0507f49](https://github.com/CyanSalt/commas/commit/0507f4909a82bde56abd2445470c2c526928c3fb))


### Bug Fixes

* **cli:** error messages ([1cd529a](https://github.com/CyanSalt/commas/commit/1cd529a4f8e494b252c89acf21549d243361355a))
* **completion:** always make history second at most ([c4f57f7](https://github.com/CyanSalt/commas/commit/c4f57f73089aba06406ce9dcfa96ce3e6c53c6f2))
* destroyed process ([be1ed57](https://github.com/CyanSalt/commas/commit/be1ed5721327734c56021d620207021c2855905b))
* **editor:** unify context menu ([1d2e989](https://github.com/CyanSalt/commas/commit/1d2e9895d970c73d10e4e3404911201eb62977ca))
* fix passthrough completion to top ([f0be2e7](https://github.com/CyanSalt/commas/commit/f0be2e774d9acc2cd1d3adb327ad4215d9d22b30))
* i18n key ([d4c5496](https://github.com/CyanSalt/commas/commit/d4c549616c781b2324b286c2aba1d04aa199672b))
* macro imports ([93e36d2](https://github.com/CyanSalt/commas/commit/93e36d2550481aab6c2b2508f773b327f9a70da0))
* process name on macOS ([b5d0f0c](https://github.com/CyanSalt/commas/commit/b5d0f0cb606907f66420eb10fd0d6d09c7963e1c))
* reduce inactive block opacity ([1f4707b](https://github.com/CyanSalt/commas/commit/1f4707beec4b3a549d77c5773ab890fafed15dfd))
* rendererType after moving ([0bdcc04](https://github.com/CyanSalt/commas/commit/0bdcc047538cdcd082c7f76b8ff6563094232cc2))
* **sync:** lazy sync token ([4aae537](https://github.com/CyanSalt/commas/commit/4aae5378ddd1250d82cfdfcb14c4d532d2b79c80))
* tab list style ([2f3f7b6](https://github.com/CyanSalt/commas/commit/2f3f7b63ffecae8f2a1535c7113bced468259ae5))
* transparency for webgl renderer ([8277662](https://github.com/CyanSalt/commas/commit/827766209f0bf6dad610a2d6b9c1ef62ba35eba6))
* update icons ([6e1a31c](https://github.com/CyanSalt/commas/commit/6e1a31c11976f0843c16b8b45d2e129d0061e1ae))

## [0.26.0](https://github.com/CyanSalt/commas/compare/v0.25.1...v0.26.0) (2023-05-17)


### Features

* add shadow to interface ([d248bd5](https://github.com/CyanSalt/commas/commit/d248bd54978b8a4d147d1e7c14f7bf06aa6d7ca1))
* append terminal tab ([a9d5c07](https://github.com/CyanSalt/commas/commit/a9d5c07a4e43fd407965eaa8953679d7743dd024))
* **cli:** help message ([fe1082e](https://github.com/CyanSalt/commas/commit/fe1082e8bcaa10d319d2befeb6182d9b60ba3477))
* **cli:** translate descriptions and usage ([fdd8633](https://github.com/CyanSalt/commas/commit/fdd8633a29d2e95b7412197c54a7d737a16129e9))
* enable vibrancy effect on macOS by default ([0f42729](https://github.com/CyanSalt/commas/commit/0f42729e4de9924a02899200d33d59580dbc1fcb))
* **proxy:** copy proxy address ([49f735d](https://github.com/CyanSalt/commas/commit/49f735dc7cf1013c572be6256df4f6faad022604))
* replace feather icons ([bf325f5](https://github.com/CyanSalt/commas/commit/bf325f55cc1bd596c80c5423714d5784348f0206))
* show tab categories in tab select ([6315acf](https://github.com/CyanSalt/commas/commit/6315acfb33d67373967e4279dd5acc282736839d))
* support any vibrancy without docs ([c8442d4](https://github.com/CyanSalt/commas/commit/c8442d41e863305935047f305b6ba8c1e3e442f7))
* support terminal.shell.extraProfiles ([79f0607](https://github.com/CyanSalt/commas/commit/79f0607d3754c820940f4eeb36b5a464a162e4e2))
* update devicon ([eb26664](https://github.com/CyanSalt/commas/commit/eb26664d9a2486a65ef74e8aace09d1f3ce57f04))


### Bug Fixes

* **addon-manager:** stable order ([33d5076](https://github.com/CyanSalt/commas/commit/33d5076f010a1cc3b64d62ab51aa0239ace91c73))
* allow skipping finished command ([162df93](https://github.com/CyanSalt/commas/commit/162df9312e5daf16db91b941ca8cd214fc55e0dc))
* auto invalidate shadow ([9abcc71](https://github.com/CyanSalt/commas/commit/9abcc71a8d614e596b526b3bea5eb222c50782c3))
* cancel grouping after sorting ([aae745d](https://github.com/CyanSalt/commas/commit/aae745d669a372bb79b52f9ecfb9fef07e972407))
* cancel grouping before appending ([020b3e4](https://github.com/CyanSalt/commas/commit/020b3e4cf3ca682eed9715bcb82da8e1c9419a56))
* completion range ([df2f080](https://github.com/CyanSalt/commas/commit/df2f08051db058f91e2a132ce2383c8f239b5918))
* completion style ([d9ce5f7](https://github.com/CyanSalt/commas/commit/d9ce5f7f67d4ef25fffec925714741d3985fa226))
* conflict completion ([d43bba1](https://github.com/CyanSalt/commas/commit/d43bba17bc16693b0baaf326207a4e7f3951bb6a))
* create directory recursively ([dd0ba48](https://github.com/CyanSalt/commas/commit/dd0ba484a9b84089ee147dbc59d1de4efc4ac279))
* devicon format ([fbea1a8](https://github.com/CyanSalt/commas/commit/fbea1a81690a52d1d6f063843cfc10f5c648e126))
* file icon ([3de1750](https://github.com/CyanSalt/commas/commit/3de1750155f2b7754d841a682d46de2c9c8de778))
* highlight block layer ([7358bd5](https://github.com/CyanSalt/commas/commit/7358bd5fe7353c57193b9b1c21b0cd949bc7b597))
* horizontal dnd ([a125f2a](https://github.com/CyanSalt/commas/commit/a125f2ae9f1a132ffd212f7bb10f2bff1c05867e))
* init user dir ([095192b](https://github.com/CyanSalt/commas/commit/095192b6ea98915b9f0ba5a8ecad6f6e5dcdfe86))
* **launcher:** split launchers ([d3052c7](https://github.com/CyanSalt/commas/commit/d3052c78ff82f82990539fffda9054f2991a89a0))
* lint problems ([95ba469](https://github.com/CyanSalt/commas/commit/95ba469c0f8cd9792f573af13ec7d5c5a369af31))
* multiline decorations ([e661b67](https://github.com/CyanSalt/commas/commit/e661b67b26e4208692d2dd3b7e396a05d9cbb2aa))
* natural order ([c929a56](https://github.com/CyanSalt/commas/commit/c929a563626323c0199d0e66a91fad85f5b4242f))
* non-active style ([0ef4f40](https://github.com/CyanSalt/commas/commit/0ef4f404d4248e9d0a851f3bc7d83fd0ac332c8a))
* **proxy:** asar support ([ec20cc3](https://github.com/CyanSalt/commas/commit/ec20cc34f49bee44b34e60cbc7301095e9e9904c))
* remove magic number ([8b50823](https://github.com/CyanSalt/commas/commit/8b50823b02ef9af4ba827e1c80a0d8eb1b1fa5ad))
* remove useless bindings ([9380ce7](https://github.com/CyanSalt/commas/commit/9380ce7d44c529c956e5dfbccf13d50388f8ddc2))
* **settings:** fuzzy search ([8f21d83](https://github.com/CyanSalt/commas/commit/8f21d835f99d4c91bd65f21dec54f1c311d3f986))
* shell integretion ([d30fcdb](https://github.com/CyanSalt/commas/commit/d30fcdb4dca25bf2583e0fb023346979ffa030b0))
* tab list under title bar ([daa01b5](https://github.com/CyanSalt/commas/commit/daa01b525c35d53c56e742e5651d7c7c60192e9d))
* terminal.style.tabListPosition -> terminal.view ([6d0c5ab](https://github.com/CyanSalt/commas/commit/6d0c5ab3f242a196e978e16d09e0f988eda46474))
* windows style ([175d70b](https://github.com/CyanSalt/commas/commit/175d70b34e286a277a4f590bd3f0d85d6fe866e2))

### [0.25.1](https://github.com/CyanSalt/commas/compare/v0.25.0...v0.25.1) (2023-02-10)


### Bug Fixes

* disable clippy by default ([73c6d7a](https://github.com/CyanSalt/commas/commit/73c6d7abae87d609f787c23d196b78a5445f51cb))

## [0.25.0](https://github.com/CyanSalt/commas/compare/v0.24.0...v0.25.0) (2023-02-10)


### Features

* optimize tab item color ([4a84c42](https://github.com/CyanSalt/commas/commit/4a84c4212d67f5b67965d3dec1acf3cfd775e374))
* replace easter egg with clippy addon ([5dba423](https://github.com/CyanSalt/commas/commit/5dba4236dfe7ba89061e1c034266b464c1a0d890))
* support terminal.style.tabListPosition ([4c4b35b](https://github.com/CyanSalt/commas/commit/4c4b35ba7740614914713db7ad960c8561626bd5))
* support top or bottom tab list ([01a7cba](https://github.com/CyanSalt/commas/commit/01a7cba54055b66b43ddbdf3ffeca70465dacf42))


### Bug Fixes

* code editor saving ([149b11a](https://github.com/CyanSalt/commas/commit/149b11a4e137b853d60d6b0dee9df89f8a3c7d53))
* file as command completion ([f54eae5](https://github.com/CyanSalt/commas/commit/f54eae5dbca59382f0d53487d871dcb0c49345d9))
* ignore history navigation ([5b45464](https://github.com/CyanSalt/commas/commit/5b4546466ccd12e9f930a2451b4e0506688a64fb))
* remove completion on escape ([67ebb2b](https://github.com/CyanSalt/commas/commit/67ebb2b9d2fd9d967328a65d84dfdfb0a8ad96c0))
* scroll completion item into view ([04e9ba9](https://github.com/CyanSalt/commas/commit/04e9ba99e8cd64236f717e48d4da0f2387137cd1))

## [0.24.0](https://github.com/CyanSalt/commas/compare/v0.23.0...v0.24.0) (2023-01-18)


### Features

* add command completions ([32c4840](https://github.com/CyanSalt/commas/commit/32c48406cc321b7be47e87af030074b098422ae7))
* add icons to completions ([aa0491b](https://github.com/CyanSalt/commas/commit/aa0491b451c9bc6ee09e16a5859a421e7189d432))
* completion for stream ([f136ba2](https://github.com/CyanSalt/commas/commit/f136ba2ad626d3b1957825d12996fce2ca8e7ada))
* history completion ([69e301f](https://github.com/CyanSalt/commas/commit/69e301f4aeed1bc7876d9d08d81e0a1eb5edf277))
* history token completion ([39be551](https://github.com/CyanSalt/commas/commit/39be551aacb01f563bd597477a69039b23546fd7))
* refine completion icons ([cab09f6](https://github.com/CyanSalt/commas/commit/cab09f6738e98fe65a1545403e8b24cd8be4d05d))


### Bug Fixes

* arg history ([71a3629](https://github.com/CyanSalt/commas/commit/71a36297120f224a7b794be9dd723c89a8990c69))
* clear completion when esc pressed ([75b555b](https://github.com/CyanSalt/commas/commit/75b555baea3cfe230f2a37919ae1dca9220ab8ea))
* completion description ([499bc29](https://github.com/CyanSalt/commas/commit/499bc29167ef86d51544477aa5d2e994b866693f))
* completion scroll bar ([43dd499](https://github.com/CyanSalt/commas/commit/43dd4995eec84cd640ac6730c1582570ca16564d))
* completion sort ([0e55b3b](https://github.com/CyanSalt/commas/commit/0e55b3be311d34d0ce7d3a4dcb5b8f57afede467))
* completions after cleared ([203ed63](https://github.com/CyanSalt/commas/commit/203ed63dc1a71c6b872ef924bedfb2e7bf49995a))
* completions for man ([c4bea29](https://github.com/CyanSalt/commas/commit/c4bea296e5c6ad5be306b125e902fb903a4a2669))
* ipc connection on production ([69e48a4](https://github.com/CyanSalt/commas/commit/69e48a42d1f6d94acbaab1d147f9a59423c2fcae))
* locale error ([ccbe766](https://github.com/CyanSalt/commas/commit/ccbe76618fb88049998412d84a159e74697f7ca1))
* remove cli banner when arg passed ([b16b60f](https://github.com/CyanSalt/commas/commit/b16b60f7026c3fce97612142b0b38d05d2e650fc))
* remove file completions for ls ([8582996](https://github.com/CyanSalt/commas/commit/85829968d735d8aee078e88e439ac790d581e960))
* subcommand args ([23a15e5](https://github.com/CyanSalt/commas/commit/23a15e5c88ff9b4d9e671d48fce4eb0b9402d1b9))
* theme background editing ([114625b](https://github.com/CyanSalt/commas/commit/114625b43586db83eb52549b51fa87a6b23bee52))
* unavailable IME when completions triggered ([6c814bf](https://github.com/CyanSalt/commas/commit/6c814bf8258ed8582080b705b293f8ae41969b8a))
* use public themes ([0064ef6](https://github.com/CyanSalt/commas/commit/0064ef63e58cf1d856282dce9565a0bd46bc3242))
* yaml updater ([0186f2d](https://github.com/CyanSalt/commas/commit/0186f2d73e59b7f4cac862a1666ac4615bca97af))

## [0.23.0](https://github.com/CyanSalt/commas/compare/v0.22.2...v0.23.0) (2023-01-13)


### Features

* add `commas fuck` ([4d71e8a](https://github.com/CyanSalt/commas/commit/4d71e8accb79ffaa3dfa80d81f7c9e5b5f0a1ae6))
* add dirty diff gutter to code editor ([68cd608](https://github.com/CyanSalt/commas/commit/68cd6087e8ef1b324b57adb14a62dd9e6fe31a2e))
* add global shortcut for macOS ([218914c](https://github.com/CyanSalt/commas/commit/218914cf9d2086bc1c244ae5adb8559e619e56dd))
* add html lang ([e9b3c00](https://github.com/CyanSalt/commas/commit/e9b3c0019303e11c4ab52738071481de357e1d8a))
* add more quick fixes ([60c5cdd](https://github.com/CyanSalt/commas/commit/60c5cddc46f7b4bbb6bf7017e7637d69e5b7e173))
* add terminal group ([b8a1268](https://github.com/CyanSalt/commas/commit/b8a126825edd2ff625e1e1d9590698005e008de7))
* highlight completion matches ([4e7207f](https://github.com/CyanSalt/commas/commit/4e7207f9ec5a2268cf5764feebe7e1ab11698bb6))
* quick fix for shell integration ([a6efc9c](https://github.com/CyanSalt/commas/commit/a6efc9c748c85d070ba2320f1377efa221a784e9))
* rename menu to l10n-ext ([cc696e0](https://github.com/CyanSalt/commas/commit/cc696e02a3fba16458ca84e7decf0026875913bd))
* support auto completion ([6445db8](https://github.com/CyanSalt/commas/commit/6445db87df4822a155d2f400d6986ad6295d9e3e))
* support effect scope ([70ed7ef](https://github.com/CyanSalt/commas/commit/70ed7efd1bfaa897722f5b4bc3604306630be7b4))
* support error highlighting ([b7c4088](https://github.com/CyanSalt/commas/commit/b7c40886a07011cd83f65c75af8f70c6a402795a))
* support jumping to command ([977479f](https://github.com/CyanSalt/commas/commit/977479f8e021922a0bf2d9a650b4b11d05884d16))
* support more commands ([33ba93d](https://github.com/CyanSalt/commas/commit/33ba93d19d14ff50bed06a37ac16460b217fdd68))
* transfer keyboard events ([587a77f](https://github.com/CyanSalt/commas/commit/587a77f128f0c69b654e875c736664138922f3c4))


### Bug Fixes

* add user man paths ([4b97b8f](https://github.com/CyanSalt/commas/commit/4b97b8fd8721623206a47664fdb2e2112d783b56))
* avoid memory leak ([0f0b1ee](https://github.com/CyanSalt/commas/commit/0f0b1ee7af9da0552f6a8be2bbad58c922a9f69d))
* code editor diffs ([86d2b9e](https://github.com/CyanSalt/commas/commit/86d2b9e20a5b691d0978ad5177e930dc257677b1))
* destroyed frames ([8841e37](https://github.com/CyanSalt/commas/commit/8841e37b34386e2eeb8ca26f3d735b2a93495fb0))
* eslint issues ([6693815](https://github.com/CyanSalt/commas/commit/6693815e02cd2cc93ca8d7d810173cab247ef3c0))
* focus in group after removing tabs ([93ad7cc](https://github.com/CyanSalt/commas/commit/93ad7cc60117f70c4310f910b960369a9ba895d2))
* insert backspaces ([22b0891](https://github.com/CyanSalt/commas/commit/22b089119b62cd8d40c7a88d033a0de8dce0efb9))
* **iterm2:** inline image across screen ([e90e281](https://github.com/CyanSalt/commas/commit/e90e281b13b1274fd8c9069bdccf2fed51cc1b6f))
* marker reset logics ([fd4784f](https://github.com/CyanSalt/commas/commit/fd4784f6922d74946b855ed3d3aa2df4cc446373))
* refine completion desc style ([ca78afe](https://github.com/CyanSalt/commas/commit/ca78afe66a323af167563226e17ee5ed8d1be575))
* shell integration ([f93bcf9](https://github.com/CyanSalt/commas/commit/f93bcf9fdd2b92ec126114179f52f9d5c86c28e1))
* terminal teletype life cycle ([e4e5499](https://github.com/CyanSalt/commas/commit/e4e5499a2b7144cbe4c453884ce94dd6a2c24b39))
* **theme:** switch api ([85b803b](https://github.com/CyanSalt/commas/commit/85b803b8ca7c11e5c44bd0d6b3457176af7aa923))
* user signal integration ([a298733](https://github.com/CyanSalt/commas/commit/a298733c86270e5b0bd759f5b6f1fed1d7d32367))
* windows native control style ([e63ea81](https://github.com/CyanSalt/commas/commit/e63ea81b26aa1b2187556fbd28a58594923631fd))

### [0.22.2](https://github.com/CyanSalt/commas/compare/v0.22.1...v0.22.2) (2022-08-11)


### Bug Fixes

* mark error after screen cleared ([801800c](https://github.com/CyanSalt/commas/commit/801800c4855fea9a34ae5b1c441cf552da6ed805))

### [0.22.1](https://github.com/CyanSalt/commas/compare/v0.22.0...v0.22.1) (2022-08-11)


### Bug Fixes

* ipc error after packaged ([6af6ca5](https://github.com/CyanSalt/commas/commit/6af6ca50144d9448d5f47e4cdfbdd58f8ad36469))
* macOS code sign ([11cfb7e](https://github.com/CyanSalt/commas/commit/11cfb7e09a54d61e76d4dfa5e2b890244a66b1ba))

## [0.22.0](https://github.com/CyanSalt/commas/compare/v0.21.3...v0.22.0) (2022-08-11)


### Features

* add command exit code indicator ([cf96378](https://github.com/CyanSalt/commas/commit/cf96378d2a92e2d1736668931dd6e8dde80526ea))
* add overview ruler ([ce77c59](https://github.com/CyanSalt/commas/commit/ce77c5915bb4e03bed38fcbc5031c3f53afb06b5))
* add search count ([6fcc690](https://github.com/CyanSalt/commas/commit/6fcc6902a3098701d107787c61c5473c55bc0856))
* add tab thumbnail ([25397c4](https://github.com/CyanSalt/commas/commit/25397c416a48825d9fd00ffb6b78ba4ae4c564e8))
* **addon-manager:** simplify ui ([29350ae](https://github.com/CyanSalt/commas/commit/29350aec3177efd9f17a7228f4e5653956ef0f40))
* **cli:** add sender params ([275affe](https://github.com/CyanSalt/commas/commit/275affe9bef45ee6960a65ca703efce111e60412))
* **cli:** support command usage ([7fa53fb](https://github.com/CyanSalt/commas/commit/7fa53fb5f02e9f265e32d586d4ca005168822f50))
* collect idle state from shell integration ([a9c96f2](https://github.com/CyanSalt/commas/commit/a9c96f2bec3c3b9993dc6a5e57c894ee029c437a))
* expose readFile API ([ef7b6ec](https://github.com/CyanSalt/commas/commit/ef7b6ec5f66c8314fdc1bc8fd5e41a6935da4401))
* keep pane scroll position ([033549f](https://github.com/CyanSalt/commas/commit/033549f08bebdd6ae9ed92ebf50db1911e0b978c))
* **launcher:** add edit mode ([f665be1](https://github.com/CyanSalt/commas/commit/f665be1897ef17e593cc5eb965181d43dbb8e419))
* make tab addons reactive ([2ed8821](https://github.com/CyanSalt/commas/commit/2ed8821c2a5c9990053e1d0f3aa8718289f18eb4))
* refine theme card ([059f829](https://github.com/CyanSalt/commas/commit/059f829fe7c597590ef7b21da3dfebe7fe5f0ca1))
* **settings:** add filter ([eb008d0](https://github.com/CyanSalt/commas/commit/eb008d0b0de1dc6bb7fd8d6dadba4e65f2360ea3))
* **settings:** real time settings editor ([c2aee00](https://github.com/CyanSalt/commas/commit/c2aee00f65556190df014d8789b983a73c8cb618))
* shell integration ([06282d2](https://github.com/CyanSalt/commas/commit/06282d2f5fbd89bb37faa6da211103629f37cf54))
* standard cli command ([cd1bb1b](https://github.com/CyanSalt/commas/commit/cd1bb1be342ad574cdf9bac5cb1dc0202887ff7b))
* **sync:** add recently synced version ([773236c](https://github.com/CyanSalt/commas/commit/773236cb9db2ce4bf47ba8870528aea96059eb60))
* **sync:** add sync addon ([4ff05c7](https://github.com/CyanSalt/commas/commit/4ff05c711d1805848a182681fc79c825d2d2dc23))
* **sync:** support creating gist before uploading ([a350840](https://github.com/CyanSalt/commas/commit/a350840faadd3c1ba8c5cb3adb927c897a7816e8))
* **sync:** support extra plans ([8672879](https://github.com/CyanSalt/commas/commit/86728795f8804b4de537cd960bb5d77a83f966dc))
* **sync:** support scoped gist ([5f6b17f](https://github.com/CyanSalt/commas/commit/5f6b17ffda258a8a553d3549842ec8d4244412a2))
* **sync:** support sync.plan.ignores ([5576d55](https://github.com/CyanSalt/commas/commit/5576d556877df146d3467fdfb740b30eb2c2c145))
* **theme:** add color pickers ([8e5342a](https://github.com/CyanSalt/commas/commit/8e5342ada7596ca8c0ec1c6cb3743a7b55a74626))
* **theme:** preview bright colors ([495b317](https://github.com/CyanSalt/commas/commit/495b317834efd32d6cbbe76d35b5f4bca839fe04))
* title bar overlay on windows ([88f7a37](https://github.com/CyanSalt/commas/commit/88f7a37a3a010553ceeefa13139fa660f98c3665))
* update theme API ([a170b91](https://github.com/CyanSalt/commas/commit/a170b91e38edfc0da29b8c0955542865eb816e8e))


### Bug Fixes

* add User subdirectory in userData ([5f203bf](https://github.com/CyanSalt/commas/commit/5f203bf52adc013b00b3d8f1de6bd0c0adbe8eeb))
* audit deps ([fc538e1](https://github.com/CyanSalt/commas/commit/fc538e19d8559cce737117320e6249743bdcc8ef))
* clean todo items ([6f67ee6](https://github.com/CyanSalt/commas/commit/6f67ee640cb01065824ae25014c4741a6a5b3e42))
* **cli:** output error ([656145d](https://github.com/CyanSalt/commas/commit/656145d3b853ef55515e77681e53db3a4f32cf7e))
* code editor key conflict ([499737e](https://github.com/CyanSalt/commas/commit/499737ec29d197a971422140cab51994fd054199))
* confusing style ([0182c4d](https://github.com/CyanSalt/commas/commit/0182c4dd32a9f5e54100f405ef1a9a059a576c6d))
* copy for pinned updates in value selector ([442430d](https://github.com/CyanSalt/commas/commit/442430d701c323c5c824342b497e7b3fbf7f7dfb))
* disable livePreview by default ([b3cbc7b](https://github.com/CyanSalt/commas/commit/b3cbc7b88bbd58be569367c3d6253456b3d5a4ed))
* duplicate integration mark ([fbe1229](https://github.com/CyanSalt/commas/commit/fbe1229a448890118e5261dea8528f0888d9c6d4))
* find box for pane ([5b39ce4](https://github.com/CyanSalt/commas/commit/5b39ce4fabd56f669b753101b3fc07ae78c32c6d))
* get cwd on linux ([dadb78c](https://github.com/CyanSalt/commas/commit/dadb78c2884da9842fdd175e5814e4b74b949ff8))
* hide ipc script ([4db2705](https://github.com/CyanSalt/commas/commit/4db2705d90a5c8abd3341c2cfbeebd2a6064464a))
* improve dnd ([4389bc0](https://github.com/CyanSalt/commas/commit/4389bc0b0aa89eb30dde152e0acdf72ca75727c2))
* **iterm2:** remove links from core ([31f666f](https://github.com/CyanSalt/commas/commit/31f666fd020942e803a867603648b7962140d212))
* keep one process in commas-node ([5d1a8f0](https://github.com/CyanSalt/commas/commit/5d1a8f07ef3243ab435c09f471738ac38d05315e))
* keep panes alive ([74dcd3d](https://github.com/CyanSalt/commas/commit/74dcd3d85fc830061d9b438de0650a6d5c7e0295))
* **launcher:** hide close button if not editing ([165d94c](https://github.com/CyanSalt/commas/commit/165d94cd7bcf7eb28f2e50d13853fb25825ee12d))
* live preview style ([9301407](https://github.com/CyanSalt/commas/commit/93014072b011b9fc4e637ce85d28fbde6a17e2d7))
* make custom options sortable ([9c431b8](https://github.com/CyanSalt/commas/commit/9c431b8e9484da609936d4152b5ff1d9dc201aeb))
* menu on windows ([4082d17](https://github.com/CyanSalt/commas/commit/4082d17cdf16af2502d9448bac40c80f5867d0e3))
* omit translation [@use](https://github.com/use) ([28d8ef2](https://github.com/CyanSalt/commas/commit/28d8ef28bcf9bd47dc43eefc045382f7adf53e65))
* opaque background ([0a68f84](https://github.com/CyanSalt/commas/commit/0a68f84a92a0e36ab73e6ce5eaf628cdb1c6076f))
* reusable addons ([3a65b61](https://github.com/CyanSalt/commas/commit/3a65b614131bac0af102ddaf9c752bb54fb01563))
* scroll bar position ([9bf56d0](https://github.com/CyanSalt/commas/commit/9bf56d05378ebeda8c3696d1d87d5bbce9ba13e3))
* scrolling after switching tabs ([c61929a](https://github.com/CyanSalt/commas/commit/c61929a0786dd13bbdf8e19b4d1aae17204ec9d9))
* set default chalk level ([1add049](https://github.com/CyanSalt/commas/commit/1add049d63609507c4e0394b0db652a4a3e91973))
* **settings:** unexpected autofocus ([d83caca](https://github.com/CyanSalt/commas/commit/d83caca658289a9cc667935c0230f96bb7979925))
* support null YAML files ([bf29230](https://github.com/CyanSalt/commas/commit/bf2923017c4d30574e99b042ea6b7a71a969ccbf))
* **sync:** error while adding and deleting plans ([0e61d17](https://github.com/CyanSalt/commas/commit/0e61d17875605c6e07e48843c9127a61184ade05))
* **sync:** remove sync.plan.mode ([6eeb188](https://github.com/CyanSalt/commas/commit/6eeb1885ae69660a82a12ea746a6a86f6f122228))
* **theme:** customization ([fef9b91](https://github.com/CyanSalt/commas/commit/fef9b91607cc20d0559c9637cc5f72673147e568))
* **theme:** customization type ([b3cfa26](https://github.com/CyanSalt/commas/commit/b3cfa2646c6de6e978552ade7f7830d9e494f737))
* **theme:** remove type from customization ([6b6ef44](https://github.com/CyanSalt/commas/commit/6b6ef44678c5d23e25a4df50dfa9600b86f6273d))
* **theme:** word casing ([ca81ecf](https://github.com/CyanSalt/commas/commit/ca81ecf9f4e7c8847ebafb4c72394671c5fbba6e))
* title bar overlay on macOS ([23e78e5](https://github.com/CyanSalt/commas/commit/23e78e5469197b7740bec2f64b282032b0b58941))

### [0.21.3](https://github.com/CyanSalt/commas/compare/v0.21.2...v0.21.3) (2022-05-30)


### Bug Fixes

* hide user-settings ipc ref ([ad0b629](https://github.com/CyanSalt/commas/commit/ad0b62988ec741225749bf8ee2266a7a4ba787e5))

### [0.21.2](https://github.com/CyanSalt/commas/compare/v0.21.1...v0.21.2) (2022-05-27)


### Bug Fixes

* add external reactivity exports ([fc771b6](https://github.com/CyanSalt/commas/commit/fc771b6a2e0b8267fd89f185a32a8ba53678b357))

### [0.21.1](https://github.com/CyanSalt/commas/compare/v0.21.0...v0.21.1) (2022-05-27)


### Bug Fixes

* batch operations in `surface` ([e8b2e8c](https://github.com/CyanSalt/commas/commit/e8b2e8c66d54360e4db40b1dc2ad3cb5499294c6))

## [0.21.0](https://github.com/CyanSalt/commas/compare/v0.20.0...v0.21.0) (2022-05-27)


### Features

* a very simple find box for panes ([7bdc2a0](https://github.com/CyanSalt/commas/commit/7bdc2a0fec8275b4bebe7e18d01d30b6372c2034))
* add `Set Mark` keybinding ([00d6d5d](https://github.com/CyanSalt/commas/commit/00d6d5d5ab3c92b35ec12bee6ded7c63d226fe6a))
* add action bar ([2072beb](https://github.com/CyanSalt/commas/commit/2072beb8e781475314bc63b5f761ba592fa8ddac))
* add default scale ([4046e13](https://github.com/CyanSalt/commas/commit/4046e139ca9fcbcc45ad0395adfebf91fa0482f4))
* add git addon ([cc18f9d](https://github.com/CyanSalt/commas/commit/cc18f9d8d62d062d66d5a57ec86e0d33776156fe))
* add language services ([d9f032b](https://github.com/CyanSalt/commas/commit/d9f032b9217be325412fbbc609593a4aa4a679fc))
* add mark highlight line ([54c8a3c](https://github.com/CyanSalt/commas/commit/54c8a3cf7b4f045bc40e55739fdd8f49b1f8f993))
* add marker style ([65906fd](https://github.com/CyanSalt/commas/commit/65906fd71e2882e6b7f887fdd5a436c1ad5ae9c9))
* add minmax to numeric input ([9d4954e](https://github.com/CyanSalt/commas/commit/9d4954e8c3c0cb0baeaf55525b34ab0cfb35a57a))
* add order indicator ([7d4921e](https://github.com/CyanSalt/commas/commit/7d4921e66fc7d095348e55983b116fd90c1a1be8))
* add search number indicator ([ba9f6a9](https://github.com/CyanSalt/commas/commit/ba9f6a9faaab7702f8d33cdaa50bc1dc9b2e961e))
* add secondary color ([5f81391](https://github.com/CyanSalt/commas/commit/5f81391a07dcb4ed340ec8da809631344c655cd6))
* add standalone `terminal.style.vibrancy` ([7ad6221](https://github.com/CyanSalt/commas/commit/7ad62219bd5ca1f812382a5dda63671894416ac5))
* add vibrancy to macOS system frame ([bd266be](https://github.com/CyanSalt/commas/commit/bd266be77cbf89740a54fefe06da6f35454a4f32))
* **addon-manager:** builtin addons switch ([42a4333](https://github.com/CyanSalt/commas/commit/42a433388a97e0e6c22cbcc3bbbcdef6f412b403))
* **addon-manager:** refine manager pane ([18b20c0](https://github.com/CyanSalt/commas/commit/18b20c084e84fab734acbf461a73a6c9ff7d1871))
* **addon-manager:** sort addons ([92e44c8](https://github.com/CyanSalt/commas/commit/92e44c8460995c447181bf0431ea196716dda070))
* **addon-manager:** support i18n ([319e03f](https://github.com/CyanSalt/commas/commit/319e03f93a55f9324f732b8555cb617b0331cb3e))
* **api:** add `commas.workspace.effectTerminalTab` ([48e6094](https://github.com/CyanSalt/commas/commit/48e6094594707492d2e891973583c71c5c94ad38))
* builtin code editor ([f3e73c7](https://github.com/CyanSalt/commas/commit/f3e73c79dc18f8d6db812fd27ab600548c1d884b))
* **cli:** add `commas trick` ([6904b28](https://github.com/CyanSalt/commas/commit/6904b285a26df980e4c86b9c5ffb32e9808690ad))
* colorful cli help message ([d4b4d12](https://github.com/CyanSalt/commas/commit/d4b4d1272307e29100978c5a120e080fc2fd5dd4))
* expose `diligent` in helperMain ([1e44f7a](https://github.com/CyanSalt/commas/commit/1e44f7a4d29242b0ba567864f0a6877b4e77c338))
* expose more apis ([1eb99d8](https://github.com/CyanSalt/commas/commit/1eb99d88ff5235ed962b92f72ff53863b7622d54))
* **fun:** add `fun` addon ([a13350d](https://github.com/CyanSalt/commas/commit/a13350d8e0f46c55c44ed45b7edb3d7472fdf858))
* **git:** add remote opener ([b586c02](https://github.com/CyanSalt/commas/commit/b586c021d9271fb583187dcc417f94aaf5409ac7))
* handle url scheme ([43973bf](https://github.com/CyanSalt/commas/commit/43973bf72c1e238ebd24f5e3bbd81d02e949782c))
* improve input visualization ([bb406a8](https://github.com/CyanSalt/commas/commit/bb406a8b824b3643656199a8c57d6e5814b07fe1))
* **iterm2:** support `HighlightCursorLine` ([b52a6db](https://github.com/CyanSalt/commas/commit/b52a6dbfefd3ee84cbec94c1ab7a3ca5e133ecaa))
* **iterm2:** support badge ([b21e1c6](https://github.com/CyanSalt/commas/commit/b21e1c6180e2eb7289492abc981c90015ccfc220))
* javascript editor ([e886f63](https://github.com/CyanSalt/commas/commit/e886f636458a0783dc4de44453cf20512d621c57))
* material theme ([63a9d06](https://github.com/CyanSalt/commas/commit/63a9d062bbc8ad106836fab5e789ee4d8200d8c0))
* **proxy:** add buitin whistle ([a7266b7](https://github.com/CyanSalt/commas/commit/a7266b766478e9cd91e5070ba7f6706715b120d4))
* **proxy:** add external tag ([a2ceac3](https://github.com/CyanSalt/commas/commit/a2ceac388cf59eb7f2cb8dbd54708d7477aa2cd7))
* **proxy:** add whistle command ([2dff49d](https://github.com/CyanSalt/commas/commit/2dff49d12321fddbb62907148cae074115eb4787))
* **proxy:** expose server status ([14189cd](https://github.com/CyanSalt/commas/commit/14189cd34ae8060050137910f936063a0bdbc3df))
* **proxy:** show ip in proxy pane ([1dcaa43](https://github.com/CyanSalt/commas/commit/1dcaa4316c8976f18ddb24dfc3786d1f6ade4599))
* **proxy:** start server from pane ([25b46fc](https://github.com/CyanSalt/commas/commit/25b46fcec0b9ff10539750199ef8809bff47ca67))
* remove landscape addon ([754a845](https://github.com/CyanSalt/commas/commit/754a845f1e8b37662e3e00104d05d40fbf0735ce))
* **settings:** add group title ([20e9139](https://github.com/CyanSalt/commas/commit/20e91398062bfb3ef90118752eb40a69b6d9ff9c))
* **settings:** hash navigation ([dc90ee5](https://github.com/CyanSalt/commas/commit/dc90ee5b79b3bdcc2777616dc702e1ceaa322c0a))
* support `any` as `terminal.link.modifier` ([e761208](https://github.com/CyanSalt/commas/commit/e7612087c283f31c9afdcfbf65db5ae5309fa837))
* support `engines.node`, etc for addons ([a2873c7](https://github.com/CyanSalt/commas/commit/a2873c7852418fc2e2f1eef83e9343f279021130))
* support `imgcat` ([95b36b5](https://github.com/CyanSalt/commas/commit/95b36b58db82fa33107c47f113a32da85544111f))
* support `terminal.style.frameType` ([74f2778](https://github.com/CyanSalt/commas/commit/74f2778002139b64effb2a1f532c01657e6a4f91))
* support more schema ([bf3a7a9](https://github.com/CyanSalt/commas/commit/bf3a7a95397465254ae89ac89d3c3dae840197f6))
* support scrolling to mark ([deb1a8f](https://github.com/CyanSalt/commas/commit/deb1a8fe64def20f290326b894fab4f94eb231c6))
* translate default settings ([90b0940](https://github.com/CyanSalt/commas/commit/90b0940375c22f4b33199b2b194798ecb569fead))
* update feather icons ([aa7d530](https://github.com/CyanSalt/commas/commit/aa7d5301fd806846b27bd2ded8ceaba5bb77ecd9))
* update net apis ([1acfca3](https://github.com/CyanSalt/commas/commit/1acfca3e294ee7d31958a8bce74e57e9da574d96))
* use monaco-editor instead of codejar ([545509f](https://github.com/CyanSalt/commas/commit/545509f3bddad06e05c8ab80b9da0bf35f604597))


### Bug Fixes

* add deferred events ([e6ebebc](https://github.com/CyanSalt/commas/commit/e6ebebcb23d7f66e2b33173a7d8fffb7db1d8256))
* add shim for typings ([3e5ff57](https://github.com/CyanSalt/commas/commit/3e5ff574c46aa62e20bd08856f7ff9e760ff8504))
* addon reactivity ([29ae879](https://github.com/CyanSalt/commas/commit/29ae879ebac3c706226ab89ff23473f59e5d8f31))
* **addon-manager:** display addon name ([613f3f1](https://github.com/CyanSalt/commas/commit/613f3f16ae233f2fb96bd5955cfa1758ee8d7735))
* **addon-manager:** user addons ([cddee3e](https://github.com/CyanSalt/commas/commit/cddee3ebefa6f7de0f6a6c66fe57bc918573dee4))
* addons typing ([46f047b](https://github.com/CyanSalt/commas/commit/46f047bde004e941d1e3c9d4e0cf7285e2221e82))
* bad logic in directives ([dc30b58](https://github.com/CyanSalt/commas/commit/dc30b584193b558af5723c492567606249175092))
* clean useless uses ([719c537](https://github.com/CyanSalt/commas/commit/719c53793265081479d08b59f0e6040e1245d3bc))
* click area on settings lines ([daf222a](https://github.com/CyanSalt/commas/commit/daf222ac96b8bbc62cfdf5495962c3e9dcd5a17d))
* compile to cjs ([098eea3](https://github.com/CyanSalt/commas/commit/098eea3a5a392f7f209dafaad40df960bc15cbf8))
* default window height ([5c9ac65](https://github.com/CyanSalt/commas/commit/5c9ac6561ab6ef2857b3bd496170469f38d594d2))
* dragging color ([b17a29f](https://github.com/CyanSalt/commas/commit/b17a29f908b3ce8f0fb37a3cfe51550da40af260))
* eslint issues ([9402c11](https://github.com/CyanSalt/commas/commit/9402c111a9bbfd7f6a8855906ec7152e18f371de))
* **fun:** add "Inspried by" tips ([340897e](https://github.com/CyanSalt/commas/commit/340897e2fa825b0f15122bbf03875cd6dc9aa018))
* **fun:** add animation and style ([d66257e](https://github.com/CyanSalt/commas/commit/d66257e7fcff59fc8cc1d2d771346b07fd5ef5a9))
* **fun:** add offline flag ([f0d3944](https://github.com/CyanSalt/commas/commit/f0d3944dc6c6d5502b05576e51398e8e80aed7ff))
* **fun:** enhance base upgrades ([5ae9f5d](https://github.com/CyanSalt/commas/commit/5ae9f5dff45fff9e67ea6846e1cdb8bd49a83893))
* **fun:** faster animation ([f3615f8](https://github.com/CyanSalt/commas/commit/f3615f88e70b059c8879958c05ff7da99a6de975))
* i18n for find box ([5e30641](https://github.com/CyanSalt/commas/commit/5e30641b22cb4ba01a55a52048aa7a8e3ba4513d))
* initialize base composition ([3761fff](https://github.com/CyanSalt/commas/commit/3761fffd331aeb27656a83af6be1770516110aa6))
* **iterm2:** zIndex for attention ([021be2a](https://github.com/CyanSalt/commas/commit/021be2a090b938a4277d13fc7706c708181e3728))
* load default locale whenever it occurs ([8dd52e1](https://github.com/CyanSalt/commas/commit/8dd52e1ae62fa5b6ef35cb586fc4a03239cca699))
* menu reactivity ([626d3e0](https://github.com/CyanSalt/commas/commit/626d3e072cf5df36389096fa5983b036ce964d64))
* observe code editor element resizing ([2531c60](https://github.com/CyanSalt/commas/commit/2531c60d2aa049d068f654477d08d5faaf585d69))
* optimize performance ([aeab75f](https://github.com/CyanSalt/commas/commit/aeab75fc92151aa1bd126291f741a845a1649add))
* ordered checkbox style ([409a61c](https://github.com/CyanSalt/commas/commit/409a61ce2fc9d8e8ec31f5fa4ca4b9979aa8b8ea))
* packager with workspaces ([329d7d2](https://github.com/CyanSalt/commas/commit/329d7d27fd17243c67babf2b653a373b587c026b))
* **power-mode:** add hint message ([01d71d9](https://github.com/CyanSalt/commas/commit/01d71d92d4e8629f6915f5a476970c92e5daa87c))
* **proxy:** node path for starting ([876497e](https://github.com/CyanSalt/commas/commit/876497ef75ed6ec368a484a104afd3e1943a281a))
* **proxy:** status revalidation ([c6ee765](https://github.com/CyanSalt/commas/commit/c6ee765c4d756ecbebb192d07305ee3b401e4872))
* readFile encoding ([242679c](https://github.com/CyanSalt/commas/commit/242679c9ee98c3930cbedef43ae5247aa8a53412))
* refine YAML updater ([ce64009](https://github.com/CyanSalt/commas/commit/ce640095885b5f5c9889a466f36c23dcca8994cb))
* remove internal packages before build ([7dc801b](https://github.com/CyanSalt/commas/commit/7dc801b50610dcc0d2c56e142667027a5c3e5ebc))
* remove unused argument ([e4c9638](https://github.com/CyanSalt/commas/commit/e4c9638e75c802f38b7e07cc55dd8ae42a41a652))
* **settings:** default option ([c7ac715](https://github.com/CyanSalt/commas/commit/c7ac71586571dae96c0efc0967d52da3c5f1f8ec))
* shadow for windows ([6cf70e4](https://github.com/CyanSalt/commas/commit/6cf70e491c283a5969de7a836515e43bab8cce0f))
* sort recommended addons ([d6e923a](https://github.com/CyanSalt/commas/commit/d6e923a6aef0c644768dbd03c2d549260da35a1d))
* surface error in renderer ([7d0e15b](https://github.com/CyanSalt/commas/commit/7d0e15b199145066420709648d18c6c132918577))
* **theme:** case insensitive search ([aa513f1](https://github.com/CyanSalt/commas/commit/aa513f1754df489ec5629a9d4392524615f636e6))
* typings for `v-i18n` ([c4bf825](https://github.com/CyanSalt/commas/commit/c4bf825030fb0dcfa0806a5350c9d5b1ff0cd74f))
* unique addon names ([bdad2b9](https://github.com/CyanSalt/commas/commit/bdad2b9e23e6e834680258f702bbf8fe6b1bd5f9))
* unwrap defineProps ([72c961f](https://github.com/CyanSalt/commas/commit/72c961f75bee5fed4fa789af1225accce682adbb))
* update ui font size ([5622a76](https://github.com/CyanSalt/commas/commit/5622a7667e15febd8b7c427fc3a53ec73eb5a89d))
* use common types ([e0de51b](https://github.com/CyanSalt/commas/commit/e0de51b681c36d36614e40897d19f199fe428a56))
* yaml updater for array ([536ea6e](https://github.com/CyanSalt/commas/commit/536ea6ec58b6c26b181abe2306b8737be37fda0e))

## [0.20.0](https://github.com/CyanSalt/commas/compare/v0.19.3...v0.20.0) (2022-02-10)


### Features

* add `terminal.style.cursorStyle` ([5e23c33](https://github.com/CyanSalt/commas/commit/5e23c33ded33b330ce979178b0399f30d717df2e))
* add ascii arts ([314158f](https://github.com/CyanSalt/commas/commit/314158f9fe85e6fa130506431f072d70a32e451b))
* add cleaner plugin ([401adb3](https://github.com/CyanSalt/commas/commit/401adb3246ea35b0f0d444359baeec4fa675179c))
* add icon to macOS notification ([698e022](https://github.com/CyanSalt/commas/commit/698e022c8295a4db9b0432f2902d5e002cd12aa1))
* add notification osc handler ([6915f30](https://github.com/CyanSalt/commas/commit/6915f301c605d25c5449d06fa491230d6a67f111))
* enable webgl by default ([6fda3ff](https://github.com/CyanSalt/commas/commit/6fda3ff44c357ab69d2d0534e1032ef2480f1926))
* persist history for launchers ([f26e645](https://github.com/CyanSalt/commas/commit/f26e64534fae46ae40a136f642e74e4e5c98634c))
* support `commas attention` ([1aa6556](https://github.com/CyanSalt/commas/commit/1aa6556c41acd6932a29023a29e384697c05be05))
* support `notify` before app is ready ([53384c2](https://github.com/CyanSalt/commas/commit/53384c28bd744405641a7f3f4ad3b0d116f6dbae))
* support `RequestAttention=fireworks` ([ee667b5](https://github.com/CyanSalt/commas/commit/ee667b5e70bdcb895ac7ecf49e8aea6727e021aa))
* support commas:api module ([6312430](https://github.com/CyanSalt/commas/commit/6312430746748db84c08fc4a65b8a1a59731d395))
* support engines.commas for addons ([a35c121](https://github.com/CyanSalt/commas/commit/a35c121175d37995854b7b9bc86047f90d928a8e))
* support iterm2 style links ([84f02e2](https://github.com/CyanSalt/commas/commit/84f02e2c9fbad8e1bfb4742603eac70953d5fc6a))
* support partial iterm escape codes ([5dfd830](https://github.com/CyanSalt/commas/commit/5dfd8302704813b9c770d3fad15a4bf8301691cf))
* use different icon for remote launchers ([023150b](https://github.com/CyanSalt/commas/commit/023150b40bd23e59feac941e3942bc5d28772aaa))
* use native scrollbar ([e3ec6ce](https://github.com/CyanSalt/commas/commit/e3ec6ce7417c4f6993b071327de95a81b584b228))


### Bug Fixes

* clean properties ([68b5247](https://github.com/CyanSalt/commas/commit/68b524786747cea64ebbe6ea67c879d38b8e602f))
* **cleaner:** side effects ([f0e84d3](https://github.com/CyanSalt/commas/commit/f0e84d3d159219b21708a532c6fe7c11244d026b))
* computed style ([37d1e56](https://github.com/CyanSalt/commas/commit/37d1e56992121d289fe6b0b0847349399539b3d3))
* dark mode translations ([08f4c06](https://github.com/CyanSalt/commas/commit/08f4c065e762d07ec9c57efb0440bbcfc16e5f3c))
* link modifier settings ([5f17a62](https://github.com/CyanSalt/commas/commit/5f17a62f3d910e03ef197dd79de1095ea31333fe))
* main fields for addons ([0a7ced8](https://github.com/CyanSalt/commas/commit/0a7ced8a992f0fe02df808fb801d819354a87099))
* modern xterm usage ([be6d780](https://github.com/CyanSalt/commas/commit/be6d780ecc63ebff87fbbcd3b932c542e0392bf9))
* npm audit ([98b6fba](https://github.com/CyanSalt/commas/commit/98b6fba4d8d5d7a302a9de28b75af558105978e1))
* pack error ([992f02f](https://github.com/CyanSalt/commas/commit/992f02f853ba6691be01ac0eae4b734aec7687e3))
* revert default opacity ([001f07d](https://github.com/CyanSalt/commas/commit/001f07d14d72eb8575c47c3cd6672a79c4192d4a))
* scroll bar style ([118349c](https://github.com/CyanSalt/commas/commit/118349c2197bb53767775df59cf078e0a16bf3ed))
* selection style ([8bce8eb](https://github.com/CyanSalt/commas/commit/8bce8eb9c32ccb4f4f0d47ee8af885d9aa3d42e6))
* tsconfig schema ([e843f77](https://github.com/CyanSalt/commas/commit/e843f77fe2f02394271102f2788d8d04de06d931))
* vue types ([e17c52c](https://github.com/CyanSalt/commas/commit/e17c52c99de5e03670a6f1e3c51be92f7f413405))
* vulnerabilities ([c64addc](https://github.com/CyanSalt/commas/commit/c64addcb976f9761d09d85b7f99ab80944d65423))
* window shadow on macOS ([a0b1080](https://github.com/CyanSalt/commas/commit/a0b10808e2f9f8e1e1cc5ea3a55fed3a0dfeec76))

### [0.19.3](https://github.com/CyanSalt/commas/compare/v0.19.2...v0.19.3) (2021-10-21)


### Bug Fixes

* recommended settings ([8f0210b](https://github.com/CyanSalt/commas/commit/8f0210b67ad05c50a3afb4eab65990c5fb1903df))
* viewport ref error ([164a564](https://github.com/CyanSalt/commas/commit/164a5644b602c5a8f8dbc597bdef6b9eed89ab61))

### [0.19.2](https://github.com/CyanSalt/commas/compare/v0.19.1...v0.19.2) (2021-10-21)


### Bug Fixes

* env for renderer process execution ([515092c](https://github.com/CyanSalt/commas/commit/515092c33a84125b413aa4bc05f701f295e410bf))

### [0.19.1](https://github.com/CyanSalt/commas/compare/v0.19.0...v0.19.1) (2021-10-21)


### Features

* add terminal.external.remoteExplorer ([b68efca](https://github.com/CyanSalt/commas/commit/b68efca9026b0e1e232c881512417c87080d038b))
* support custom external launcher commands ([6091b7d](https://github.com/CyanSalt/commas/commit/6091b7db0b25534fd16d8725bb27f1723c7ded09))

## [0.19.0](https://github.com/CyanSalt/commas/compare/v0.18.0...v0.19.0) (2021-10-13)


### Features

* add context menu to launching button ([2b613de](https://github.com/CyanSalt/commas/commit/2b613deb4dd0b87f6d4e19afbe7115643d34a269))
* add context menu to tab index indicator ([50d1fc8](https://github.com/CyanSalt/commas/commit/50d1fc839cf9f52197e7c2f323ab46f296b58740))
* add context menu to terminal panes ([abe2c3d](https://github.com/CyanSalt/commas/commit/abe2c3dea9727973b7eade2f7faa8031fd77efa9))
* add right-click menu on terminals ([3fce98a](https://github.com/CyanSalt/commas/commit/3fce98a173d9e5970f924d20c64eaf27491dd948))
* add round corners on windows ([02c58e9](https://github.com/CyanSalt/commas/commit/02c58e9fc8f3959a22e1fb4ec48983132676166e))
* add ruby icon ([6c021e7](https://github.com/CyanSalt/commas/commit/6c021e7c3805d55a5682e94680f9c3c5d4b6d25e))
* add setting terminal.tab.liveIcon ([4cbfed5](https://github.com/CyanSalt/commas/commit/4cbfed50d99bd0a3ee6d73456603b311c189965f))
* **menu:** add language selector ([00510ac](https://github.com/CyanSalt/commas/commit/00510ac3531e5353fa1703916e3c39c880089ff6))
* optimize tab list interaction ([91c3403](https://github.com/CyanSalt/commas/commit/91c340391049634d065b3a8af0c85cda74b996b6))
* real-time icons on macOS ([72746dc](https://github.com/CyanSalt/commas/commit/72746dc91621c9c734431e2ff312d971fb841f98))
* refine tab list ([8701a5e](https://github.com/CyanSalt/commas/commit/8701a5ec975d02d3a7e49f685c062ed22a764e97))
* **settings:** add value selector ([83716fe](https://github.com/CyanSalt/commas/commit/83716fe761af8428c869777a333d5a29b4b91d58))
* support dynamic language ([e0f1b77](https://github.com/CyanSalt/commas/commit/e0f1b7732c2d1b723fe1ff2574fafc1781ddf4a9))


### Bug Fixes

* build on win32 ([62de201](https://github.com/CyanSalt/commas/commit/62de201cb52b196a2cfc244f09dd2c2348499356))
* **cli:** setting key ([bf78546](https://github.com/CyanSalt/commas/commit/bf785460e0d13799d40280ff1d7cc75e0f4b5dab))
* **menu:** remove "Follow System" option ([75d8772](https://github.com/CyanSalt/commas/commit/75d8772141d2b4f70cb1199f27f3cc86290839e3))
* package content tree ([fe4f6e1](https://github.com/CyanSalt/commas/commit/fe4f6e195385cb5c4b7acb281edb3a1ac42ba7a4))
* slot order ([60bfbee](https://github.com/CyanSalt/commas/commit/60bfbee9a8df1c31365ca7f13c2f398f3cdd34cd))
* **theme:** link space ([1e97d3a](https://github.com/CyanSalt/commas/commit/1e97d3a800ea77edb24a2acadc4d7ce80ddb1738))
* typo ([4c7e342](https://github.com/CyanSalt/commas/commit/4c7e34236c81704ba764815c2c8d2c89815d99b6))
* use menu addon to translate context menu ([ae091c1](https://github.com/CyanSalt/commas/commit/ae091c11bf34be2fea2ed7ef44de57d66a6eefcf))

## [0.18.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-09-23)


### Features

* add build:local script ([9abb6fa](https://github.com/CyanSalt/commas/commit/9abb6faa1f2814797e7f34c82c0510820779b668))
* add commands for Windows ([1af3b95](https://github.com/CyanSalt/commas/commit/1af3b95713e6fb07e0183eb62f6c6cffd6c971c4))
* **proxy:** open pane on right click ([7d9b78d](https://github.com/CyanSalt/commas/commit/7d9b78d157da637083f0efcab7f7e928b8591d79))
* remove protocol module ([2842aee](https://github.com/CyanSalt/commas/commit/2842aee585c56b82994253bcdd66094b65896b6b))
* support changing dark mode ([c286196](https://github.com/CyanSalt/commas/commit/c286196f8d032e06d6bc4ab01de1d0dbcc2f2199))
* support copying on windows ([85d065f](https://github.com/CyanSalt/commas/commit/85d065f74ff15f3d37098aec14363aedb685ec16))


### Bug Fixes

* branch updating ([7b5e0a0](https://github.com/CyanSalt/commas/commit/7b5e0a04b0c08048ddbc50253fcbd9f4949fa9e3))
* bump deps ([e59ca40](https://github.com/CyanSalt/commas/commit/e59ca408ce3c4f92a97019abeacbf86033f00043))
* eval context ([a991923](https://github.com/CyanSalt/commas/commit/a99192355f732ab3c00a5c3927c9aae98a353fdb))
* i18n directive updating ([794e121](https://github.com/CyanSalt/commas/commit/794e121e3927633824b05fc98447b0efe94d03ea))
* init settings ([9013ee3](https://github.com/CyanSalt/commas/commit/9013ee3f1ca494d1a6413491ceaddfe163323841))
* style priority ([0bca2ae](https://github.com/CyanSalt/commas/commit/0bca2ae901659685059f53943db14c8d3d82a1c5))
* windows compatibility ([4c4096b](https://github.com/CyanSalt/commas/commit/4c4096b0ad89bb14b834b059809ccbffe2b87152))

### [0.17.1-0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-06-21)


### Features

* allow media in addons ([e5ed24a](https://github.com/CyanSalt/commas/commit/e5ed24a85a8451a48ad1756c2f2ebfed5dd35d83))
* support .asar addons ([41dd5a9](https://github.com/CyanSalt/commas/commit/41dd5a9fa59883d9b54d5abae835b4508a73d510))
* support refreshing addons ([6113340](https://github.com/CyanSalt/commas/commit/6113340f47b58260112f64d01a1ef257af5ba9fd))
* use chokidar as file watcher ([6a68caf](https://github.com/CyanSalt/commas/commit/6a68caff77d07920b7efb96f6da7bac902f1b8eb))


### Bug Fixes

* default settings ([d185304](https://github.com/CyanSalt/commas/commit/d1853049326474365e15c68425723fef079056aa))
* file watcher ([008ea25](https://github.com/CyanSalt/commas/commit/008ea25d04d4f692dcce11d8407cd190ce8f011a))
* remove loaders ([d7d2dd2](https://github.com/CyanSalt/commas/commit/d7d2dd223dc31acca7ab9371391184059f21dfc2))
* trim yaml files ([ef393e8](https://github.com/CyanSalt/commas/commit/ef393e8dbde77c2d3434e5499ae3e8afecba252b))

## [0.17.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-06-10)


### Features

* add beep sound ([8087be6](https://github.com/CyanSalt/commas/commit/8087be65f11ea5ae1108af19661b411b259d3ef6))
* add bell style ([4e04212](https://github.com/CyanSalt/commas/commit/4e0421263bdcd06240617c733bfa20b1e29ebcca))
* add touch bar on macOS ([a29d796](https://github.com/CyanSalt/commas/commit/a29d796b32db9c97d462583b779ad88473c95a53))
* custom flow control ([d3978b6](https://github.com/CyanSalt/commas/commit/d3978b63cf9288cf74e8b3d1ae88e5531f664d84))
* normalize `commas eval` ([dd35c1e](https://github.com/CyanSalt/commas/commit/dd35c1e5729c18261510b550b3f91efc6f793be8))
* rename cli open to run ([3fe4054](https://github.com/CyanSalt/commas/commit/3fe4054589caeb966aa70430dfa31783c0a71ed5))
* simplify touch bar ([cd77018](https://github.com/CyanSalt/commas/commit/cd770187d1e534e02b0a250c04d1bd729699feb9))
* support `commas preview` ([2f7962d](https://github.com/CyanSalt/commas/commit/2f7962d74f09fb3df26d08fc789ed7524ec9e594))
* support cwd and stdin in cli ([4148156](https://github.com/CyanSalt/commas/commit/4148156858567e5c71a149116005ac40b55b7d0f))
* use YAML as config file format ([8558043](https://github.com/CyanSalt/commas/commit/8558043233d828a0377e9753e436a75ab5782be1))
* user addons in preference ([194544e](https://github.com/CyanSalt/commas/commit/194544e24362acb2a0511e223928fc7ac004a37c))


### Bug Fixes

* allow inline styles ([67bf99d](https://github.com/CyanSalt/commas/commit/67bf99dfd64380389fb784cffd3773c1051e65b7))
* bad parsing ([128b0c4](https://github.com/CyanSalt/commas/commit/128b0c4a255283daacec0d45c768be5abe87a78b))
* commas command buffer ([26ef89e](https://github.com/CyanSalt/commas/commit/26ef89e8066c6b727c34be491af515e99b38c5f9))
* dependencies ([c9541db](https://github.com/CyanSalt/commas/commit/c9541db482a3aaf6ae768e4c0ac67d7b3323b092))
* invoking error ([34f8365](https://github.com/CyanSalt/commas/commit/34f836584b4967bc3ef37d72a1d7a0129f925d6c))
* preview title ([e39bb27](https://github.com/CyanSalt/commas/commit/e39bb272f32ca4b4bdd943ca19d214de5c04f510))

### [0.16.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-05-08)

## [0.16.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-05-08)


### Features

* add `commas help` ([9842d5f](https://github.com/CyanSalt/commas/commit/9842d5f6d15221bdbc33b1e0129e34df4ebb311c))
* add binary script ([c6eaf96](https://github.com/CyanSalt/commas/commit/c6eaf96b08e3212c7e48c88b9b82141c33ccebef))
* add commas-node ([e3bffe4](https://github.com/CyanSalt/commas/commit/e3bffe4b84dad83801593610fa1f13b16d409591))
* make colors scalable ([d272120](https://github.com/CyanSalt/commas/commit/d2721207895b5b97f03640222a9ea2c204da2d19))
* replace shell addon with cli ([8d93ebb](https://github.com/CyanSalt/commas/commit/8d93ebb2ee053e3b0a52323ce5af3d29b62ab35a))
* **settings:** add changed styles ([6d35a81](https://github.com/CyanSalt/commas/commit/6d35a8174e6a31ac96fab51053d331a577b35c7f))
* support checking updates manually ([f03f847](https://github.com/CyanSalt/commas/commit/f03f847c3b03367613349dc294c9ab99f43f4b30))


### Bug Fixes

* add issue comment ([95a7703](https://github.com/CyanSalt/commas/commit/95a7703e38d35bbdd8d683c1e054b58028c00514))
* default aliases ([7af5a6a](https://github.com/CyanSalt/commas/commit/7af5a6a16255989fb61d50762e40c44ef3d68a39))
* power mode cli ([c1025ab](https://github.com/CyanSalt/commas/commit/c1025ab870d202f6cd90ff7d0757b1f4a56d0491))
* **proxy:** i18n ([4e13335](https://github.com/CyanSalt/commas/commit/4e13335e2962477305cfad8dd571c878a103e3bc))
* require default settings ([83948cc](https://github.com/CyanSalt/commas/commit/83948cc2b8f60181bfe329dd2528cd0762a812b4))
* selection styles ([77b6aa3](https://github.com/CyanSalt/commas/commit/77b6aa3718adac5ec3514b838d529041b99f33a9))
* **shell:** locales ([bb15fbd](https://github.com/CyanSalt/commas/commit/bb15fbd19035c159fe413f2312439950b315d6b0))
* sudo prompt icon on macOS ([c1f9a0b](https://github.com/CyanSalt/commas/commit/c1f9a0b927a2b94ba0d76bd2d7826e3ba1c48c0c))

### [0.15.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-04-13)


### Features

* add term env to login execution ([b1b2767](https://github.com/CyanSalt/commas/commit/b1b276752e01e921f1b4d03444b6ad9d2f1294e2))
* **proxy:** display system status on anchor ([2091a1d](https://github.com/CyanSalt/commas/commit/2091a1dca4fc79d38f9b2a0a9f171c5271682ae7))
* **proxy:** install cert ([b90753a](https://github.com/CyanSalt/commas/commit/b90753a488ccccfb437ac1e93a4c20559c4cbe8d))
* **proxy:** support installing server ([d8dbe24](https://github.com/CyanSalt/commas/commit/d8dbe24d3dc84eb5b4681ce878ea365e3d3dd55b))
* **proxy:** support uninstalling cert ([94b7680](https://github.com/CyanSalt/commas/commit/94b768079869884c89197feffefe1915f8ab4366))


### Bug Fixes

* whistle command ([3b3e525](https://github.com/CyanSalt/commas/commit/3b3e525a2155d9b22723947ddd57c25d65996d52))

## [0.15.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-04-09)


### Features

* add active style to directory icon ([ac2d9e2](https://github.com/CyanSalt/commas/commit/ac2d9e2572210562e0f907f4ecdc0c5b58208080))
* add checked style on tab options ([fa049dc](https://github.com/CyanSalt/commas/commit/fa049dc3a89dfa4c5151cdebb787ac49f12869c6))
* add globalHandler ([85880d5](https://github.com/CyanSalt/commas/commit/85880d5970af04cf1541015ba1ca4beebacabcc6))
* add open command in shell ([be0433e](https://github.com/CyanSalt/commas/commit/be0433eb2066c9c715673ebbfa4f28113eb97978))
* add select command ([db3fef9](https://github.com/CyanSalt/commas/commit/db3fef9427150ee2e6f9a4736d2677096a48b13a))
* add setting terminal.external.openPathIn ([e687ce1](https://github.com/CyanSalt/commas/commit/e687ce1e4dfc71344d35befa35493e37236c7842))
* autofocus launcher finder ([bff223c](https://github.com/CyanSalt/commas/commit/bff223c7315e7ab18d3435c6b1c179f3f9aa7b0f))
* change tab selecting shortcuts ([cd3c737](https://github.com/CyanSalt/commas/commit/cd3c737de6f8db8bd16f960465d093a0447ddc49))
* disable menu items when no focused window ([3fedbab](https://github.com/CyanSalt/commas/commit/3fedbab536842f6d6db5fcec8b5314dee9137f76))
* group tab options ([380d7f0](https://github.com/CyanSalt/commas/commit/380d7f0ec93a35aff0b38715648896118f091e56))
* make power-mode be a command ([2e12788](https://github.com/CyanSalt/commas/commit/2e127889fa40671b3709c2f345d0fc183957e752))
* observable keybindings ([95eba26](https://github.com/CyanSalt/commas/commit/95eba26d20a665b57dff372a6d3ef251308e7d4d))
* open directory on macOS ([86b7dde](https://github.com/CyanSalt/commas/commit/86b7dded34180ccd3b15d26a6377576edf2657f9))
* remove system frame ([9d87081](https://github.com/CyanSalt/commas/commit/9d87081d9614c3c4dd54729db33415ce4787bd6e))
* rename settings to preference ([7bf394d](https://github.com/CyanSalt/commas/commit/7bf394d3477d007163a352f6cbb6b1b48f4d0a2e))
* replace proxy addon with whistle ([50211a2](https://github.com/CyanSalt/commas/commit/50211a2f57578e64d9dd51d5c758c4b2af591ed9))
* support aliases ([61fd935](https://github.com/CyanSalt/commas/commit/61fd935ac0874355be575cd8eb260fcbc6b72389))
* support dragging on directory icon ([8a328da](https://github.com/CyanSalt/commas/commit/8a328da172f975a6578f01d0b034afd727438957))
* support system frame ([f049465](https://github.com/CyanSalt/commas/commit/f0494655f0a5e4155e8273b864060ad89861b4e4))
* support tab history ([52e58ea](https://github.com/CyanSalt/commas/commit/52e58ea4e8f60458f00d44ff7afea5d53bff55a7))
* use native drag-n-drop ([ed71d2b](https://github.com/CyanSalt/commas/commit/ed71d2babab5316c37b88335a7a9c5d8d6b79e3f))
* use native icon on macOS ([c8474ce](https://github.com/CyanSalt/commas/commit/c8474cea49c559789cd57a8ac9946936351b3dab))


### Bug Fixes

* code sign on macOS ([5386095](https://github.com/CyanSalt/commas/commit/53860955d05f1a99e307818f98d5d8818d6b67d2))
* create window from dock menu ([3bd313d](https://github.com/CyanSalt/commas/commit/3bd313dff85d7ae5b01dbaf0d89e53a8726ed2dd))
* deprecated methods ([602aead](https://github.com/CyanSalt/commas/commit/602aead81b1cde8f32d696e527e4088229240d32))
* dragging on focused input ([002bbf6](https://github.com/CyanSalt/commas/commit/002bbf6f33f8c9a41edc0eda763ea09851176c8d))
* i18n directive ([7c02e43](https://github.com/CyanSalt/commas/commit/7c02e432a036fd9912bef8086845e7b73c2fdfd1))
* issue of vue packages ([f46423f](https://github.com/CyanSalt/commas/commit/f46423f52421ba4207f4a5b742c39ae924ee5f95))
* killing signal in new tabs ([925ffd4](https://github.com/CyanSalt/commas/commit/925ffd4b3360b1322ddd40296566ca3ee2f0818e))
* load addons after settings ready ([e300883](https://github.com/CyanSalt/commas/commit/e3008839e377dd195861421891aee9e4a4992d05))
* menu item error ([216c210](https://github.com/CyanSalt/commas/commit/216c210aa87d44f9ab9cc31d799f9ef8b55b0ddc))
* proxy rule hover style ([51180bb](https://github.com/CyanSalt/commas/commit/51180bb52fec76a7c33abc8619db374d6300320c))
* proxy server closing timeout ([b04e4a4](https://github.com/CyanSalt/commas/commit/b04e4a4002c84aba10e85d9631850f49c211d44c))
* proxy server source data ([ed89fa8](https://github.com/CyanSalt/commas/commit/ed89fa81727ff07839ae406605fb47f97bca309e))
* vulnerabilities ([b1c59f5](https://github.com/CyanSalt/commas/commit/b1c59f5a026c69420c6e086abe48be9b1143a351))
* words for preference ([98bcc26](https://github.com/CyanSalt/commas/commit/98bcc26e9d7a7ed0d23b4486afb127a1369e498d))

### [0.14.2](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-02-28)


### Features

* add manifest for addons ([1753d84](https://github.com/CyanSalt/commas/commit/1753d840e34d9dac1f0061c037c5cb20a0200bd1))
* more flexible transition ([79a05a3](https://github.com/CyanSalt/commas/commit/79a05a337476541e7960eadd6254814bc554ca52))
* **shell:** add utilities ([29711fb](https://github.com/CyanSalt/commas/commit/29711fbd82b0b36c8e616d21b61653faea96c221))
* **shell:** share context till reset ([4c8ea71](https://github.com/CyanSalt/commas/commit/4c8ea7171ef0859bd9cfbe7483967bad4f6c0d20))
* support duplicating tabs ([59684a8](https://github.com/CyanSalt/commas/commit/59684a8c38f7bbe846aeec497f27d8043b510bf1))


### Bug Fixes

* check cwd before spawn ([6eea039](https://github.com/CyanSalt/commas/commit/6eea0390927a0a73eab9a4c5886b24d41f5d7d28))
* remove addon notes ([78478f6](https://github.com/CyanSalt/commas/commit/78478f6e5d615cee61458c0fc2a39fb3fff8bba1))
* send kill signals before running launcher ([4c84740](https://github.com/CyanSalt/commas/commit/4c8474002fef68eadf929b377f8fe44abf015267))
* use exec instead of spawn ([d0da5b3](https://github.com/CyanSalt/commas/commit/d0da5b3ddc1707312e2d8a881053975732f2bcd6))
* **user-settings:** translation ([aac6a1c](https://github.com/CyanSalt/commas/commit/aac6a1c7bed9154cbc12ed966db595883a4b575f))

### [0.14.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-01-21)


### Bug Fixes

* error of shell and power-mode ([1691fb1](https://github.com/CyanSalt/commas/commit/1691fb1e7152672cb9abc3f42b7082a902babfd3))

## [0.14.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-01-21)


### Features

* add introducations for addons ([746caa9](https://github.com/CyanSalt/commas/commit/746caa98a28746114a40b4fe363c6a3a0ca077d7))
* add power mode addon ([361941b](https://github.com/CyanSalt/commas/commit/361941bec553a29c179a4d51ef97eb0e71770ac9))
* add shadow and gradient to icon ([25f7519](https://github.com/CyanSalt/commas/commit/25f75197c2afd447e1ccb6d9928470e7696abeda))
* add shell addon ([8dcf424](https://github.com/CyanSalt/commas/commit/8dcf424002340301aa3529c0997afbc180d17923))
* print error messages to stderr ([68e3321](https://github.com/CyanSalt/commas/commit/68e3321e24d7218842d2adccdc59dd6e851e5bc7))
* refine icon design and remove pattern ([f06cfd4](https://github.com/CyanSalt/commas/commit/f06cfd4d9fe38a145c4f5210ad4ac620dfd83e3d))
* **shell:** add shortcut ([b78aba7](https://github.com/CyanSalt/commas/commit/b78aba776e17adf0be39f5bdd7d677de114e06c0))
* **shell:** add utility commands ([06e8f65](https://github.com/CyanSalt/commas/commit/06e8f6594c5d7c1c50e8579de9b4fa2377dda205))
* **shell:** support autocomplete ([96d2732](https://github.com/CyanSalt/commas/commit/96d2732fd059ff86012705c8db5702ec34898a60))
* **shell:** support receiving sender ([d1dc556](https://github.com/CyanSalt/commas/commit/d1dc5568b76196a9fa30040b75dc7f6b4f6ae211))
* **shell:** use LocalEchoAddon ([b3ad497](https://github.com/CyanSalt/commas/commit/b3ad497e9a53d52f90c06cc652710f14df055236))


### Bug Fixes

* arguments for explorer ([7ed122e](https://github.com/CyanSalt/commas/commit/7ed122ee8b3c532333493cc310c8ce84f7c69c73))
* close tabs by keyboard ([95d0488](https://github.com/CyanSalt/commas/commit/95d0488fda4a5d65abb04cda83471c6bbef5fc81))
* edge case of whitespace ([6885b87](https://github.com/CyanSalt/commas/commit/6885b87876a1207c8eae477cc294d193452436b6))
* event emitter leak ([9ad9c39](https://github.com/CyanSalt/commas/commit/9ad9c39d32f18698460c41b42bc11dd9a3b98809))
* event pattern on other platform ([64ce72a](https://github.com/CyanSalt/commas/commit/64ce72a242085d2be096c558c5985f9d444cb9d7))
* **power-mode:** keep old particles ([293e640](https://github.com/CyanSalt/commas/commit/293e640df67a5a1fc2fc3df769a754bd34feb610))
* title bar error ([d713824](https://github.com/CyanSalt/commas/commit/d7138247af431dd9121cf20050c5807b12cbc1b2))
* vertical align ([a2efa6c](https://github.com/CyanSalt/commas/commit/a2efa6cf68508354d0ee50a25e7ac95fed0b1223))

## [0.13.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2021-01-05)


### Features

* add openPaneTab and hooks ([46d82b0](https://github.com/CyanSalt/commas/commit/46d82b07bfdf6a976a5091a81da65fb186a9e766))
* add tab list switch on title bar ([fcc6751](https://github.com/CyanSalt/commas/commit/fcc675104b88e070be779fe456bea867fb918345))
* refresh menu when dictionary updated ([8bbf927](https://github.com/CyanSalt/commas/commit/8bbf927dca76cede017500742a5defc210dcdebd))
* send unhandled rejections ([6d52718](https://github.com/CyanSalt/commas/commit/6d52718045a3a33403448dec4e2d2ac89f0529ec))
* support showing tab options ([cc99e56](https://github.com/CyanSalt/commas/commit/cc99e5601d6aba4553409625cd71df569606349c))
* support translating submenu ([da02028](https://github.com/CyanSalt/commas/commit/da02028e6199c2e334ab521d9e586f7e73a49e8c))


### Bug Fixes

* autofocus after switching tabs ([e3af8cd](https://github.com/CyanSalt/commas/commit/e3af8cd6ac75add8e1a74339334ca1b507f46b77))
* ignore overwriting error ([1039ec4](https://github.com/CyanSalt/commas/commit/1039ec41295be8812604a981e3af15d736a0aa46))
* **proxy:** server status ([31acd35](https://github.com/CyanSalt/commas/commit/31acd354fb76cbd0c613378602644203030f4b7d))
* resizing observer ([77700f6](https://github.com/CyanSalt/commas/commit/77700f69f08035c80131df869c386f8a8545b9c5))
* support selecting form tips ([6a281c7](https://github.com/CyanSalt/commas/commit/6a281c718167564b65b83209b76d6f94c53809e7))
* using custom.js in renderer process ([bc320a1](https://github.com/CyanSalt/commas/commit/bc320a196898a3e1463e51cae884cce47bbac508))

### [0.12.2](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-12-29)

### [0.12.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-12-29)


### Features

* **landscape:** add experimental landscape addon ([405d106](https://github.com/CyanSalt/commas/commit/405d1064f0c19da042dd0901bb2b64b98281fe6d))
* **landscape:** add shuffle anchor ([1b044c8](https://github.com/CyanSalt/commas/commit/1b044c83fd4dc84fc9a65f7aaea3710ffaad7825))
* **landscape:** add transition ([e217deb](https://github.com/CyanSalt/commas/commit/e217deb3511ba9a7d3e5ee45f35958f6c9d18a6f))
* **landscape:** support custom background ([125d1af](https://github.com/CyanSalt/commas/commit/125d1aff5e5e60f0e68c3293516ad753a776584b))
* refine the app icon ([b200c6c](https://github.com/CyanSalt/commas/commit/b200c6c8a2f522ef40d6ab4c906a4df067c83810))
* support cleaning up keybindings ([1453464](https://github.com/CyanSalt/commas/commit/1453464f17993f8d4dbc71b6fa1d1384366a7012))
* support replacing $_ with directory ([ac65507](https://github.com/CyanSalt/commas/commit/ac65507d4e7baf232c56f8e24822b0f890ce0a07))
* support userland addons ([a0eb79f](https://github.com/CyanSalt/commas/commit/a0eb79f3172339f4b31baa0da685ea0515577e19))
* use system accent color ([a173ea2](https://github.com/CyanSalt/commas/commit/a173ea25e222214e714ed0f29f348cbe70b36f06))


### Bug Fixes

* downgrade to electron@10 ([a491d32](https://github.com/CyanSalt/commas/commit/a491d32fd9173342b61959d322a8ddfa04bd90b8))
* error of using directory in renderer ([bc0fb50](https://github.com/CyanSalt/commas/commit/bc0fb502b16debcbd7023fad0876fee50e78f53f))
* object editor without pinned items ([11ca0ba](https://github.com/CyanSalt/commas/commit/11ca0ba22dd3844ae54e32c383bbb3a3c6b45f80))
* **proxy:** error initial status ([030005c](https://github.com/CyanSalt/commas/commit/030005c8bed1687c747d2e855ef19ed45136f245))
* use sidebar as default vibrancy ([eb4d95c](https://github.com/CyanSalt/commas/commit/eb4d95ca20269c796bc67f9544273beaa80e5850))

## [0.12.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-12-07)


### Features

* **addon:** disposable addon ([18bc173](https://github.com/CyanSalt/commas/commit/18bc17393ce40a357756c833b939554fc5bf6fb0))
* dispose all addons while unloading ([d65aadb](https://github.com/CyanSalt/commas/commit/d65aadb20c448dd19f64f7ee884a433992f118bc))
* **pane:** add object editor ([a3f10d3](https://github.com/CyanSalt/commas/commit/a3f10d361604bf18445cab7c8da626500d22f166))
* **proxy:** rename setting key ([1143f0d](https://github.com/CyanSalt/commas/commit/1143f0dc75c7f578fee196e1b7c2f6539d5b0aaf))
* **user-settings:** optimize user settings pane ([784d602](https://github.com/CyanSalt/commas/commit/784d6020b8c4fed2f5f5eeac47a0a2e139a8a9d9))
* **user-settings:** pinned recommendations ([2351c16](https://github.com/CyanSalt/commas/commit/2351c1648c8b4c5fa82fdd760cd364cae04a452b))


### Bug Fixes

* component key generation ([d6c84ff](https://github.com/CyanSalt/commas/commit/d6c84ff98cac3312daefb793b5725710c8684fd8))
* **directory:** save files with empty eol ([8445b9d](https://github.com/CyanSalt/commas/commit/8445b9d0606fabcf0bff11db198e5ccd9eec5280))
* error when copying example files ([bdeb508](https://github.com/CyanSalt/commas/commit/bdeb508cdd32a476eb173dfa11d24677025d6aa9))
* **launcher:** script runner ([0520a8b](https://github.com/CyanSalt/commas/commit/0520a8b4606decb26872436bfa5811bda88da2a6))
* **tab-list:** stop click propagation ([ba69dbc](https://github.com/CyanSalt/commas/commit/ba69dbc75c2ab4db01f6c8f2958db54bd7109d15))
* v-bind merge behavior ([21daa8a](https://github.com/CyanSalt/commas/commit/21daa8a420869128ecb85442cd5827aa61e1ea57))

### [0.11.2](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-11-09)


### Features

* **addon:** add keybinding module ([00b6695](https://github.com/CyanSalt/commas/commit/00b6695c174d25630e9dac80c8b314a51625d52f))
* **proxy:** optimize proxy pane ([c19f7ac](https://github.com/CyanSalt/commas/commit/c19f7ace3647931320a465dec4874dd66f53000c))
* **proxy:** support dragging sorting ([3c02d24](https://github.com/CyanSalt/commas/commit/3c02d248ad1510ed7fbc1e3dddeb5f68a8fd3a97))
* **tab-list:** expand launchers by default ([b512d1e](https://github.com/CyanSalt/commas/commit/b512d1e9ff6250de53891dcf424ff2142d36d909))
* **tab-list:** support sorting launchers ([8ac5e5a](https://github.com/CyanSalt/commas/commit/8ac5e5aacdef4db81704813035efb9b28f15bb58))
* **ui:** replace launcher list icon ([f193b8f](https://github.com/CyanSalt/commas/commit/f193b8fd49700aeed2db58d56ad38c8a722cdf92))


### Bug Fixes

* **deps:** confusion of dependencies ([494b594](https://github.com/CyanSalt/commas/commit/494b594267264a93d815043d57b78ccee6b7b206))
* **menu:** preference from menu item ([6c41db0](https://github.com/CyanSalt/commas/commit/6c41db0902746e0fa156806c65e3411f497e587e))
* **proxy:** resolve disabled attribute ([0360790](https://github.com/CyanSalt/commas/commit/03607903b6a6cb396fcd1944a812c18ba9da957a))

## [0.11.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-08-24)


### Features

* **app:** handle custom protocol ([1f1e7cb](https://github.com/CyanSalt/commas/commit/1f1e7cb500b4733d3255ed3711e7dff1037cff14))
* **gui:** add opacity by default ([2056630](https://github.com/CyanSalt/commas/commit/205663004a5e9125ab1ba3fc06436b900682b554))
* **gui:** enable vibrancy when opacity is 0 ([bf72ea1](https://github.com/CyanSalt/commas/commit/bf72ea1c7e9b766d4d41bdbea8841da3325aa474))
* **gui:** simplify launcher group header ([e545c13](https://github.com/CyanSalt/commas/commit/e545c139f35a3dd49705c2857c51516c5e704de6))
* **gui:** support system dark mode ([2a78ffd](https://github.com/CyanSalt/commas/commit/2a78ffd5df1e9aa1a156fbfe1248f1c3dd64f863))
* **gui:** use theme colored border ([01c997c](https://github.com/CyanSalt/commas/commit/01c997cf40f4cd9144514dc2457ec79a34c960b9))
* **keybindings:** support xterm keymap definition ([1bee95e](https://github.com/CyanSalt/commas/commit/1bee95e9d29d764d9444071c0a640c63a3573228))
* **main:** use electron builtin net module ([b5ee2a2](https://github.com/CyanSalt/commas/commit/b5ee2a2bd56083f77478badd25fabb09942ec7c4))
* **menu:** spport menu translation ([797fdb3](https://github.com/CyanSalt/commas/commit/797fdb31fc986a3d673bff1b718bffad1d9fb9ce))
* **sync:** add sync addon ([9b961bb](https://github.com/CyanSalt/commas/commit/9b961bb5890fab9d04be82ee4f613583d92ae83d))
* **title-bar:** support double click maximizing ([0c35ea9](https://github.com/CyanSalt/commas/commit/0c35ea94240091e97310ef45182d6bb91de2f060))
* **xterm:** support alt/option + backspace ([da68ecf](https://github.com/CyanSalt/commas/commit/da68ecf9627260ced29f4dc444f4486a1ebc02e3))
* **xterm:** support CmdOrCtrl + Backspace ([249c735](https://github.com/CyanSalt/commas/commit/249c735e51e861b3da49661a44e4f937df3104a9))
* **xterm:** support terminal.renderer.type ([b4ff4c1](https://github.com/CyanSalt/commas/commit/b4ff4c1b37a55347300577a33243bdc5cf57b3ed))


### Bug Fixes

* **app:** remove debugging codes ([29f2f5c](https://github.com/CyanSalt/commas/commit/29f2f5c5e630d989e5f8518739fe945a7bfee70e))
* error when closing tab panes ([13237a0](https://github.com/CyanSalt/commas/commit/13237a065a0e45fad113a3f3a685308cee67862a))
* **find-box:** placeholder text error ([9621479](https://github.com/CyanSalt/commas/commit/9621479c3c8baa4347ea2a00b4053bdb145fd545))
* **gui:** macOS title bar on fullscreen ([e6c145c](https://github.com/CyanSalt/commas/commit/e6c145cbe8062e8a776f5eae5af4e8ebd475ff54))
* **gui:** selection color for opaque mode ([366474e](https://github.com/CyanSalt/commas/commit/366474eefe7005657a4c60f02f4cbf86eab3dbcd))
* **gui:** window button blink ([03053dd](https://github.com/CyanSalt/commas/commit/03053dde163fd9e3afcb6708fdaab3f6c46f7e56))
* **pane:** error for icons ([32cfdd6](https://github.com/CyanSalt/commas/commit/32cfdd67a357ab92c60b4202b69b0f04eedfaef1))
* **pane:** keep scroll behavior after switching tabs ([93db750](https://github.com/CyanSalt/commas/commit/93db75018e4bd22552cc8bedd71ce67784717cbd))
* **proxy:** error when reading rules ([e575920](https://github.com/CyanSalt/commas/commit/e57592036df38f800c906c5a13df7d3a4f59a27d))
* **pty:** exit pty instances after window closed ([0594744](https://github.com/CyanSalt/commas/commit/059474424b61222b913d0827e3073baf2a50cc1a))
* **tab-list:** dragging animation ([63417b5](https://github.com/CyanSalt/commas/commit/63417b547e9572e2f3094540ed044f28d7efb250))
* **tab-list:** error of dragging sort ([651b7ef](https://github.com/CyanSalt/commas/commit/651b7ef9bf5e9266b7d31e0872b98282551fd93a))

### [0.10.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-08-06)


### Features

* **electron:** disable remote module ([3f8fefb](https://github.com/CyanSalt/commas/commit/3f8fefb239725e45ed5fcc785e935ad0ec6e2243))
* **find:** toggle finding box when finding ([6cd0eb5](https://github.com/CyanSalt/commas/commit/6cd0eb5456438dc5d1ddc5b09274016f7d7deed5))
* **tab-list:** support colored icons ([1981c51](https://github.com/CyanSalt/commas/commit/1981c519f0a9b065bf733727db31c2e6d21f4bde))


### Bug Fixes

* **build:** app name on macOS ([74dd600](https://github.com/CyanSalt/commas/commit/74dd600bff6adab87e6d0c8ff2a463f68b7b9b67))
* **proxy:** missing proxy pane ([29ce37d](https://github.com/CyanSalt/commas/commit/29ce37d3b7693707560a8aa1f96efb3be95d3f6a))
* **terminal:** locale environment variables ([eb87b30](https://github.com/CyanSalt/commas/commit/eb87b30ee93d80f298b10c480ebdf882a43440f1))
* **terminal:** scroll bar disappears ([4ae24e2](https://github.com/CyanSalt/commas/commit/4ae24e260e0cb3563bba6c0d54ac6ddf64bfd568))

## [0.10.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-07-13)

### [0.9.3](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-05-22)

### [0.9.2](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-04-12)

### [0.9.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-02-14)

## [0.9.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-01-22)

### [0.8.2](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2020-01-09)

### [0.8.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-12-03)

## [0.8.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-11-18)

## [0.7.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-11-07)

### [0.6.3](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-10-23)

### [0.6.2](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-10-11)

### [0.6.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-10-10)

## [0.5.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-08-23)

### [0.4.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-08-07)

## [0.4.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-08-07)

## [0.3.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-08-05)

### [0.2.2](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-07-24)

### [0.2.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-07-24)

## [0.2.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-07-24)

### [0.1.1](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-07-18)

## [0.1.0](https://github.com/CyanSalt/commas/compare/v0.17.1...v0.18.0) (2019-07-18)
