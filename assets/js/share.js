import { ifEmpty } from './helpers.js'

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
              const scrollbar = window.innerWidth - document.documentElement.clientWidth | 0
              const el = [...createClipboardElement(
                it.dataset.url,
                ifEmpty(it.dataset.headingText, 'Link kopieren'),
                ifEmpty(it.dataset.btnTitle, 'Link in Zwischenablage kopieren'),
                ifEmpty(it.dataset.closeTitle, 'Dialog schließen'),
                it
              )]
              document.body.appendChild(el[0])
              el[1].focus()
              el[1].select()

              document.body.appendChild(createClipboardDarkener(it))
              document.body.style.overflowY = 'hidden'
              document.body.style.paddingRight = scrollbar + 'px'
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
 * Creates the class name
 * @param {string[]} add Strings to be added
 * @return string
 * @function
 * @private
 */
const className = (...add) => add.reduce((prev, cur) => prev + (cur.slice(0, 2) === '--' ? '' : '__') + cur,
  'site-sidebar__social__link--link')

/**
 * Creates all needed Elements for the `copy-to-clipboard`-mechanism of the social-buttons
 * @param {string} link link to be copied
 * @param {string} head text of heading
 * @param {string} btnTitle title text of button
 * @param {HTMLElement} it Refrence to it
 * @yield {HTMLDivElement|HTMLInputElement} Container element and input element
 * @private
 * @generator
 */
function * createClipboardElement (link, head, btnTitle, closeTitle, it) {
  const container = document.createElement('div')
  container.classList.add(className('container'), 'px-2', 'py-3', 'px-md-3')

  const heading = document.createElement('h3')
  heading.innerText = head
  heading.classList.add(className('container', 'title'), 'mb-2', 'mb-md-3')
  container.appendChild(heading)

  const form = document.createElement('form')
  form.setAttribute('role', 'command')
  form.classList.add(className('container', 'form'))
  container.appendChild(form)

  const input = document.createElement('input')
  input.classList.add(className('container', 'form', 'input'))
  input.type = 'text'
  input.value = link
  input.setAttribute('readonly', '')
  form.appendChild(input)

  const btn = document.createElement('button')
  btn.classList.add(className('container', 'form', 'submit'), 'feather', 'icon-clipboard')
  btn.title = btnTitle
  btn.type = 'submit'
  btn.tabIndex = -1
  btn.addEventListener('click', event => {
    event.preventDefault()

    if (navigator.clipboard) {
      navigator.clipboard.readText(link)
    } else {
      input.select()
      document.execCommand('copy')
    }
    removeClipboard(it)
  })
  form.appendChild(btn)

  const close = document.createElement('button')
  close.classList.add(className('container', 'close'), 'feather', 'icon-x')
  close.title = closeTitle
  close.addEventListener('click', () => removeClipboard(it))
  container.appendChild(close)

  yield container
  yield input
}

function createClipboardDarkener (el) {
  const darkener = document.createElement('div')
  darkener.classList.add('site-sidebar__social__link--link__darkener')
  darkener.addEventListener('click', () => removeClipboard(el))
  return darkener
}

function removeClipboard (el) {
  document.querySelectorAll('.site-sidebar__social__link--link__container, .site-sidebar__social__link--link__darkener')
    .forEach(it => it.remove())
  document.body.style.overflowY = 'initial'
  document.body.style.paddingRight = ''
  linkOpen = false
  el.focus()
}
