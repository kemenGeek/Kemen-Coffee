# World assets

`public/models/kemen-world.glb` is generated, not hand-made. `build-world.py` models the whole coffee house and synthesises its textures in Blender, with nothing downloaded.

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P tools/build-world.py -- /tmp/raw.glb
npx @gltf-transform/cli dedup /tmp/raw.glb /tmp/deduped.glb
npx @gltf-transform/cli meshopt /tmp/deduped.glb public/models/kemen-world.glb --level medium
```
