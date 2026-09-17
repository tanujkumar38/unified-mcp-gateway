# Google Flow Prompt Engineering Handbook

The master guide to crafting production-grade prompts for Veo 3.1, Gemini Omni Flash, and Nano Banana generative models.

---

## 1. The 5-Element Prompt Architecture

Every high-fidelity Google Flow prompt must follow the standardized **5-Element Architecture**. Omission of any element causes the diffusion backbone to sample from random priors, degrading cinematic consistency.

```
[1. Subject & Action] + [2. Environment & Atmosphere] + [3. Cinematography & Lens] + [4. Lighting & Color] + [5. Style & Render Texture]
```

### Element Breakdown
1. **Subject & Key Action**:
   - Explicitly define the subject (identity, age, attire, textures, posture).
   - Define exact physical action with temporal progression (*"takes three deliberate steps forward, pauses, and slowly looks over right shoulder"*).
   - Avoid generic verbs like *"walks"* or *"stands"*; use descriptive kinematics (*"strides with urgent velocity"*, *"trembles with subtle hesitation"*).

2. **Environment, Setting & Atmosphere**:
   - Spatial architecture, era, terrain, weather, atmospheric particulates (dust motes, steam vents, torrential rain, sea spray).
   - Volumetric depth cues: foreground elements, midground activity, background horizon.

3. **Cinematography & Camera Movement**:
   - **Lens**: Focal length (`24mm ultra-wide`, `35mm narrative standard`, `50mm human perspective`, `85mm portrait compression`, `135mm telephoto isolation`).
   - **Shot Size**: `Extreme Wide Shot (EWS)`, `Wide Shot (WS)`, `Medium Full Shot (MFS)`, `Close-Up (CU)`, `Extreme Close-Up (ECU)`.
   - **Camera Choreography**: `Dolly In / Out`, `Truck Left / Right`, `Pedestal Up / Down`, `Pan & Tilt`, `Clockwise Orbit`, `Whip Pan`, `Technocrane descent`, `FPV drone dive`, `Rack Focus from foreground to background`.

4. **Lighting, Color & Palette**:
   - Lighting setup: `Three-point cinema lighting`, `Rembrandt key lighting with soft fill`, `Hard directional backlight with rim separation`, `Golden Hour rim light at 2800K`, `Volumetric god rays piercing dense canopy`.
   - Palette & Grading: `Teal and orange dual-tone`, `Monochromatic high-contrast sepia`, `Desaturated Nordic cool grade`, `Vibrant saturated Kodachrome palette`.

5. **Render Quality, Texture & Film Stock**:
   - Sensor/Stock: `Shot on Arri Alexa 65 with Cooke Anamorphic /i Full Frame Plus lenses`, `35mm Kodak Vision3 500T motion picture film`, `Subtle natural organic film grain`, `180-degree shutter angle with natural cinematic motion blur`.
   - Explicit negative constraints: avoid buzzwords like *"photorealistic 8K trending on artstation"*; specify tangible camera optics and physical reality.

---

## 2. Standardized Cinematography Vocabulary

| Movement Command | Description & Execution |
| :--- | :--- |
| `slow dolly in` | Camera smoothly moves forward toward the subject along the Z-axis, building emotional intimacy or tension. |
| `truck right / left` | Camera moves laterally parallel to the action, maintaining constant distance from the subject. |
| `pedestal down` | Camera physically lowers vertically while maintaining a horizontal pitch. |
| `orbital 180-degree pan`| Camera orbits around the subject in a half-circle arc while keeping subject locked in center frame. |
| `crane jib descent` | Camera starts high above the scene and swoops down to eye level in a sweeping mechanical arc. |
| `rack focus` | The plane of critical sharpness shifts from a foreground element to a background subject. |
| `whip pan transition` | Rapid lateral camera swipe with high motion blur designed for match-cutting into the next shot. |
| `FPV drone chase` | Agile, high-velocity dynamic chase with rolling banking angles following high-speed subjects. |

