/* ✦ cursor-stars.js — estrelas pretas cintilantes no cursor ✦
   Adicione no seu HTML antes do </body>:
   <script src="cursor-stars.js"></script>
*/

(function () {

  /* ── configurações ── */
  const CONFIG = {
    count:       6,        // estrelas por movimento
    sizeMin:     8,        // tamanho mínimo (px)
    sizeMax:     22,       // tamanho máximo (px)
    lifeMin:     500,      // duração mínima (ms)
    lifeMax:     900,      // duração máxima (ms)
    spread:      14,       // espalhamento ao redor do cursor
    shapes:      ['✦', '✧', '★', '✶', '✸', '✺', '❋', '✹'],
  }

  /* ── cursor personalizado ── */
  const style = document.createElement('style')
  style.textContent = `
    *, *::before, *::after { cursor: none !important; }

    #star-cursor {
      position: fixed;
      pointer-events: none;
      z-index: 99999;
      width: 18px;
      height: 18px;
      transform: translate(-50%, -50%);
      transition: transform 0.08s ease;
      font-size: 18px;
      color: #000;
      line-height: 1;
      user-select: none;
      filter: drop-shadow(0 0 2px rgba(0,0,0,0.4));
    }

    .star-particle {
      position: fixed;
      pointer-events: none;
      z-index: 99998;
      transform-origin: center;
      user-select: none;
      color: #000;
      font-style: normal;
      line-height: 1;
      will-change: transform, opacity;
    }
  `
  document.head.appendChild(style)

  /* ── cursor ── */
  const cursor = document.createElement('span')
  cursor.id = 'star-cursor'
  cursor.textContent = '✦'
  document.body.appendChild(cursor)

  /* ── estado ── */
  let mx = -200, my = -200
  let lastX = -200, lastY = -200
  let ticking = false

  /* ── move cursor visual ── */
  function moveCursor(x, y) {
    cursor.style.left = x + 'px'
    cursor.style.top  = y + 'px'
  }

  /* ── cria partícula ── */
  function spawnStar(x, y) {
    const n    = CONFIG.count
    for (let i = 0; i < n; i++) {
      const el   = document.createElement('span')
      el.classList.add('star-particle')

      const shape  = CONFIG.shapes[Math.floor(Math.random() * CONFIG.shapes.length)]
      const size   = CONFIG.sizeMin + Math.random() * (CONFIG.sizeMax - CONFIG.sizeMin)
      const life   = CONFIG.lifeMin + Math.random() * (CONFIG.lifeMax - CONFIG.lifeMin)
      const angle  = Math.random() * Math.PI * 2
      const spread = CONFIG.spread * (0.4 + Math.random() * 0.6)
      const ox     = Math.cos(angle) * spread
      const oy     = Math.sin(angle) * spread
      const rot    = (Math.random() - 0.5) * 120
      const drift  = 28 + Math.random() * 28   // quanto sobe/cai
      const driftX = (Math.random() - 0.5) * 20

      el.textContent      = shape
      el.style.left       = (x + ox) + 'px'
      el.style.top        = (y + oy) + 'px'
      el.style.fontSize   = size + 'px'
      el.style.transform  = 'translate(-50%, -50%) rotate(0deg) scale(1)'
      el.style.opacity    = '1'

      document.body.appendChild(el)

      /* animação manual (rAF) para compatibilidade máxima */
      const start = performance.now()
      function animate(now) {
        const t   = Math.min((now - start) / life, 1)
        const ease = 1 - t               // fade linear
        const scaleV = 1 - t * 0.5      // encolhe até 50%
        const dy   = -drift * t          // sobe
        const dx   = driftX * t

        el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot * t}deg) scale(${scaleV})`
        el.style.opacity   = ease.toFixed(3)

        if (t < 1) {
          requestAnimationFrame(animate)
        } else {
          el.remove()
        }
      }
      requestAnimationFrame(animate)
    }
  }

  /* ── rastro: só dispara se moveu o suficiente ── */
  const THRESHOLD = 8   // pixels mínimos entre disparos

  function onMove(e) {
    const x = e.clientX, y = e.clientY
    mx = x; my = y

    if (!ticking) {
      ticking = true
      requestAnimationFrame(() => {
        moveCursor(mx, my)

        const dx = mx - lastX
        const dy = my - lastY
        if (Math.sqrt(dx * dx + dy * dy) > THRESHOLD) {
          spawnStar(mx, my)
          lastX = mx
          lastY = my
        }
        ticking = false
      })
    }
  }

  /* ── clique: explosão de estrelas ── */
  function onClick(e) {
    const saved = CONFIG.count
    CONFIG.count = 12
    spawnStar(e.clientX, e.clientY)
    CONFIG.count = saved

    /* mini "pulso" no cursor */
    cursor.style.transform = 'translate(-50%, -50%) scale(1.8)'
    setTimeout(() => { cursor.style.transform = 'translate(-50%, -50%) scale(1)' }, 150)
  }

  document.addEventListener('mousemove', onMove, { passive: true })
  document.addEventListener('click',     onClick)

  /* ── esconde cursor fora da janela ── */
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0' })
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1' })

})()
