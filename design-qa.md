# Design QA — classic garden

final result: passed

Source: /Users/sym/code/plant-survivors-design/concepts/01-classic-garden.png
Initial evidence: .artifacts/compare-first.png and first-{scene}.png.
Browser: Ego fallback after built-in iab reported unavailable. 1400×1200 viewport, DPR1, protected phone screen393×852, app region393×770.
Reference is a1024×1536 nine-panel board, individual panels approximately316×450—486, not true390×844 screens. Compare relative layout after rescaling; raster art must keep its own aspect ratio. Device chrome excluded from comparisons.

First findings:
- P1: wrong texture crops included printed damage-row text and plant fragments behind multiple controls. Replaced with clean interiors extracted from generated parchment/wood atlas, versioned URLs to invalidate old cache.
- P2: headings and buttons were too light/small compared with chunky reference. Increased titles/buttons, font weight/stroke, card content and HUD.
- P2: battle sprites and giant too small; scaled and darkened lawn toward source.
- P2: build panel had excess central whitespace; increased slots, recipe panel and text.
- P2: raster art stretched; changed scene illustrations to preserve aspect with cover.
- P2: evolution/result hero source crops included following panel text; recropped shorter.
Pending fresh post-fix comparison and main-flow interaction checks.

## Post-fix comparison

Viewed both source and implementation together in `.artifacts/compare-final.png`, with focused upgrade-card comparison `.artifacts/compare-detail.png`. Final individual screenshots are `.artifacts/final-{lobby,map,prepare,battle,upgrade,evolution,build,boss,result}.png`, each393×770 at DPR1. `.artifacts/ui-overview.jpg` is the implementation-only board.

Comparison normalization: reference panels are resampled to237×462 for relative region/hierarchy comparison; implementation is downsampled from393×770 to237×462. This is **not** pixel-difference evidence: the source board panel aspect ratios are inconsistent with a real portrait phone. Artwork in the live UI maintains its own aspect via contain/cover. The normalized source can look elongated; this is documented rather than treated as a runtime defect.

### Five fidelity surfaces

- Typography: real Chinese UI text uses STHeiti/PingFang fallbacks, heavy headings and buttons,14—23px body/choice text,31—38px main display controls. Source logo/celebratory art remains image lettering. Larger font/weight fixes reviewed. Exact ImageGen glyph outlines cannot be recovered as a font; minor shape differences remain P3.
- Layout: preserves the nine scene compositions, three stacked choices, starter row, five empty starting slots,6+6 build grid, top HUD/bottom plants, evolution recipe, and reward/damage rows. Reflowed for true tall phone and safe areas. No visible button overflow in any of nine states; layout-check.json records empty overflow arrays.
- Colors/tokens: olive greens, dark brown outlines, cream textured panels and yellow primary controls retained. Earlier contaminated texture bug fixed with clean atlas interiors and cache-safe asset names. Disabled rerolls visibly desaturate; selected plant and tracked recipe states remain distinct.
- Images: original scene illustrations retained where separable; clean generated independent assets preserve cast and rendering style. Hero subject, recognizable plants, boss with club, sun drops, pea effects and red fan prewarning verified. No missing images after waiting for decode. No CSS/vector fake character artwork. Generated individual facial/pose details vary from the board at P3 fidelity level.
- Copy/content: scene headings and major CTAs retained; recipe corrected to 寒冰射手→霜冻连射, avoiding the concept board's inconsistent diagram. Preview-only battle event affordances and external review rail identify demo navigation. Music toggle is explicitly documented as UI-only.

### Iterations and fixes

1. Initial: wrong crops/text contamination, small/light typography, small boss, build whitespace and stretched/cropped source illustration boundaries. See compare-first.png.
2. Clean textures and larger controls/sprites; compare-second.png showed some captures taken before image decode. Corrected capture procedure to wait for all images plus two animation frames; never treated incomplete captures as application failures or passing evidence.
3. Final: recreated isolated lobby/logo, clean item icons, alpha-trimmed boss, true red fan warning and pea projectiles; observed all nine post-fix screenshots. Build whitespace reduced. Main captions and form controls remain legible. No actionable P0/P1/P2 remains within UI-prototype scope.

### Browser interaction evidence

`.artifacts/interactions.json` records:
- Locked moonlit level correctly explains unlock condition.
- Ice starter selection updates preparation.
- ArrowRight moves player from50% to52%; pointer drag also changes position; release resets joystick to0.
- Build opens from pause; tracking toggles to 已追踪.
- Two rerolls consume the allowance and disable button.
- Upgrade returns to battle and level indicator changes.
- Evolution changes primary slot; continuation reaches boss and result.
- Result returns to lobby with1460 seed balance; atlas shows selected 大喷菇; Escape dismisses modal.

After this run, corrected non-default starter duplicates and starter-specific evolution label/recipe; default pea captures rechecked. Battle boss movement no longer forcibly overrides state with CSS.

`layout-check.json` records zero error/unhandled rejection/console.error messages during the final nine-state sweep and no overflowed game controls.

### Alternate surfaces

- Pixel10 preparation/build inspected with runtime's protected Android shell; screenshot evidence pixel-prepare.png/pixel-build.png. These were automatically scaled for browser height and are responsive checks, not1:1 fidelity captures.
- Narrow browser390×844 and360×800 checked; evidence mobile-390-upgrade.png/mobile-360-build.png. The device shell scales down and review navigation moves below it. CDP mobile emulation reported391/367 layout pixels respectively, with equal document scrollWidth; do not misreport these as exact device native-width tests.
- Main final comparison uses unscaled393×852 iPhone screen at1400×1200 browser size. Chrome/status/home regions are template-owned, excluded from app-only evidence.

## Follow-up polish / limits

- P3: exact irregular seed-packet corners, decorative icon glyphs and regenerated face details vary slightly from raster concept art.
- The reference uses unusually squat panels; actual portrait screen naturally redistributes vertical space. This is a responsive translation, not a claim of pixel-exact reproduction.
- Full game simulation, sound playback, persistence and gameplay balance are outside current UI implementation scope. Real-device frame-rate/performance and assistive-technology audit remain for the game phase.

## Final checklist

- [x] Selected first concept only; no second/third direction mixed in.
- [x] Nine scenes implemented with real text and controls.
- [x] Main navigation, choice, reroll, joystick, evolution, tracking, modal and result interactions checked.
- [x] Source and rendered views inspected in combined full and focused inputs.
- [x] Runtime integrity and production build passed.
- [x] Browser preview retained; no public deployment.

final result: passed
