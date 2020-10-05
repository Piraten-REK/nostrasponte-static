/**
 * @file Scroll related stuff
 * @module 'scroll'
 * @exports toggleBack2TopButton
 */

import { mediaMd } from './responsive.js'

/**
 * Adds the CSS class `back-to-top__visible` to the element with id `back-to-top`
 * if the user scrolled down at least 60% of the viewports height.
 * Does not fire when the pages total height is eqqual to the viewport
 *
 * @author Mike Kühnapfel <mike.kuehnapfel@piraten-rek.de>
 * @since 1.0.0
 * @function
 */
export const toggleBack2TopButton = () => {
  const totalHeight = document.querySelector('html').scrollHeight
  const viewportHeight = document.documentElement.clientHeight
  const scrolled = window.scrollY
  const show = (scrolled >= viewportHeight * 0.6 || scrolled === totalHeight - viewportHeight) && viewportHeight !== totalHeight

  /** @type {HTMLButtonElement} */
  const btn = document.querySelector('#back-to-top')

  if (!btn.classList.contains('back-to-top__visible') && show) {
    btn.classList.toggle('back-to-top__visible')
    if (btn.hasAttribute('tabindex')) btn.removeAttribute('tabindex')
    btn.style.animation = ''
  } else if (btn.classList.contains('back-to-top__visible') && !show) {
    btn.classList.toggle('back-to-top__visible')
    btn.setAttribute('tabindex', -1)
  }
}

export const sliderNav = {
  buttonClick: () => document.querySelectorAll('.slider__nav-arrows button').forEach((/** @type {HTMLButtonElement} */ btn) => {
    const slider = btn.parentElement.parentElement.querySelector('.slider__wrapper')

    btn.addEventListener('click', () => {
      const width = slider.clientWidth * (mediaMd() ? 0.5 : 1)

      if (btn.classList.contains('slider__nav-arrows__prev')) {
        slider.scrollBy({ left: -1 * width, behavior: 'smooth' })
      } else if (btn.classList.contains('slider__nav-arrows__next')) {
        slider.scrollBy({ left: width, behavior: 'smooth' })
      }
    })
  }),

  buttonShow: () => document.querySelectorAll('.slider__wrapper').forEach(it => {
    const children = it.children

    const helper = () => {
      const maxScroll = Array.from(children).reduce((prev, cur) => prev + cur.getBoundingClientRect().width, 0) - (children[0].getBoundingClientRect().width * (mediaMd() ? 2 : 1))
      const scrolled = Math.abs(children[0].getBoundingClientRect().left - it.getBoundingClientRect().left)

      const atStart = !scrolled || scrolled === 0
      const atEnd = scrolled === maxScroll

      const prev = it.parentElement.querySelector('.slider__nav-arrows__prev')
      const next = it.parentElement.querySelector('.slider__nav-arrows__next')

      if (
        (atStart && !prev.classList.contains('slider__nav-arrows__prev--disabled')) ||
        prev.classList.contains('slider__nav-arrows__prev--disabled')
      ) prev.classList.toggle('slider__nav-arrows__prev--disabled')
      if (
        (atEnd && !next.classList.contains('slider__nav-arrows__next--disabled')) ||
        next.classList.contains('slider__nav-arrows__next--disabled')
      ) next.classList.toggle('slider__nav-arrows__next--disabled')
    }

    it.addEventListener('scroll', helper)
    helper()
  }),

  sliderNav: () => document.querySelectorAll('.slider').forEach(slider => {
    const wrapper = slider.querySelector('.slider__wrapper')
    const children = wrapper.children
    const dots = Array.from(slider.querySelectorAll('.slider__nav span'))
    let matrix = new Array(dots.length).fill(false)

    const helper = () => {
      const scrolled = Math.abs(children[0].getBoundingClientRect().left - wrapper.getBoundingClientRect().left)
      const childrenWidth = children[0].getBoundingClientRect().width
      const activeChild = Math.round(scrolled / childrenWidth)

      if (!matrix[activeChild]) {
        matrix = matrix.map(() => false)
        matrix[activeChild] = true

        dots.forEach(it => { if (it.classList.contains('slider__nav__active')) it.classList.remove('slider__nav__active') })
        dots[activeChild].classList.add('slider__nav__active')
        if (mediaMd()) dots[activeChild + 1].classList.add('slider__nav__active')
      }
    }

    wrapper.addEventListener('scroll', helper)
    helper()

    dots.forEach((it, index) => it.addEventListener('click', () => {
      const childrenWidth = children[0].getBoundingClientRect().width
      const scrolled = Math.abs(children[0].getBoundingClientRect().left - wrapper.getBoundingClientRect().left)
      wrapper.scrollBy({ left: (Math.round(scrolled / childrenWidth) - index) * -childrenWidth, behavior: 'smooth' })
    }))
  })
}
