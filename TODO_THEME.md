# Theme Conversion TODO (Flatsome/Floatsome-like, no CDN)

## Step 1 — CSS parsing fix
- [x] Fix broken CSS syntax in `css/style.css` (remove invalid diff-artifact `+` lines in Circular Hero block).

## Step 2 — Page theming + remove CDN
- [ ] Remove GSAP CDN scripts from `pages/home.html`
- [ ] Align Home markup with Flatsome-like theme classes in `css/style.css`
- [ ] Align Products markup with theme classes in `css/style.css`
- [ ] Align About markup (and shared header/footer usage) with theme classes in `css/style.css`
- [ ] Align Auth markup in `index.html` with theme classes in `css/style.css`

## Step 3 — Local assets hygiene
- [ ] Replace any remote/third-party images referenced by Home/other pages with local `assets/*` equivalents (where they exist)

## Step 4 — Visual verification (user/browser)
- [ ] Critical-path test: Auth + Home + Products load and basic interactions
- [ ] Thorough test if needed
