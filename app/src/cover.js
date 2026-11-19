// Neon Sunset Cover Studio: the cover renderer. Every cover is drawn on a 2D canvas
// from the user's own photos, a panel layout, a colour grade and the caption text.
// Nothing here reaches the network; the only images are the photos handed in.

export const LAYOUTS = {
  hero3: {
    label: 'Hero + 3',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.64 },
      { x: 0, y: 0.64, w: 1 / 3, h: 0.36 },
      { x: 1 / 3, y: 0.64, w: 1 / 3, h: 0.36 },
      { x: 2 / 3, y: 0.64, w: 1 / 3, h: 0.36 },
    ],
  },
  grid4: {
    label: '4-Panel Grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  mosaic9: {
    label: '9-Panel Mosaic',
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
    ],
  },
  fullbleed: {
    label: 'Full Bleed + Strip',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  collage: {
    label: 'Tilted Collage',
    panels: [
      { x: 0.04, y: 0.06, w: 0.52, h: 0.58, rot: -4 },
      { x: 0.5, y: 0.04, w: 0.46, h: 0.52, rot: 5 },
      { x: 0.2, y: 0.56, w: 0.58, h: 0.4, rot: -2 },
    ],
  },
  story: {
    label: 'Portrait Story',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.52 },
      { x: 0, y: 0.52, w: 0.5, h: 0.24 },
      { x: 0.5, y: 0.52, w: 0.5, h: 0.24 },
      { x: 0, y: 0.76, w: 1, h: 0.24 },
    ],
  },
};

export const GRADES = {
  vice: { label: 'Vice Sunset', from: '#ff9a3d', to: '#ff2e88', tint: '#ff5e3a' },
  neon: { label: 'Neon Night', from: '#ff2ea6', to: '#00e5c7', tint: '#7a2eff' },
  gold: { label: 'Palm Gold', from: '#ffd319', to: '#c47a12', tint: '#ffb347' },
  dusk: { label: 'Teal Dusk', from: '#14b8a6', to: '#312e81', tint: '#0ea5e9' },
};

/** Panel rectangles in pixels for a canvas of width w and height h. */
export function layoutPanels(layout, w, h) {
  const def = LAYOUTS[layout] ?? LAYOUTS.hero3;
  return def.panels.map((p) => ({
    x: p.x * w,
    y: p.y * h,
    w: p.w * w,
    h: p.h * h,
    rot: p.rot ?? 0,
  }));
}

function drawPhotoInto(ctx, img, rect, adj, gap) {
  const px = rect.x + gap;
  const py = rect.y + gap;
  const pw = Math.max(1, rect.w - gap * 2);
  const ph = Math.max(1, rect.h - gap * 2);
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  const zoom = adj.zoom || 1;
  const base = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * base;
  const dh = img.naturalHeight * base;
  const cx = px + pw / 2 + (adj.dx || 0) * pw;
  // When the panel crops vertically, anchor to the top of the photo so a
  // person's face stays in frame instead of being cut by a centred crop.
  const cy = dh > ph ? py + dh / 2 + (adj.dy || 0) * ph : py + ph / 2 + (adj.dy || 0) * ph;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

function drawTiltedPhoto(ctx, img, rect, adj, w, h) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const angle = (rect.rot * Math.PI) / 180;
  const frame = Math.max(6, Math.min(w, h) * 0.012);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = '#fdf6ec';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = Math.min(w, h) * 0.02;
  ctx.shadowOffsetY = Math.min(w, h) * 0.008;
  ctx.fillRect(-rect.w / 2 - frame, -rect.h / 2 - frame, rect.w + frame * 2, rect.h + frame * 2);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.beginPath();
  ctx.rect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
  ctx.clip();
  const zoom = adj.zoom || 1;
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * base;
  const dh = img.naturalHeight * base;
  // Top-anchored like the straight panels, so faces stay in frame.
  const cyOff = dh > rect.h
    ? (dh - rect.h) / 2 + (adj.dy || 0) * rect.h
    : (adj.dy || 0) * rect.h;
  ctx.drawImage(img, (adj.dx || 0) * rect.w - dw / 2, cyOff - dh / 2, dw, dh);
  ctx.restore();
}

