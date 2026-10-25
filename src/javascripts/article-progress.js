const article = document.querySelector('.case-body')

if (article) {
  const headings = Array.from(article.querySelectorAll(':scope > section > h2'))

  if (headings.length) {
    initArticleProgress(article, headings)
  }
}

function initArticleProgress(article, headings) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const animations = new WeakMap()

  const nav = document.createElement('nav')
  nav.className = 'article-progress'
  nav.setAttribute('aria-label', 'Разделы статьи')
  nav.hidden = true
  nav.inert = true

  const list = document.createElement('ol')
  list.className = 'article-progress__list'

  nav.append(list)
  document.body.append(nav)

  function animateTo(element, target) {
    const computed = getComputedStyle(element)
    const from = {}

    Object.keys(target).forEach((property) => {
      from[property] = computed[property]
    })

    animations.get(element)?.cancel()
    Object.assign(element.style, target)

    const animation = element.animate([from, target], {
      duration: reducedMotion.matches ? 0 : 220,
      easing: 'ease-out'
    })

    animations.set(element, animation)

    return animation
  }

  const items = headings.map((heading) => {
    const title = heading.textContent.replace(/[ \t\r\n]+/g, ' ').trim()

    const item = document.createElement('li')
    const button = document.createElement('button')
    const dot = document.createElement('span')
    const label = document.createElement('span')

    button.type = 'button'
    button.className = 'article-progress__button'
    button.setAttribute('aria-label', 'Перейти к разделу: ' + title)

    dot.className = 'article-progress__dot'
    dot.setAttribute('aria-hidden', 'true')

    label.className = 'article-progress__label'
    label.textContent = title
    label.setAttribute('aria-hidden', 'true')

    button.append(dot, label)
    item.append(button)
    list.append(item)

    function showLabel() {
      animateTo(label, {
        opacity: '1',
        transform: 'translate(0, -50%)'
      })
    }

    function hideLabel() {
      animateTo(label, {
        opacity: '0',
        transform: 'translate(16rem, -50%)'
      })
    }

    button.addEventListener('pointerenter', showLabel)

    button.addEventListener('pointerleave', () => {
      if (document.activeElement !== button) {
        hideLabel()
      }
    })

    button.addEventListener('focus', showLabel)

    button.addEventListener('blur', () => {
      if (!button.matches(':hover')) {
        hideLabel()
      }
    })

    button.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        hideLabel()
      }
    })

    button.addEventListener('click', () => {
      const top =
        window.scrollY +
        heading.getBoundingClientRect().top -
        window.innerHeight * 0.4

      window.scrollTo({
        top: Math.max(0, top),
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      })
    })

    return { button, hideLabel }
  })

  let visible = false
  let activeIndex = -1
  let frame = 0

  function setVisible(show) {
    if (visible === show) return

    visible = show

    if (show) {
      nav.hidden = false
    }

    nav.inert = !show

    if (!show) {
      items.forEach((item) => item.hideLabel())
    }

    const animation = animateTo(nav, {
      opacity: show ? '1' : '0',
      transform: show ? 'translate(0, -50%)' : 'translate(16rem, -50%)'
    })

    if (!show) {
      animation.finished
        .then(() => {
          if (!visible) {
            nav.hidden = true
          }
        })
        .catch(() => {})
    }
  }

  function updateProgress() {
    const middle = window.innerHeight * 0.4

    const tops = headings.map((heading) => heading.getBoundingClientRect().top)

    const bottom = article.getBoundingClientRect().bottom

    let current = 0

    tops.forEach((top, index) => {
      if (top <= middle + 1) {
        current = index
      }
    })

    if (current !== activeIndex) {
      activeIndex = current

      items.forEach(({ button }, index) => {
        button.classList.toggle('is-read', index < current)

        if (index === current) {
          button.setAttribute('aria-current', 'location')
        } else {
          button.removeAttribute('aria-current')
        }
      })
    }

    const insideArticle = tops[0] <= middle + 1 && bottom > middle

    setVisible(insideArticle)
  }

  function scheduleUpdate() {
    if (frame) return

    frame = requestAnimationFrame(() => {
      frame = 0
      updateProgress()
    })
  }

  window.addEventListener('scroll', scheduleUpdate, {
    passive: true
  })

  window.addEventListener('resize', scheduleUpdate)
  window.addEventListener('load', scheduleUpdate)

  document.fonts.ready.then(scheduleUpdate)

  const observer = new ResizeObserver(scheduleUpdate)
  observer.observe(article)

  scheduleUpdate()
}
