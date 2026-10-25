const buttons = document.querySelectorAll(
  '.contact-form__submit, .subscribe__button'
)

const symbols = '!$#%&*!^#}'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

buttons.forEach((button) => {
  const text = button.textContent.trim()
  const letters = Array.from(text)

  const duration = 700
  const updateInterval = 45

  let frameId = null

  if (!button.hasAttribute('aria-label')) {
    button.setAttribute('aria-label', text)
  }

  function reset() {
    cancelAnimationFrame(frameId)
    frameId = null

    button.classList.remove('is-scrambling')
    button.removeAttribute('data-scramble-text')
  }

  function animate() {
    reset()

    if (button.disabled || reducedMotion.matches) return

    const startTime = performance.now()
    let lastUpdate = -Infinity

    button.dataset.scrambleText = text
    button.classList.add('is-scrambling')

    function update(time) {
      const elapsed = time - startTime

      if (elapsed >= duration || button.disabled) {
        reset()
        return
      }

      if (time - lastUpdate >= updateInterval) {
        const progress = elapsed / duration
        const visibleLetters = Math.floor(progress * letters.length)

        button.dataset.scrambleText = letters
          .map((letter, index) => {
            if (index < visibleLetters || /\s/.test(letter)) {
              return letter
            }

            const randomIndex = Math.floor(Math.random() * symbols.length)

            return symbols[randomIndex]
          })
          .join('')

        lastUpdate = time
      }

      frameId = requestAnimationFrame(update)
    }

    update(startTime)
  }

  button.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') animate()
  })

  button.addEventListener('pointerleave', reset)

  button.addEventListener('focus', () => {
    if (button.matches(':focus-visible')) animate()
  })

  button.addEventListener('blur', reset)

  button.form?.addEventListener('submit', reset, true)

  reducedMotion.addEventListener('change', reset)
})
