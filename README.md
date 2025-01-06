# Extra Workshops: Better Intro And HTML Loader

todo:

Going to add simple loader so scene appears nicely once everything is ready

Going to use mix of WebGL and HTML/CSS for the loader (loading bar)

# Install gsap

```
pnpm add gsap
```

# Network throttling

W want to mimic bad bandwith for testing of your loading bar animation

In the Developer Tools panel, go to the Network tab Check the Disable cache

- Click on the dropdown menu with the Online value
- Click on Add
- Click on Add custom profile...
- Name it "Pretty fast" and set the Download value to 100000
- Close the panel (press add)

Your profile is added

Choose this value in the dropdown menu

Reload

**We created new profile because presets like Fast3G Slow3G are too slow** (Maybe I could have done this with Slow4G, but it doesn't matter, now you know how to create a new profile)

# Keep an eye on the framerate

Mixing HTML and WebGL is usually bad for performances
