import { initForm } from '@formspree/ajax'

const form = document.querySelector('#contact-form')

if (form) {
  const submitButton = form.querySelector('[data-fs-submit-btn]')
  const submitLabel = submitButton.textContent.trim()

  initForm({
    formElement: form,
    formId: 'xljglvnd',
    useDefaultStyles: false,
    disable: () => {
      form.setAttribute('aria-busy', 'true')
      submitButton.disabled = true
      submitButton.textContent = 'Отправляем…'
    },
    enable: () => {
      form.removeAttribute('aria-busy')
      submitButton.disabled = false
      submitButton.textContent = submitLabel
    },
    onSuccess: () => {
      form.reset()
      form.querySelector('[data-fs-success]').focus()
    },
    onError: () => {
      const errorTarget = form.querySelector('[aria-invalid="true"]') ||
        form.querySelector('[data-fs-error=""]')
      errorTarget.focus()
    },
    onFailure: () => {
      form.querySelector('[data-fs-error=""]').focus()
    }
  })
}
