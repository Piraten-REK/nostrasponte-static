export function markExternalLinks () {
  const regEx = /^(?:https?:)\/\/(?:www\.)?(?:piraten-rek\.de|piratenpartei-rhein-erft.de)|^\/[^/]?|^#|javascript:/
  document.querySelectorAll('a').forEach(it => {
    if (regEx.test(it.getAttribute('href')) || it.classList.contains('link--no-mark')) return
    const insert = document.createElement('span')
    insert.classList.add('external-link__insert')
    if (it.innerText.indexOf(' ') === -1) {
      insert.innerHTML = it.innerHTML
      it.innerHTML = ''
    } else {
      const p = it.innerText.lastIndexOf(' ') + 1
      insert.innerText = it.innerText.slice(p)
      it.innerText = it.innerText.slice(0, p)
    }
    it.appendChild(insert)
  })
}

export function markMailLinks () {
  document.querySelectorAll('a[href^="mailto:"]').forEach(it => {
    if (it.classList.contains('link--no-mark')) return
    const insert = document.createElement('span')
    insert.classList.add('mail-link__insert')
    if (it.innerText.indexOf('@') === -1) {
      insert.innerHTML = it.innerHTML
      it.innerHTML = ''
    } else {
      const p = it.innerText.indexOf('@')
      insert.innerText = it.innerText.slice(p)
      it.innerText = it.innerText.slice(0, p)
    }
    it.appendChild(insert)
  })
}
