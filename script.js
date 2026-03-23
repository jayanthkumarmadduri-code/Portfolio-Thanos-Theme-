// ─── Direct File Execution Check ───────────────────────────────────────────
if (window.location.protocol === 'file:') {
  alert('Warning: You are viewing this file directly. 3D models and textures will NOT load due to browser security (CORS) rules.\n\nPlease double-click the "run.bat" script in the folder to start the local web server and view the portfolio correctly.');
}

// ─── THREE.js Scene Setup ───────────────────────────────────────────────────

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)

document
  .getElementById('canvas-container')
  .appendChild(renderer.domElement)

const light = new THREE.PointLight(0xffffff, 1)
light.position.set(10, 10, 10)
scene.add(light)

const ambientLight = new THREE.AmbientLight(0x404040, 2)
scene.add(ambientLight)

const textureLoader = new THREE.TextureLoader()
textureLoader.load('space.jpg', function (texture) {
  scene.background = texture
}, undefined, function (error) {
  console.error('Error loading space.jpg:', error)
})

const loader = new THREE.GLTFLoader()
let gauntlet

loader.load('gauntlet.glb', function (gltf) {
  gauntlet = gltf.scene
  
  // Make it medium size (1.0 instead of 2.0)
  gauntlet.scale.set(1.1, 1.1, 1.1)
  
  // Center it correctly in view (lower it down slightly so the hand sits in middle)
  gauntlet.position.set(0, -1.5, 0)
  
  scene.add(gauntlet)
}, undefined, function (error) {
  console.error('Error loading gauntlet.glb:', error)
})

camera.position.z = 5

function animate() {
  requestAnimationFrame(animate)
  if (gauntlet) {
    gauntlet.rotation.y += 0.01
  }
  renderer.render(scene, camera)
}
animate()

// ─── Background Music ───────────────────────────────────────────────────────

const bgMusic = new Audio('The Avengers.mp3')
bgMusic.loop = true
bgMusic.volume = 0.5 // Adjust volume as needed
let isMusicPlaying = false

const musicBtn = document.getElementById('musicToggle')
const musicIcon = musicBtn.querySelector('i')

musicBtn.addEventListener('click', () => {
  if (isMusicPlaying) {
    bgMusic.pause()
    isMusicPlaying = false
    musicBtn.classList.add('muted')
    musicIcon.classList.remove('fa-volume-up')
    musicIcon.classList.add('fa-volume-mute')
  } else {
    bgMusic.play().catch(err => console.warn('Audio play blocked:', err))
    isMusicPlaying = true
    musicBtn.classList.remove('muted')
    musicIcon.classList.remove('fa-volume-mute')
    musicIcon.classList.add('fa-volume-up')
  }
})

// ─── Snap Sound (Marvel Thanos snap.mp3) ────────────────────────────────────

function playSnapSound() {
  const audio = new Audio('snap.mp3')
  audio.volume = 1.0
  audio.play().catch(err => console.warn('Audio play blocked:', err))
}

// ─── Particle Dust Disintegration ───────────────────────────────────────────

function dustDisintegrate(el, onDone) {
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    el.style.display = 'none'
    if (onDone) onDone()
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = rect.width
  canvas.height = rect.height
  canvas.style.cssText = `
    position: fixed;
    left: ${rect.left + window.scrollX}px;
    top: ${rect.top + window.scrollY}px;
    pointer-events: none;
    z-index: 9999;
  `
  document.body.appendChild(canvas)

  const ctx2d = canvas.getContext('2d')
  const PARTICLE_COUNT = 140
  const particles = []
  const colors = ['#a855f7', '#7c3aed', '#ec4899', '#f59e0b', '#ffffff', '#6366f1', '#fbbf24']

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      size: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 1.8) * 5,
      alpha: 1,
      decay: Math.random() * 0.018 + 0.012,
    })
  }

  el.style.transition = 'opacity 0.25s ease'
  el.style.opacity = '0'

  function tick() {
    ctx2d.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false
    for (const p of particles) {
      if (p.alpha <= 0) continue
      alive = true
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.12
      p.alpha -= p.decay
      ctx2d.globalAlpha = Math.max(0, p.alpha)
      ctx2d.fillStyle = p.color
      ctx2d.beginPath()
      ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx2d.fill()
    }
    ctx2d.globalAlpha = 1
    if (alive) {
      requestAnimationFrame(tick)
    } else {
      canvas.remove()
      el.style.display = 'none'
      if (onDone) onDone()
    }
  }
  requestAnimationFrame(tick)
}

// ─── Materialize (reverse snap) ─────────────────────────────────────────────

function materialize(el, delay) {
  setTimeout(() => {
    el.style.display = ''
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.5s ease'
    // Particle burst expanding inward effect
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1'
      })
    })
  }, delay)
}

// ─── Thanos Two-Click Snap Logic ─────────────────────────────────────────────

let snapState = 0          // 0 = whole, 1 = snapped
let snappedElements = []   // stores {el, parent, nextSibling} for restore

const btn = document.getElementById('snapButton')

btn.onclick = function () {
  if (snapState === 0) {
    // ── FIRST CLICK: Remove half ──────────────────────────────────────────
    playSnapSound()

    const snappable = [
      ...document.querySelectorAll(
        'section, .card, #about p, #skills li, #resume a, .socials a, h2'
      )
    ]

    const visible = snappable.filter(el => {
      const s = window.getComputedStyle(el)
      return s.display !== 'none' && s.visibility !== 'hidden'
    })

    const shuffled = visible.sort(() => Math.random() - 0.5)
    const half = shuffled.slice(0, Math.ceil(shuffled.length / 2))

    snappedElements = half.map(el => ({
      el,
      parent: el.parentNode,
      nextSibling: el.nextSibling
    }))

    half.forEach((el, i) => {
      setTimeout(() => dustDisintegrate(el), i * 70)
    })

    btn.textContent = '💥 Snapped!'
    btn.style.background = '#cc0000'
    btn.style.transform = 'scale(1.15)'
    setTimeout(() => {
      btn.style.transform = 'scale(1)'
      btn.style.background = '#222'
      btn.style.border = '2px solid #6b2cff'
      btn.textContent = '✨ Bring Back'
    }, 700)

    snapState = 1

  } else {
    // ── SECOND CLICK: Restore all ─────────────────────────────────────────
    playSnapSound()

    snappedElements.forEach(({ el, parent, nextSibling }, i) => {
      // Re-insert into DOM at original position
      if (nextSibling && parent.contains(nextSibling)) {
        parent.insertBefore(el, nextSibling)
      } else {
        parent.appendChild(el)
      }
      materialize(el, i * 60)
    })

    snappedElements = []

    btn.textContent = '✨ Restoring...'
    btn.style.background = '#1a7a1a'
    btn.style.border = 'none'
    btn.style.transform = 'scale(1.1)'
    setTimeout(() => {
      btn.style.transform = 'scale(1)'
      btn.style.background = '#6b2cff'
      btn.style.border = 'none'
      btn.textContent = 'Snap'
    }, 800)

    snapState = 0
  }
}