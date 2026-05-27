/* ✦ spiral-meteors.js — espirais pretos cintilantes na seção Sobre ✦ */

(function () {

  const style = document.createElement('style')
  style.textContent = `
    .sobre {
      position: relative;
      overflow: hidden;
    }
    .spiral-meteor {
      position: absolute;
      pointer-events: none;
      z-index: 0;
      line-height: 1;
      user-select: none;
      will-change: transform, opacity, filter;
      color: #000;
      transform-origin: center center;
    }
  `
  document.head.appendChild(style)

  function getSection() {
    return document.querySelector('.sobre')
  }

  /* Desenha uma espiral SVG estilo caracol em preto */
  function makeSpiralSVG(size) {
    const s = size
    const cx = s / 2, cy = s / 2

    /* Gera pontos de uma espiral de Arquimedes */
    let path = ''
    const turns = 3.2
    const points = 180
    let firstMove = true
    for (let i = 0; i <= points; i++) {
      const t   = (i / points) * turns * Math.PI * 2
      const r   = (i / points) * (s * 0.42)
      const x   = cx + Math.cos(t) * r
      const y   = cy + Math.sin(t) * r
      if (firstMove) { path += `M ${x} ${y} `; firstMove = false }
      else           { path += `L ${x} ${y} ` }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
      <path d="${path}" stroke="black" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
  }

  function spawnSpiral() {
    const section = getSection()
    if (!section) return

    const el = document.createElement('img')
    el.classList.add('spiral-meteor')

    const W = section.offsetWidth
    const H = section.offsetHeight

    const size    = 24 + Math.random() * 56           /* 24–80px */
    const startX  = -size + Math.random() * (W + size * 2)
    const startY  = -size * 2
    const angle   = 25 + Math.random() * 50           /* diagonal 25–75° */
    const speed   = 5 + Math.random() * 8             /* 5–13s — devagar */
    const spinSpeed = (0.8 + Math.random() * 2.5) * (Math.random() > 0.5 ? 1 : -1)

    /* cintilância: frequência e amplitude aleatórias */
    const glitchFreq = 1.5 + Math.random() * 3        /* Hz */
    const glitchAmp  = 0.35 + Math.random() * 0.45   /* quanta variação de opacidade */

    el.src             = makeSpiralSVG(size)
    el.style.width     = size + 'px'
    el.style.height    = size + 'px'
    el.style.position  = 'absolute'
    el.style.left      = startX + 'px'
    el.style.top       = startY + 'px'
    el.style.opacity   = '0'

    section.appendChild(el)

    const rad       = (angle * Math.PI) / 180
    const totalDist = Math.max(W, H) * 2.2
    const vx        = Math.cos(rad) * totalDist
    const vy        = Math.sin(rad) * totalDist
    const totalTime = speed * 1000
    let startTime   = null
    let lastNow     = null
    let currentRot  = Math.random() * 360

    function animate(now) {
      if (!startTime) { startTime = now; lastNow = now }
      const dt = now - lastNow
      lastNow  = now
      const t  = Math.min((now - startTime) / totalTime, 1)

      /* fade in/out */
      const fade = t < 0.12 ? t / 0.12 : t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1

      /* cintilância — senoide rápida sobreposta ao fade */
      const twinkle  = Math.sin((now / 1000) * glitchFreq * Math.PI * 2)
      const opacity  = Math.max(0, fade * (1 - glitchAmp * 0.5 + twinkle * glitchAmp * 0.5))

      /* brilho pulsante via filter brightness */
      const brightness = 0.6 + (twinkle * 0.5 + 0.5) * 1.2   /* 0.6 → 1.8 */
      const blur       = (1 - fade) * 3                        /* entra levemente desfocada */

      const x = startX + vx * t
      const y = startY + vy * t
      currentRot += spinSpeed * (dt / 16.67)

      const sc = 0.45 + fade * 0.55

      el.style.left      = x + 'px'
      el.style.top       = y + 'px'
      el.style.transform = `rotate(${currentRot}deg) scale(${sc})`
      el.style.opacity   = opacity.toFixed(3)
      el.style.filter    = `brightness(${brightness.toFixed(2)}) blur(${blur.toFixed(1)}px) drop-shadow(0 0 ${(2 + twinkle * 3).toFixed(1)}px rgba(0,0,0,0.6))`

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        el.remove()
      }
    }

    requestAnimationFrame(animate)
  }

  function burstSpawn(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(spawnSpiral, i * 200)
    }
  }

  function scheduleNext() {
    const delay = 500 + Math.random() * 700
    setTimeout(() => {
      const count = Math.random() > 0.35 ? 2 : 1
      burstSpawn(count)
      scheduleNext()
    }, delay)
  }

  function init() {
    const section = getSection()
    if (!section) {
      window.addEventListener('DOMContentLoaded', init)
      return
    }

    let running = false

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !running) {
          running = true
          for (let i = 0; i < 10; i++) {
            setTimeout(spawnSpiral, i * 250)
          }
          scheduleNext()
        }
      })
    }, { threshold: 0.05 })

    observer.observe(section)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()