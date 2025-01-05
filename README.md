# Extra Workshops: Post Processing

We will be dealing with:

• Depth of field
• Bloom
• God ray
• Motion blur
• Glitch effect
• Outlines
• Color variations
• Antialiasing
• Reflections and refractions
• Etc.

## Setup

To some extent from this repo

<https://github.com/Rade58/advanced_threejs_realistic_render>

but I loaded different model

I divided old gui stuff into folder "realisticRender"

And when you want to add new things to gui, related to post processing, and it into "postProcessing" folder

# Post Processing examples

<https://threejs.org/docs/index.html#examples/en/postprocessing/EffectComposer>

# At some point I decided to install `vite-plugin-glslify`

I wanted to use shaders in separate files when we started building our own passes

# Performance drawback

Keep in mind that each pass you add will have to be rendered on each frame
That can have severe performances drawback
