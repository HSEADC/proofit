const header = document.querySelector('.home-sections')
const menuButton = header?.querySelector('.menu-button')
const menu = header?.querySelector('.site-menu')

if (header && menuButton && menu) {
  const mobile = window.matchMedia('(max-width: 767px)')
  let opened = false
  let scrollPosition = 0
  let background = []

  function measureHeader() {
    const height = header.getBoundingClientRect().height
    document.documentElement.style.setProperty('--header-height', height + 'px')
    document.documentElement.style.setProperty('--menu-top', height + 'px')
  }

  function closeMenu(returnFocus = true) {
    if (!opened) return

    opened = false
    document.body.classList.remove('menu-open')
    document.body.style.removeProperty('--menu-scroll-top')
    menuButton.setAttribute('aria-expanded', 'false')
    menuButton.setAttribute('aria-label', 'Открыть меню')

    background.forEach(({ element, inert }) => {
      element.inert = inert
    })
    background = []

    window.scrollTo(0, scrollPosition)
    if (returnFocus) menuButton.focus({ preventScroll: true })
  }

  function openMenu() {
    if (!mobile.matches || opened) return

    opened = true
    scrollPosition = window.scrollY
    document.body.style.setProperty('--menu-scroll-top', -scrollPosition + 'px')
    document.body.classList.add('menu-open')
    menuButton.setAttribute('aria-expanded', 'true')
    menuButton.setAttribute('aria-label', 'Закрыть меню')

    background = Array.from(document.body.children)
      .filter((element) => element !== header && element.matches('main, footer, nav'))
      .map((element) => ({ element, inert: element.inert }))

    background.forEach(({ element }) => {
      element.inert = true
    })

    measureHeader()
    menu.querySelector('a')?.focus({ preventScroll: true })
  }

  menuButton.addEventListener('click', () => {
    if (opened) closeMenu()
    else openMenu()
  })

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu(false)
  })

  document.addEventListener('keydown', (event) => {
    if (!opened) return

    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
    }

    if (event.key === 'Tab') {
      const elements = Array.from(header.querySelectorAll('a[href], button'))
        .filter((element) => element.getClientRects().length > 0)
      const first = elements[0]
      const last = elements[elements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  })

  mobile.addEventListener('change', () => {
    if (!mobile.matches) closeMenu(false)
    measureHeader()
  })

  window.addEventListener('pageshow', () => closeMenu(false))
  new ResizeObserver(measureHeader).observe(header)
  measureHeader()
}
