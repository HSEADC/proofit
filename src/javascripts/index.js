const contact = document.querySelector('.contact')
const columnsContainer = document.querySelector('.columns')

if (contact && columnsContainer) {
  const colors = ['#D9E4FF', '#B8EF31', '#93B2FF']

  const columnCount = 14
  const dotsInRow = 5

  const protectedElements = contact.querySelectorAll(
    '.contact__title, .contact__intro, ' +
      '.contact-form, .contact-form__status, .socials'
  )

  const columns = []

  for (let index = 0; index < columnCount; index++) {
    const element = document.createElement('div')

    element.className = 'columns__item'
    element.style.color = colors[index % colors.length]

    columnsContainer.append(element)

    columns.push({
      element,

      phase: index % 2 === 0 ? 0 : Math.PI,

      duration: 6000 + index * 250
    })
  }

  function createRow() {
    const row = document.createElement('div')
    row.className = 'columns__row'

    for (let index = 0; index < dotsInRow; index++) {
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
  const form = contact.querySelector('.contact-form')
  const socials = contact.querySelector('.socials')

  function animate(time) {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)

    const dotSize = 6 * rem
    const rowGap = 6 * rem
    const safeGap = 24 * rem
    const maxHeight = 300 * rem

    const area = columnsContainer.getBoundingClientRect()
    const formRect = form.getBoundingClientRect()
    const socialsRect = socials.getBoundingClientRect()

    const obstacles = Array.from(protectedElements)
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)

    const columnRects = columns.map(({ element }) =>
      element.getBoundingClientRect()
    )

    const rowCounts = columns.map((column, index) => {
      const rect = columnRects[index]

      const isEdge = index === 0 || index === columns.length - 1

      const heightLimit = isEdge ? 360 * rem : maxHeight

      let availableHeight = Math.min(heightLimit, area.height)

      const isUnderForm =
        rect.right > formRect.left - safeGap &&
        rect.left < formRect.right + safeGap

      if (isUnderForm) {
        const heightBelowSocials = area.bottom - socialsRect.bottom - 60

        availableHeight = Math.min(availableHeight, heightBelowSocials)
      }

      obstacles.forEach((obstacle) => {
        const overlapsHorizontally =
          rect.right > obstacle.left - safeGap &&
          rect.left < obstacle.right + safeGap

        if (overlapsHorizontally) {
          const heightBelowElement = area.bottom - obstacle.bottom - safeGap

          availableHeight = Math.min(availableHeight, heightBelowElement)
        }
      })

      availableHeight = Math.max(0, availableHeight)

      const maxRows = Math.max(
        0,
        Math.floor((availableHeight + rowGap) / (dotSize + rowGap))
      )

      const elapsed = time - startTime

      const wave =
        (Math.sin((elapsed / column.duration) * Math.PI * 2 + column.phase) +
          1) /
        2

      const minRows = Math.min(2, maxRows)

      return Math.min(maxRows, Math.round(minRows + wave * (maxRows - minRows)))
    })

    columns.forEach((column, index) => {
      updateRows(column.element, rowCounts[index])
    })

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}
