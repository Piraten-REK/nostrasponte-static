/**
 * @file Main JavaScript file for NostraSponte
 *
 * @requires 'links'
 * @requires 'scroll'
 *
 * @version 1.0.0
 * @author Mike Kühnapfel <mike.kuehnapfel@piraten-rek.de>
 * @license GPLv3
 */

'use strict'

// eslint-disable-next-line no-unused-vars
import { markExternalLinks, markMailLinks } from './links.js'
import { toggleBack2TopButton, sliderNav } from './scroll.js'
import share from './share.js'
import { navToggle } from './nav.js'
import ical from './ical-widget/index.js'

import scrollBehaviorPolyfill from './scroll-behavior-polyfill.js'

if (!('scroll-behavior' in document.documentElement.style)) scrollBehaviorPolyfill()

// markExternalLinks()
markMailLinks()

window.addEventListener('scroll', toggleBack2TopButton)
toggleBack2TopButton()

sliderNav.buttonClick()
sliderNav.buttonShow()
sliderNav.sliderNav()

share(false)

document.querySelectorAll('.em-calendar').forEach(cal => {
  const [prev, next] = [
    cal.querySelector('.em-calnav-prev'),
    cal.querySelector('.em-calnav-next')
  ]
  prev.innerText = ''
  prev.classList.add('feather', 'icon-arrow-left')
  next.innerText = ''
  next.classList.add('feather', 'icon-arrow-right')
})

navToggle()

document.querySelector('#back-to-top').addEventListener('click', function () {
  const focusTo = Array.from(document.querySelectorAll('button, :not(link)[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))[0]
  window.scrollTo({ top: 0, behavior: 'smooth' })
  function setFocus () {
    if (window.scrollY === 0) focusTo.focus()
    else window.requestAnimationFrame(setFocus)
  }
  window.requestAnimationFrame(setFocus)
  this.style.animation = 'none'
})

ical()