---

## 3. Negative Prompting Dictionary

Always inject or verify negative prompt parameters to suppress default diffusion artifacts:

```text
deformed limbs, extra fingers, missing limbs, fused fingers, unnatural anatomy, plastic skin texture, wax mannequin appearance, uncanny valley facial distortion, temporal morphing, frame jitter, strobe flickering, erratic teleporting objects, chromatic aberration blur, muddy compression artifacts, low-resolution pixelation, watermark, UI overlays, subtitles, text labels, logo stamps.
```

---

## 4. The 15 Production Prompt Templates

### Template 1: Cyberpunk / Sci-Fi Neo-Noir
```text
A cybernetically augmented female detective in a translucent iridescent trench coat standing under torrential acid rain in a neon-drenched Tokyo alleyway. Holographic advertisements flicker in magenta and cyan, reflecting across puddle-filled asphalt. Slow tracking dolly-in on 35mm anamorphic lens at f/1.8, dramatic chiaroscuro key lighting with neon blue rim light, moody smoke rising from subway gratings, shot on Arri Alexa Mini LF, natural motion blur, cinematic 2.39:1 aspect ratio.
```

### Template 2: Historical Period Drama / Victorian Epic
```text
An aristocratic gentleman in a tailored 1880s tweed waistcoat examining an ancient parchment inside a vast gaslit library with towering mahogany bookshelves. Dust motes drift gently through afternoon light beams filtering through stained glass windows. Gentle slow tilt up from the aged paper to his contemplative eyes, warm amber candlelight key with soft diffused daylight fill, 50mm vintage prime lens, 35mm Kodak Eastman color film stock, organic subtle grain.
```

### Template 3: Hyper-Realistic Commercial & Product Showcase
```text
A luxury matte-black chronograph watch resting on a wet obsidian slab. Crystalline water droplets slowly bead and roll across the sapphire crystal bezel as the second hand sweeps in continuous mechanical movement. Extreme macro close-up with 100mm macro lens, slow precision motorized turntable rotation, high-key studio softbox illumination creating sharp metallic specular reflections, pristine commercial grade, clean hyper-detailed textures.
```

### Template 4: High-Octane Action & Vehicle Pursuit
```text
A midnight-blue vintage muscle car drifting violently around a sharp mountain asphalt hairpin at dusk, rubber smoke billowing from rear tires and sparks flying as the undercarriage clips the curb. Low-angle tracking Russian Arm shot hugging 6 inches above the pavement, high dynamic range lighting with red brake light flares, 24mm ultra-wide lens, 1/1000s shutter capture with crisp kinetic motion blur, gritty action blockbuster aesthetic.
```

### Template 5: BBC Earth Style Nature & Wildlife Documentary
```text
A female snow leopard silently stalking across a snow-covered ridge in the jagged Himalayan mountains during a biting blizzard. Wind whips loose snow powder across her fur; her intense amber gaze remains locked on the valley below. Smooth telephoto slow-motion capture on an 800mm prime lens, natural overcast winter lighting with soft shadow gradation, shallow depth of field isolating subject against blurred peaks, pristine 4K wildlife documentary fidelity.
```

### Template 6: Stylized 2.5D Cel Animation / Anime
```text
A young spirit guardian wielding a glowing azure katana leaping through a storm of glowing cherry blossom petals atop an ancient Japanese pagoderoof. Dynamic stylized anime aesthetics, hand-drawn keyframe motion with fluid 24fps in-betweening, dramatic cel shading with bold ink contours, vibrant sunrise backlighting casting long golden rim lines, high-angle downward tilt with anime speed lines.
```

### Template 7: Ethereal Fantasy & Magic Realism
```text
An elven enchantress floating six inches above a mirror-still bioluminescent forest pool at twilight. Glowing turquoise spores hover in the air, and ripples of golden light pulse outward from her fingertips. Slow 360-degree orbital camera pan, mystical fairy-tale lighting with cyan bioluminescence and soft lavender ambient fill, 50mm dreamy lens with subtle anamorphic oval bokeh, otherworldly cinematic serenity.
```

