/**
 * @file Nostrasponte Calendar Widget
 * @description This file depends on the {@link https://github.com/Piraten-REK/calendar-api Calder API} which was written explicitly for this use case
 *
 * @author Mike Kühnapfel <mike.kuehnapfel@piraten-rek.de>
 * @version 1.0.0
 */

import Widget from './Widget.js'

/**
 * Map of created widgets identified by their parent DOM element
 * @type {Map<HTMLElement, Widget>}
 */
export const widgets = new Map()

export default function init () {
  document.querySelectorAll('[class*="ns-calendar-container"]').forEach(it => createWidget(it))
}

/**
 * Creates a widget and adds it to the widgets map
 * @param {HTMLElement} parent parent DOM element of the widget
 * @see widgets
 */
export async function createWidget (parent) {
  /** @type {HTMLElement} */
  const placeholder = parent.querySelector('.nostrasponte-calendar-widget__placeholder')
  const ds = new Map(Object.keys(placeholder.dataset).map(key => [key, placeholder.dataset[key]]))

  /** @type {WidgetData} */
  const data = {
    url: ds.get('url')
  }
  if (ds.has('next')) data.next = ds.get('next')
  if (ds.has('prev')) data.prev = ds.get('prev')
  if (ds.has('eventSingular')) data.eventStringSingular = ds.get('eventSingular')
  if (ds.has('eventPlural')) data.eventStringPlural = ds.get('eventPlural')
  if (ds.has('eventNone')) data.eventStringNone = ds.get('eventNone')
  if (ds.has('days')) data.days = ds.get('days').split(',')
  if (ds.has('months')) data.months = ds.get('months').split(',')

  widgets.set(parent, new Widget(parent, data))

  widgets.get(parent).print()
    .then(() => placeholder.remove())
    .catch(e => console.error(e))
}

/**
 * @typedef {Object} WidgetData
 * @property {string} url url to retrieve API data from
 * @property {string=} next string to be inserted in next button
 * @property {string=} prev string to be inserted in prev button
 * @property {string=} eventStringSingular content of title attribute for days with a single event, default `Ein Termin`
 * @property {string=} eventStringPlural content of title attribute for days with multiple events, default `$num Termine`
 * @property {string=} eventStringNone content of title attribute for days without an event, default `Keine Termine`
 * @property {string=} className className of table element and base className for it's children (BEM naming convention), default `nostrasponte-calendar-widget`
 * @property {string=} id optional id for table element
 * @property {string[]=} days name of weeks days, starting with monday, defaults to the German names
 * @property {string[]=} months name of months, defaults to the German names
 */