let grainTile = null;
function makeGrainTile() {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 140;
  tile.height = 140;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  grainTile = tile;
  return tile;
}

function fitFont(ctx, text, family, startSize, maxWidth, weight) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawCaption(ctx, state, w, h) {
  const caption = (state.caption || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const bandH = h * (state.layout === 'fullbleed' ? 0.26 : 0.34);
  const scrim = ctx.createLinearGradient(0, h - bandH, 0, h);
  scrim.addColorStop(0, 'rgba(12, 2, 24, 0)');
  scrim.addColorStop(1, 'rgba(12, 2, 24, 0.82)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h - bandH, w, h);

  const baseline = h - h * 0.045;
  if (subtitle) {
    const subSize = fitFont(ctx, subtitle, 'Pacifico, cursive', h * 0.052, w * 0.8, '');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ff8ad8';
    ctx.shadowColor = '#ff2ea6';
    ctx.shadowBlur = subSize * 0.55;
    ctx.fillText(subtitle, w / 2, baseline - h * 0.115);
    ctx.shadowBlur = 0;
  }
  if (!caption) return;
  const capSize = fitFont(ctx, caption, 'Anton, sans-serif', h * 0.115, w * 0.92, '');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160826';
  ctx.lineWidth = Math.max(2, capSize * 0.09);
  ctx.strokeText(caption, w / 2, baseline);
  if (state.gradientCaption) {
    const grad = ctx.createLinearGradient(0, baseline - capSize, 0, baseline);
    grad.addColorStop(0, '#fff7ae');
    grad.addColorStop(0.45, '#ff9a3d');
    grad.addColorStop(1, '#ff2e88');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillText(caption, w / 2, baseline);
}

/**
 * Draws the whole cover onto ctx at size w x h.
 * state: { photos, layout, grade, caption, subtitle, grain, vignette,
 *          gradientCaption, fillAll, adjustments: {panelIndex: {dx, dy, zoom}} }
 */
export function drawCover(ctx, state, w, h) {
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#150a24';
  ctx.fillRect(0, 0, w, h);
  const photos = state.photos || [];
  const panels = layoutPanels(state.layout, w, h);
  const gap = state.layout === 'collage' || state.layout === 'fullbleed'
    ? 0
    : Math.max(2, Math.round(Math.min(w, h) * 0.008));
  panels.forEach((rect, i) => {
    if (!photos.length) return;
    const img = state.fillAll ? photos[0] : photos[i % photos.length];
    const adj = (state.adjustments && state.adjustments[i]) || {};
    if (rect.rot) drawTiltedPhoto(ctx, img, rect, adj, w, h);
    else drawPhotoInto(ctx, img, rect, adj, gap);
  });

  // Colour grade: a diagonal gradient map blended over the whole cover,
  // plus a soft tint wash.
  const grade = GRADES[state.grade] ?? GRADES.vice;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, grade.from);
  g.addColorStop(1, grade.to);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  if (state.grain) {
    const tile = makeGrainTile();
    const pattern = ctx.createPattern(tile, 'repeat');
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }
  if (state.vignette) {
    const v = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.45,
      w / 2, h / 2, Math.max(w, h) * 0.75,
    );
    v.addColorStop(0, 'rgba(5, 0, 15, 0)');
    v.addColorStop(1, 'rgba(5, 0, 15, 0.5)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  drawCaption(ctx, state, w, h);
  ctx.restore();
}

/** Renders the cover at export size on a fresh offscreen canvas. */
export function renderCoverCanvas(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas.getContext('2d'), state, w, h);
  return canvas;
}
