// Fixed scenes for screenshots, driven by the ?shot= query, like the starter.
//   shot=cover    a full cover drawn at export size (params: photo, caption,
//                 subtitle, layout, grade, size)
//   shot=editor   the editor UI with a sample photo loaded
//   shot=selftest  loads a sample, runs the real export path and writes
//                 PASS/FAIL plus the filename into the DOM for headless checks
// window.__shotReady is set once the scene has painted.
export async function runShot(shot, query, hooks) {
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Sunset Heist';
  const subtitle = query.get('subtitle') ?? 'chase the sunset';
  const layout = query.get('layout') ?? 'hero3';
  const grade = query.get('grade') ?? 'vice';
  const size = query.get('size') ?? '1080x1080';

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    await hooks.renderCover({ photo, caption, subtitle, layout, grade, size });
  } else if (shot === 'editor') {
    await hooks.loadEditor({ photo, caption, subtitle, layout, grade });
  } else if (shot === 'selftest') {
    const result = await hooks.selfTest({ photo, caption, subtitle, layout, grade, size });
    const el = document.getElementById('selftest-result');
    el.textContent = result.ok
      ? `PASS ${result.filename} (${result.bytes} bytes)`
      : `FAIL ${result.error || 'export failed'}`;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
