const [fallback, shareApi] = [
  document.querySelector('.site-sidebar__social__buttons--fallback'),
  document.querySelector('.site-sidebar__social__buttons--share-api')
]

let linkOpen = false

export default function (test = false) {
  if (!(fallback && shareApi)) return

  if (test || navigator.share) {
    fallback.remove()
    document.querySelector('.site-sidebar__social__buttons--share-api').addEventListener('click', function () {
      navigator.share({
        title: this.dataset.title,
        text: this.dataset.text,
        url: this.dataset.url
      })
    })
  } else {
    shareApi.remove()
    fallback.querySelectorAll('[class^="site-sidebar__social__link"]').forEach((/** @type {HTMLAnchorElement|HTMLButtonElement} */it) => {
      switch (it.className.slice(28)) {
        case 'facebook':
        case 'twitter':
        case 'reddit':
        case 'telegram':
          it.addEventListener('click', event => {
            event.preventDefault()
            window.open(it.href, undefined, 'width=400,height=400,resizable=no,menubar=no,scrollbars=yes')
          })
          break
        case 'link':
          it.addEventListener('click', () => {
            if (!linkOpen) {
              document.body.appendChild(createClipboardElement(it.dataset.url))
              document.body.appendChild(createClipboardDarkener())
              document.body.style.overflowY = 'hidden'
              linkOpen = true
            } else {
              removeClipboard(it)
            }
          })
          break
      }
    })
  }
}

/**
 * Creates all needed Elements for the `copy-to-clipboard`-mechanism of the social-buttons
 * @param {string} link Link to be copied
 * @returns {HTMLDivElement} Container element
 * @private
 */
function createClipboardElement (link) {
  const container = document.createElement('div')
  container.classList.add('site-sidebar__social__link--link__container')

  const heading = document.createElement('h3')
  heading.innerText = 'Link kopieren'
  heading.classList.add('mb-2')
  container.appendChild(heading)

  const wrapper = document.createElement('div')

  const input = document.createElement('input')
  input.type = 'text'
  input.value = link
  input.setAttribute('readonly', 'readonly')
  wrapper.appendChild(input)

  const button = document.createElement('button')
  button.classList.add('feather', 'icon-clipboard')
  button.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.readText(link)
    } else {
      input.select()
      document.execCommand('copy')
    }
    removeClipboard()
  })
  wrapper.appendChild(button)
  container.appendChild(wrapper)

  return container
}

function createClipboardDarkener () {
  const darkener = document.createElement('div')
  darkener.classList.add('site-sidebar__social__link--link__darkener')
  darkener.addEventListener('click', removeClipboard)
  return darkener
}

function removeClipboard (el) {
  document.querySelectorAll('.site-sidebar__social__link--link__container, .site-sidebar__social__link--link__darkener')
    .forEach(it => it.remove())
  document.body.style.overflowY = 'initial'
  linkOpen = false
  el.select()
}
