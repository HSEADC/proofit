import './button-text.js'

const hero = document.querySelector('.about-hero, .case-hero')
const container = hero?.querySelector('.columns')

const leftGroup = container?.querySelector('.columns__group--left')

const rightGroup = container?.querySelector('.columns__group--right')

if (hero && container && leftGroup && rightGroup) {
  const isCase = hero.classList.contains('case-hero')

  const settings = isCase
    ? [
        { color: '#E2FF98', start: 26, min: 20, max: 30 },
        { color: '#B8EF31', start: 15, min: 10, max: 18 },
        { color: '#E2FF98', start: 7, min: 3, max: 10 },

        { color: '#E2FF98', start: 7, min: 3, max: 10 },
        { color: '#B8EF31', start: 15, min: 10, max: 18 },
        { color: '#E2FF98', start: 26, min: 20, max: 30 }
      ]
    : [
        { color: '#D9E4FF', start: 6, min: 4, max: 10 },
        { color: '#B8EF31', start: 17, min: 12, max: 21 },
        { color: '#93B2FF', start: 12, min: 6, max: 15 },
        { color: '#D9E4FF', start: 5, min: 2, max: 9 },
        { color: '#B8EF31', start: 2, min: 0, max: 4 },

        { color: '#D9E4FF', start: 3, min: 0, max: 5 },
        { color: '#B8EF31', start: 7, min: 3, max: 11 },
        { color: '#93B2FF', start: 10, min: 5, max: 14 },
        { color: '#B8EF31', start: 21, min: 15, max: 25 },
        { color: '#D9E4FF', start: 8, min: 4, max: 11 }
      ]

  const protectedElements = hero.querySelectorAll(
    '.about-hero__title, .about-hero__text, ' +
      '.case-hero__title, .case-hero__summary'
  )

  const columns = settings.map((setting, index) => {
    const element = document.createElement('div')
    element.className = 'columns__item'
    element.style.color = setting.color

    const group = index < settings.length / 2 ? leftGroup : rightGroup
    group.append(element)

    const progress = (setting.start - setting.min) / (setting.max - setting.min)

    const initialPhase = Math.asin(progress * 2 - 1)

    const phase = index % 2 === 0 ? initialPhase : Math.PI - initialPhase

    return {
      ...setting,
      element,
      phase,
      duration: 6000 + index * 250
    }
  })

  function createRow() {
    const row = document.createElement('div')
    row.className = 'columns__row'

    for (let index = 0; index < 5; index++) {
      const dot = document.createElement('span')
      dot.className = 'columns__dot'
      row.append(dot)
    }

    return row
  }

  function updateRows(element, count) {
    while (element.children.length < count) {
      element.prepend(createRow())
    }

    while (element.children.length > count) {
      element.firstElementChild.remove()
    }
  }

  const startTime = performance.now()

  function animate(time) {
    const rootStyles = getComputedStyle(document.documentElement)
    const rem = parseFloat(rootStyles.fontSize)

    const dotSize = 6 * rem

    const rowGap = parseFloat(getComputedStyle(columns[0].element).rowGap)

    const safeGap = parseFloat(rootStyles.getPropertyValue('--space-24')) * rem

    const area = container.getBoundingClientRect()

    const obstacles = Array.from(protectedElements)
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)

    const columnRects = columns.map(({ element }) =>
      element.getBoundingClientRect()
    )

    const rowCounts = columns.map((column, index) => {
      const rect = columnRects[index]

      if (rect.width === 0) return 0

      let availableHeight = area.height

      obstacles.forEach((obstacle) => {
        const overlapsHorizontally =
          rect.right > obstacle.left - safeGap &&
          rect.left < obstacle.right + safeGap

        if (overlapsHorizontally) {
          const heightBelowText = area.bottom - obstacle.bottom - safeGap

          availableHeight = Math.min(availableHeight, heightBelowText)
        }
      })

      availableHeight = Math.max(0, availableHeight)

      const safeRows = Math.max(
        0,
        Math.floor((availableHeight + rowGap) / (dotSize + rowGap))
      )

      const elapsed = time - startTime

      const wave =
        (Math.sin((elapsed / column.duration) * Math.PI * 2 + column.phase) +
          1) /
        2

      const desiredRows = Math.round(
        column.min + wave * (column.max - column.min)
      )

      return Math.min(desiredRows, safeRows)
    })

    columns.forEach((column, index) => {
      updateRows(column.element, rowCounts[index])
    })

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}
