// Neon Sunset Cover Studio: the editor. Upload photos (they never leave this
// machine), pick a layout and a colour grade, edit the lettering, drag panels
// to reposition each photo, and export a PNG at a post size. A `?shot=` query
// sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, renderCoverCanvas, layoutPanels, LAYOUTS, GRADES } from './cover.js';
import { runShot } from './shots.js';

const preview = document.getElementById('preview');
const pctx = preview.getContext('2d');
const status = document.getElementById('status');
const captionInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const sizeSelect = document.getElementById('export-size');

const state = {
  photos: [],
  layout: 'hero3',
  grade: 'vice',
  caption: 'VICE CITY NIGHTS',
  subtitle: 'chase the sunset',
  grain: true,
  vignette: true,
  gradientCaption: true,
  fillAll: false,
  adjustments: {},
  selectedPanel: 0,
};

function panelCount() {
  return layoutPanels(state.layout, 100, 100).length;
}

function adjustment(i) {
  if (!state.adjustments[i]) state.adjustments[i] = { dx: 0, dy: 0, zoom: 1 };
  return state.adjustments[i];
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function exportSize() {
  const [w, h] = sizeSelect.value.split('x').map(Number);
  return { w, h };
}

function sizePreview() {
  const { w, h } = exportSize();
  const scale = Math.min(720 / w, 720 / h);
  preview.width = Math.round(w * scale);
  preview.height = Math.round(h * scale);
}

function redraw() {
  drawCover(pctx, state, preview.width, preview.height);
}

function refreshPanelSelect() {
  const sel = document.getElementById('panel-select');
  sel.innerHTML = '';
  for (let i = 0; i < panelCount(); i++) {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `Panel ${i + 1}`;
    sel.appendChild(opt);
  }
  sel.value = String(Math.min(state.selectedPanel, panelCount() - 1));
  state.selectedPanel = Number(sel.value);
  const adj = adjustment(state.selectedPanel);
  const zoom = document.getElementById('zoom');
  zoom.value = String(adj.zoom);
  document.getElementById('zoom-value').textContent = `${adj.zoom.toFixed(2)}x`;
}

function refreshPhotoCount() {
  const n = state.photos.length;
  document.getElementById('photo-count').textContent = n === 0
    ? 'No photo yet. Load a sample or upload your own.'
    : `${n} photo${n > 1 ? 's' : ''} loaded${state.fillAll ? ' (one photo fills all panels)' : ''}. Drag a panel to reposition it.`;
}

function buildPicker(containerId, entries, current, onPick) {
  const box = document.getElementById(containerId);
  box.innerHTML = '';
  for (const [key, def] of Object.entries(entries)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = def.label;
    btn.dataset.key = key;
    if (key === current) btn.classList.add('active');
    btn.addEventListener('click', () => {
      onPick(key);
      box.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    });
    box.appendChild(btn);
  }
}

buildPicker('layouts', LAYOUTS, state.layout, (key) => {
  state.layout = key;
  state.selectedPanel = 0;
  refreshPanelSelect();
  redraw();
});
buildPicker('grades', GRADES, state.grade, (key) => {
  state.grade = key;
  redraw();
});

document.getElementById('photo').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  state.photos = await Promise.all(files.map((f) => loadImage(URL.createObjectURL(f))));
  refreshPhotoCount();
  redraw();
});

async function loadSample(name) {
  state.photos = [await loadImage(`samples/${name}.jpg`)];
  refreshPhotoCount();
  redraw();
}
document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard'));
document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier'));

document.getElementById('fill-all').addEventListener('click', (e) => {
  state.fillAll = !state.fillAll;
  e.currentTarget.setAttribute('aria-pressed', String(state.fillAll));
  refreshPhotoCount();
  redraw();
});

captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
document.getElementById('gradient-caption').addEventListener('change', (e) => {
  state.gradientCaption = e.target.checked;
  redraw();
});
document.getElementById('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
document.getElementById('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; redraw(); });
document.getElementById('panel-select').addEventListener('change', (e) => {
  state.selectedPanel = Number(e.target.value);
  const adj = adjustment(state.selectedPanel);
  document.getElementById('zoom').value = String(adj.zoom);
  document.getElementById('zoom-value').textContent = `${adj.zoom.toFixed(2)}x`;
});
document.getElementById('zoom').addEventListener('input', (e) => {
  const adj = adjustment(state.selectedPanel);
  adj.zoom = Number(e.target.value);
  document.getElementById('zoom-value').textContent = `${adj.zoom.toFixed(2)}x`;
  redraw();
});
sizeSelect.addEventListener('change', () => { sizePreview(); redraw(); });

// Drag a panel on the preview to reposition its photo.
let drag = null;
function panelAt(clientX, clientY) {
  const rect = preview.getBoundingClientRect();
  const x = (clientX - rect.left) * (preview.width / rect.width);
  const y = (clientY - rect.top) * (preview.height / rect.height);
  const panels = layoutPanels(state.layout, preview.width, preview.height);
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return { i, x, y };
  }
  return null;
}
preview.addEventListener('pointerdown', (e) => {
  const hit = panelAt(e.clientX, e.clientY);
  if (!hit) return;
  state.selectedPanel = hit.i;
  document.getElementById('panel-select').value = String(hit.i);
  const adj = adjustment(hit.i);
  document.getElementById('zoom').value = String(adj.zoom);
  document.getElementById('zoom-value').textContent = `${adj.zoom.toFixed(2)}x`;
  drag = { i: hit.i, x: hit.x, y: hit.y, dx: adj.dx, dy: adj.dy };
  preview.setPointerCapture(e.pointerId);
});
preview.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = preview.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (preview.width / rect.width);
  const y = (e.clientY - rect.top) * (preview.height / rect.height);
  const panels = layoutPanels(state.layout, preview.width, preview.height);
  const p = panels[drag.i];
  const adj = adjustment(drag.i);
  adj.dx = drag.dx + (x - drag.x) / p.w;
  adj.dy = drag.dy + (y - drag.y) / p.h;
  redraw();
});
preview.addEventListener('pointerup', () => { drag = null; });

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))), 'image/png');
  });
}

/** Renders the cover at the chosen export size and returns its PNG blob. */
export async function exportCover() {
  const { w, h } = exportSize();
  const canvas = renderCoverCanvas(state, w, h);
  const blob = await canvasToBlob(canvas);
  return { filename: `cover-${w}x${h}.png`, blob, bytes: blob.size, w, h };
}

document.getElementById('export').addEventListener('click', async () => {
  try {
    const { filename, blob } = await exportCover();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    status.textContent = `Saved ${filename}`;
  } catch (err) {
    status.textContent = `Export failed: ${err.message}`;
  }
});

// Local fonts (Anton for the caption, Pacifico for the subtitle) must be
// loaded before the first draw, or the canvas falls back to system fonts.
try {
  await Promise.all([
    document.fonts.load('100px Anton'),
    document.fonts.load('60px Pacifico'),
  ]);
} catch {
  // System fonts are the fallback; the cover still renders.
}

sizePreview();
refreshPanelSelect();
refreshPhotoCount();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  await runShot(shot, new URLSearchParams(location.search), {
    async renderCover({ photo, caption, subtitle, layout, grade, size }) {
      const [w, h] = size.split('x').map(Number);
      state.layout = layout in LAYOUTS ? layout : 'hero3';
      state.grade = grade in GRADES ? grade : 'vice';
      state.caption = caption;
      state.subtitle = subtitle;
      state.photos = [await loadImage(`samples/${photo}.jpg`)];
      preview.width = w;
      preview.height = h;
      const scale = Math.min(window.innerWidth / w, window.innerHeight / h);
      preview.style.width = `${Math.floor(w * scale)}px`;
      preview.style.height = `${Math.floor(h * scale)}px`;
      redraw();
    },
    async loadEditor({ photo, caption, subtitle, layout, grade }) {
      state.layout = layout in LAYOUTS ? layout : 'hero3';
      state.grade = grade in GRADES ? grade : 'vice';
      state.caption = caption;
      state.subtitle = subtitle;
      captionInput.value = caption;
      subtitleInput.value = subtitle;
      buildPicker('layouts', LAYOUTS, state.layout, (key) => {
        state.layout = key;
        refreshPanelSelect();
        redraw();
      });
      buildPicker('grades', GRADES, state.grade, (key) => { state.grade = key; redraw(); });
      await loadSample(photo);
      refreshPanelSelect();
    },
    async selfTest({ photo, caption, subtitle, layout, grade, size }) {
      try {
        state.layout = layout in LAYOUTS ? layout : 'hero3';
        state.grade = grade in GRADES ? grade : 'vice';
        state.caption = caption;
        state.subtitle = subtitle;
        state.photos = [await loadImage(`samples/${photo}.jpg`)];
        sizeSelect.value = size;
        const result = await exportCover();
        if (result.bytes < 10000) return { ok: false, error: 'PNG suspiciously small' };
        return { ok: true, filename: result.filename, bytes: result.bytes };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
  });
} else {
  redraw();
}