### Template 8: Psychological Thriller / Dark Suspense
```text
A distressed man trapped in a sterile, flickering fluorescent-lit institutional hallway with peeling green paint. He turns his head rapidly as strange shadows stretch down the walls behind him. Slow unsettling Vertigo zoom (dolly in while zooming out), cold greenish fluorescent ceiling tube lighting with heavy shadow drop-offs, 28mm wide lens with noticeable edge distortion, claustrophobic framing, raw psychological tension.
```

### Template 9: Architectural Visualization & Luxury Interior Flythrough
```text
A modern minimalist concrete and teakwood villa overlooking a stormy ocean cliffside. Rain cascades down floor-to-ceiling glass panes while a minimalist linear gas fireplace flickers warmly inside. Smooth Steadicam architectural glide through the open living space toward the ocean view, architectural straight verticals maintained, balanced natural exterior overcast light meeting warm 2700K interior cove lighting, Arri Master Prime 18mm lens.
```

### Template 10: Microscopic / Scientific Macro Cinematography
```text
A cluster of iridescent human neural synapses transmitting pulses of golden bio-electrical sparks across synaptic gaps within deep blue cerebral fluid. Extreme electron microscope macro simulation, volumetric glow effects, depth of field razor-thin with liquid optical refractions, clean scientific documentary visualization, 60fps fluid particle dynamics.
```

### Template 11: Dynamic Music Video & Beat-Synced Choreography
```text
A hip-hop dancer executing an explosive freeze in an abandoned industrial warehouse, surrounded by a ring of triggered pyrotechnic flares. Camera whips into a rapid 180-degree snap pan followed by an instantaneous speed ramp into ultra slow-motion, warm fiery rim lights competing with cold moody top spotlights, heavy anamorphic horizontal blue flares, dynamic youth culture music video energy.
```

### Template 12: Drone Aerials & Landscape Panoramas
```text
Sweeping forward high-altitude aerial drone flyover across the dramatic jagged sea stacks of the Faroe Islands as colossal North Atlantic waves crash against black basalt cliffs. Early morning golden hour sun breaking through dramatic stormy thunderheads, long shadows cutting across emerald moss plateaus, 4K DJI Inspire 3 full-frame cinema camera, grand scale, majestic environmental awe.
```

### Template 13: Intimate Character Dialogue & Dramatic Close-Up
```text
An elderly watchmaker with deep weathered wrinkles and wire-rimmed glasses speaking softly with subtle emotional quiver in his voice, tears welling in his eyes. Extreme close-up shot on an 85mm portrait prime at f/1.4, delicate catchlights in his irises, warm tungsten work-lamp lighting casting soft Rembrandt triangle shadows on his cheek, nuanced micro-expressions, rich dramatic performance capture.
```

### Template 14: Atmospheric Horror & Supernatural Dread
```text
A solitary wooden rocking chair slowly rocking by itself in the middle of a derelict Victorian attic shrouded in heavy cobwebs. A single flashlight beam pans across the room, illuminating floating dust and revealing a tall shadowy silhouette standing motionless in the dark doorway. Handheld camera with subtle nervous breathing tremors, harsh single-source flashlight illumination casting long terrifying silhouettes, 35mm gritty film look, visceral dread.
```

### Template 15: Modern Minimalist Fashion Editorial
```text
An avant-garde high-fashion model wearing an architectural sculptural crimson coat standing on an expansive white salt flat beneath a crystal-clear cobalt sky. The wind ripples the coat fabric in majestic geometric waves as the model executes a slow high-fashion pivot. Low-angle static wide shot with 50mm cinema lens, harsh midday desert sun creating razor-sharp geometric shadows, bold saturated color contrast, Vogue editorial aesthetic.
```
