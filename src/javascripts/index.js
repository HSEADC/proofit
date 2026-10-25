const contact = document.querySelector('.contact')
const columnsContainer = document.querySelector('.columns')

if (contact && columnsContainer) {
  const colors = ['#D9E4FF', '#B8EF31', '#93B2FF']

  const columnCount = 14
  const dotsInRow = 5

  // Элементы, на которые колонки не должны заходить
  const protectedElements = contact.querySelectorAll(
    '.contact__title, .contact__intro, ' +
      '.contact-form, .contact-form__status, .socials'
  )

  const columns = []

  // Создаём колонки один раз
  for (let index = 0; index < columnCount; index++) {
    const element = document.createElement('div')

    element.className = 'columns__item'
    element.style.color = colors[index % colors.length]

    columnsContainer.append(element)

    columns.push({
      element,
      // Соседние колонки начинают движение в разные стороны
      phase: index % 2 === 0 ? 0 : Math.PI,
      // Немного разная скорость
      duration: 6000 + index * 250
    })
  }

  // Создаём один ряд из пяти точек
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

  // Добавляем или удаляем только нужное количество рядов
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
    // Переводим rem в пиксели с учётом масштаба страницы
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

    // Сначала измеряем все колонки, затем меняем HTML
    const columnRects = columns.map(({ element }) =>
      element.getBoundingClientRect()
    )

    const rowCounts = columns.map((column, index) => {
      const rect = columnRects[index]

      // По одной крайней колонке с каждой стороны
      const isEdge = index === 0 || index === columns.length - 1

      const heightLimit = isEdge ? 360 * rem : maxHeight

      let availableHeight = Math.min(heightLimit, area.height)

      // Проверяем, находится ли колонка под формой
      const isUnderForm =
        rect.right > formRect.left - safeGap &&
        rect.left < formRect.right + safeGap

      if (isUnderForm) {
        // Верх колонки остаётся ниже иконок соцсетей
        const heightBelowSocials = area.bottom - socialsRect.bottom - 60

        availableHeight = Math.min(availableHeight, heightBelowSocials)
      }

      obstacles.forEach((obstacle) => {
        const overlapsHorizontally =
          rect.right > obstacle.left - safeGap &&
          rect.left < obstacle.right + safeGap

        if (overlapsHorizontally) {
          // Верх колонки должен оставаться ниже элемента
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

      // Значение плавно меняется от 0 до 1 и обратно
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

    // Запрашиваем следующий кадр — цикл бесконечный
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}
