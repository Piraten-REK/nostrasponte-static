// import Time from './Time.js'
import { markExternalLinks } from '../links.js'

const sanitizeRegEx = /(?:<script.*?>.*?<\/script>)|(?:<\/?a.*?>)|(?:(?<=<[^>]*?)on\w+=".*?")|(?:<\/?i?frame.*?>)/g

/**
 * @class Widget
 */
export default class Widget {
  /**
   * @constructs
   * @param {HTMLElement} parent
   * @param {Object} data Widget initialization
   * @param {string} data.url url to retrieve API data from
   * @param {string=} data.next string to be inserted in next button
   * @param {string=} data.prev string to be inserted in prev button
   * @param {string=} data.eventStringSingular content of title attribute for days with a single event, default `Ein Termin`
   * @param {string=} data.eventStringPlural content of title attribute for days with multiple events, default `$num Termine`
   * @param {string=} data.eventStringNone content of title attribute for days without an event, default `Keine Termine`
   * @param {string=} data.className className of table element and base className for it's children (BEM naming convention), default `nostrasponte-calendar-widget`
   * @param {?string} [data.id = none] optional id for table element
   * @param {string[]=} data.days name of weeks days, starting with monday, defaults to the German names
   * @param {string[]=} data.months name of months, defaults to the German names
   */
  constructor (parent, data = {}) {
    /** Parent container
     * @readonly
     */
    this.parent = parent

    /** url to retrieve API data from
     * @type {string}
     * @readonly
     */
    this.url = data.url

    console.log(data.url, this.url)

    /** string to be inserted in next button
     * @type {string}
     * @default '&#xe829;'
     * @readonly
     */
    this.next = Widget._ifEmpty(data.next, '&#xe829;')

    /** string to be inserted in prev button
     * @type {string}
     * @default '&#xe828;'
     * @readonly
     */
    this.prev = Widget._ifEmpty(data.prev, '&#xe828;')

    /** content of title attribute for days with a single event
     * @type {string}
     * @default 'Ein Termin'
     */
    this.eventStringSingular = Widget._ifEmpty(data.eventStringSingular, 'Ein Termin')

    /** content of title attribute for days with multiple events
     * @type {string}
     * @default '$num Termine'
     */
    this.eventStringPlural = Widget._ifEmpty(data.eventStringPlural, '$num Termine')

    /** content of title attribute for days without an event
     * @type {string}
     * @default 'Keine Termine'
     */
    this.eventStringNone = Widget._ifEmpty(data.eventStringNone, 'Keine Termine')

    /** className of table element and base className for it's children (BEM naming convention)
     * @type {string}
     * @default 'nostrasponte-calendar-widget'
     */
    this.className = Widget._ifEmpty(data.className, 'nostrasponte-calendar-widget')

    /** optional id for table element
     * @type {?string}
     * @default null
    */
    this.id = Widget._ifEmpty(data.id, null)

    /** name of weeks days, starting with monday, defaults to the German names
     * @type {string[]}
     * @default ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
     */
    this.days = !Array.isArray(data.days) || data.days.length !== 7 ? ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] : data.days

    /** name of months, defaults to the German names
     * @type {string[]}
     * @default ['Januar', 'Febuar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
     */
    this.months = !Array.isArray(data.months) || data.months.length !== 12 ? ['Januar', 'Febuar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] : data.months

    /** last rendered HTMLElement
     * @type {?HTMLTableElement}
     * @default null
     */
    this.lastRender = null
  }

  /**
   * Returns the object if not empty, else the replacement
   * @template T
   * @template U
   * @param {T} obj
   * @param {U} replacement
   * @returns {T|U}
   * @static
   * @private
   */
  static _ifEmpty (obj, replacement) {
    return obj === null || obj === undefined || isNaN(obj) || obj === '' || obj.length === 0 || obj.size === 0
      ? replacement
      : obj
  }

  /**
   * Prints the Widget
   * @param {number=} month
   * @param {number=} year
   * @returns {Promise<void>}
   * @async
   */
  async print (month = (new Date()).getMonth() + 1, year = (new Date()).getFullYear()) {
    const monthHTML = await this._getMonthHTML(month, year)

    return new Promise(resolve => {
      const table = document.createElement('table')
      table.className = this.className + '__month'
      table.setAttribute('role', 'widget')
      if (this.id) table.id = this.id

      // Header
      const head = document.createElement('thead')
      table.appendChild(head)
      const monthNameRow = document.createElement('tr')
      head.appendChild(monthNameRow)

      const prev = document.createElement('td')
      monthNameRow.appendChild(prev)
      prev.classList.add(this.className + '__prev')
      const prevButton = document.createElement('button')
      prev.appendChild(prevButton)
      prev.innerHTML = this.prev
      prev.addEventListener('click', () => this.print(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year))
      prev.title = this.months[month === 1 ? 11 : month - 2] + ' ' + (month === 1 ? year - 1 : year)

      const monthName = document.createElement('th')
      monthNameRow.appendChild(monthName)
      monthName.classList.add(this.className + '__month-name')
      monthName.innerText = this.months[month - 1].slice(0, 3) + ' ' + year.toString()
      monthName.colSpan = 5

      const next = document.createElement('td')
      monthNameRow.appendChild(next)
      next.classList.add(this.className + '__next')
      const nextButton = document.createElement('button')
      next.appendChild(nextButton)
      next.innerHTML = this.next
      next.addEventListener('click', () => this.print(month === 12 ? 1 : month + 1, month === 12 ? year + 1 : year))
      next.title = this.months[month === 12 ? 0 : month] + ' ' + (month === 12 ? year + 1 : year)

      const dayOfWeekRow = document.createElement('tr')
      head.appendChild(dayOfWeekRow)
      this.days.forEach(day => {
        const th = document.createElement('th')
        dayOfWeekRow.appendChild(th)
        th.innerText = day.slice(0, 2)
      })

      // Body
      table.appendChild(monthHTML)

      if (this.lastRender) this.lastRender.remove()
      this.parent.appendChild(table)

      this.lastRender = table

      resolve()
    })
  }

  /** Returns the HTML for the specified month
   * @param {number} month
   * @param {number} year
   * @returns {Promise<HTMLTableSectionElement>}
   * @private
   * @async
   */
  async _getMonthHTML (month, year) {
    return this._getMonthData(month, year)
      .then(data => new Promise(resolve => {
        const body = document.createElement('tbody')

        for (const week of data) {
          const weekRow = document.createElement('tr')
          body.appendChild(weekRow)
          for (const day of week) {
            const cell = document.createElement('td')
            weekRow.appendChild(cell)
            cell.classList.add(this.className + '__day')

            cell.dataset.day = day.day.toString()
            cell.dataset.month = day.month.toString()
            cell.dataset.year = day.year.toString()

            if (day.events.length > 0) {
              cell.classList.add(this.className + '__day--eventful')
              const btn = document.createElement('button')
              cell.appendChild(btn)
              btn.addEventListener('click', () => {
                const [dialog, darkener] = this._buildDayDialog(day)
                document.body.appendChild(dialog)
                document.body.appendChild(darkener)
                document.body.style.overflow = 'hidden'
              })
              btn.setAttribute('role', 'command')
              const label = document.createElement('span')
              btn.appendChild(label)
              label.classList.add(this.className + '__day__label')
              label.innerText = day.day.toString()
              label.title = day.events.length === 1 ? this.eventStringSingular : this.eventStringPlural.replace(/\$num/g, day.events.length.toString())
            } else {
              cell.classList.add(this.className + '__day--eventless')
              const label = document.createElement('span')
              cell.appendChild(label)
              label.classList.add(this.className + '__day__label')
              label.innerText = day.day.toString()
              label.title = this.eventStringNone
            }

            if (day.month < month) cell.classList.add(this.className + '__day--before')
            if (day.month > month) cell.classList.add(this.className + '__day--after')
            const today = new Date()
            if (day.day === today.getDate() && day.month === today.getMonth() + 1 && day.year === today.getFullYear()) cell.classList.add(this.className + '__day--today')
          }
        }

        resolve(body)
      }))
  }

  /** Builds the dialog for the given day
   * @param {DayInMonth} day
   * @returns {[HTMLDialogElement, HTMLDivElement]}
   * @private
   */
  _buildDayDialog (day) {
    const wrapper = document.createElement('dialog')
    wrapper.classList.add(this.className + '__day__dialog', 'px-2', 'pb-2', 'pt-0')
    wrapper.open = true

    const title = document.createElement('h2')
    wrapper.appendChild(title)
    title.classList.add(this.className + '__day__dialog__title', 'mb-2', 'pt-2', 'pb-1')

    const titleSpan = document.createElement('span')
    title.appendChild(titleSpan)
    titleSpan.innerText = 'Unsere Termine am'

    const titleTime = document.createElement('time')
    title.appendChild(titleTime)
    titleTime.dateTime = `${day.year}-${fixedLengthInt(day.month)}-${fixedLengthInt(day.day)}`
    titleTime.innerText = `${fixedLengthInt(day.day)}. ${this.months[day.month - 1]} ${day.year}`

    /** Helper function that creates event markup
     * @param {Event} event
     * @param {number} id
     * @param {Event[]} arr
     * @returns {HTMLElement}
     * @function
     */
    const createEvent = (event, id, arr) => {
      const evWrapper = document.createElement('article')
      wrapper.appendChild(evWrapper)
      evWrapper.classList.add(this.className + '__day__dialog__event')
      evWrapper.setAttribute('role', 'complementary')

      const evTitle = document.createElement('h3')
      evWrapper.appendChild(evTitle)
      evTitle.classList.add(this.className + '__day__dialog__event__title', 'mb-1')
      evTitle.innerHTML = event.title.replace(sanitizeRegEx, '').replace(/\n/g, '<br>')

      const evTable = document.createElement('table')
      evWrapper.appendChild(evTable)
      const evTBody = document.createElement('tbody')
      evTable.appendChild(evTBody)

      const evTimespan = document.createElement('tr')
      evTBody.appendChild(evTimespan)
      evTimespan.classList.add(this.className + '__day__dialog__event__timespan')
      const evTimespanTh = document.createElement('th')
      evTimespan.appendChild(evTimespanTh)
      const evTimespanThIcon = document.createElement('i')
      evTimespanTh.appendChild(evTimespanThIcon)
      evTimespanThIcon.classList.add('feather', 'icon-clock')
      const evTimespanTd = document.createElement('td')
      evTimespan.appendChild(evTimespanTd)
      if ((event.start.isDate || event.end.isDate) && event.start.compare(event.end) !== 0) {
        evTimespanTd.innerHTML = `ganztägig vom <time datetime="${event.start.toString()}">${event.start.toLocalizedString(this.months)}</time> bis zum <time datetime="${event.end.toString()}">${event.end.toLocalizedString(this.months)}</time>`
      } else if (event.start.isDate || event.end.isDate) {
        evTimespanTd.innerHTML = `ganztägig am <time datetime="${event.start.toString()}">${event.start.toLocalizedString(this.months)}</time>`
      } else if (event.start.day === event.end.day && event.start.month === event.end.month && event.start.year === event.end.year) {
        evTimespanTd.innerHTML = `von <time datetime="${event.start.toString()}">${fixedLengthInt(event.start.hour)}:${fixedLengthInt(event.start.minute)} Uhr</time> bis <time datetime="${event.end.toString()}">${fixedLengthInt(event.end.hour)}:${fixedLengthInt(event.end.minute)} Uhr</time>`
      } else {
        evTimespanTd.innerHTML = `vom <time datetime="${event.start.toString()}">${event.start.toLocalizedString(this.months)} um ${fixedLengthInt(event.start.hour)}:${fixedLengthInt(event.start.minute)} Uhr</time> bis zum <time datetime="${event.end.toString()}">${event.end.toLocalizedString(this.months)} um ${fixedLengthInt(event.end.hour)}:${fixedLengthInt(event.end.minute)} Uhr</time>`
      }

      if (event.location) {
        const evLocation = document.createElement('tr')
        evTBody.appendChild(evLocation)
        evLocation.classList.add(this.className + '__day__dialog__event__location')
        const evLocationTh = document.createElement('th')
        evLocation.appendChild(evLocationTh)
        const evLocationThIcon = document.createElement('i')
        evLocationTh.appendChild(evLocationThIcon)
        evLocationThIcon.classList.add('feather', 'icon-map-pin')
        const evLocationTd = document.createElement('td')
        evLocation.appendChild(evLocationTd)
        evLocationTd.innerHTML = event.location.replace(sanitizeRegEx, '').replace(/\n/g, '<br>')
      }

      if (event.description) {
        const desc = document.createElement('p')
        evWrapper.appendChild(desc)
        desc.classList.add(this.className + '__day__dialog__event__description', 'mt-1', 'mb-0')
        desc.innerHTML = event.description.replace(sanitizeRegEx, '')
          .replace(/(?<=^|\s)(https?:\/\/\S+?)(?:\s|$)/g, '<a href="$1" target="_blank">$1</a>')
          .replace(/\n/g, '<br>')

        markExternalLinks(desc.querySelectorAll('a'))
      }
    }

    day.events.filter(it => it.start.isDate).sort((a, b) => a.title < b.title ? -1 : (a.title > b.title ? 1 : 0)).sort((a, b) => a.start.compare(b.start)).forEach(createEvent)
    day.events.filter(it => !it.start.isDate).sort((a, b) => a.title < b.title ? -1 : (a.title > b.title ? 1 : 0)).sort((a, b) => a.start.compare(b.start)).forEach(createEvent)

    const close = document.createElement('button')
    wrapper.appendChild(close)
    close.classList.add(this.className + '__day__dialog__close', 'feather', 'icon-x')
    close.addEventListener('click', () => {
      wrapper.remove()
      darkener.remove()
      document.body.style.overflow = ''
    })

    const darkener = document.createElement('div')
    darkener.classList.add(this.className + '__day__dialog__darkener')
    darkener.setAttribute('role', 'widget')
    darkener.addEventListener('click', () => {
      wrapper.remove()
      darkener.remove()
      document.body.style.overflow = ''
    })

    return [wrapper, darkener]
  }

  /** Returns the month data for specified month
   * @param {number} month
   * @param {number} year
   * @returns {Promise<DayInMonth[][]>}
   * @throws {RangeError}
   * @private
   * @async
   */
  async _getMonthData (month, year) {
    if (year < 1970 || year > 2100 || month < 1 || month > 12) throw new RangeError()

    /** @type {DayInMonth[][]} */
    const a = []
    const date = new Date(`${year}-${month}-01 00:00:00`)
    /** day of week for date, where monday is 0 and sunday is 6 */
    const day = date.getDay() === 0 ? 6 : date.getDay() - 1
    const leapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    /** @type {number} */
    const daysInMonth = [1, 3, 5, 7, 8, 10, 12].some(a => a === month)
      ? 31
      : (
          month === 2
            ? 28 + leapYear
            : 30
        )
    const oneDay = 86400000

    a[0] = []
    for (let [i, d] = [day, new Date(date)]; i > 0; i--) {
      d.setTime(d.getTime() - oneDay)
      a[0].unshift(Widget.createDayInMonth(d.getFullYear(), d.getMonth() + 1, d.getDate()))
    }
    for (let [d, i] = [day, 1]; d <= 6; d++) {
      a[0].push(Widget.createDayInMonth(year, month, i++))
    }

    for (let [w, d] = [1, 7 - day]; w <= Math.ceil((daysInMonth - 7 + day) / 7); w++) {
      a[w] = []
      for (let i = 0; i < 7; i++) {
        if (++d > daysInMonth) {
          const da = new Date(`${year}-${month}-${daysInMonth} 00:00:00`)
          da.setTime(da.getTime() + ((d % daysInMonth) * oneDay))
          a[w].push(Widget.createDayInMonth(da.getFullYear(), da.getMonth() + 1, da.getDate()))
        } else {
          a[w].push(Widget.createDayInMonth(year, month, d))
        }
      }
    }

    return this._fillMonthData(month, year, a)
  }

  /** Fills the dataArray with event data
   * @param {number} month
   * @param {number} year
   * @param {DayInMonth[][]} dataArray
   * @returns {Promise<DayInMonth[][]>}
   * @private
   * @async
   */
  _fillMonthData (month, year, dataArray) {
    return this._fetchMonth(month, year)
      .then(r => Widget._parseEvents(r))
      .then(data => new Promise(resolve => {
        for (const week of dataArray) {
          for (const day of week) {
            day.events = data.filter(e => Widget.eventAffectsDate(e, day.year, day.month, day.day))
          }
        }
        resolve(dataArray)
      }))
  }

  /** Parses {@link RawEvent RawEvents} to {@link Event Events}
   * @param {RawEvent[]} raw
   * @returns {Promise<Event[]>}
   * @private
   * @static
   * @async
   */
  static async _parseEvents (raw) {
    return new Promise((resolve) => {
      resolve(raw.map(r => Widget.createEventFromRaw(r)))
    })
  }

  /** Fetches the specified month from the API
   * @param {number} month
   * @param {number} year
   * @returns {Promise<RawEvent[]>}
   * @private
   * @async
   */
  async _fetchMonth (month, year) {
    return fetch(`${this.url}${year}/${month}`)
      .then(r => r.json())
  }

  /** Creates {@link DayInMonth} object
   * @param {number} year year part of date
   * @param {number} month month part of date
   * @param {number} day day part of date
   * @param {Event[]} [events = []] events of the day
   * @return {DayInMonth}
   * @static
   */
  static createDayInMonth (year, month, day, events = []) {
    return {
      year: year,
      month: month,
      day: day,
      events: events
    }
  }

  /** Creates {@link Event} from {@link RawEvent}
   * @param {RawEvent} raw
   * @returns {Event}
   */
  static createEventFromRaw (raw) {
    return {
      title: raw.title,
      description: raw.description,
      location: raw.location,
      start: Widget.createTime(raw.start),
      end: Widget.createTime(raw.end)
    }
  }

  /** Creates {@link Time} object from raw string
   * @param {string} raw
   * @returns {Time}
   * @static
   */
  static createTime (raw) {
    const [date, time] = raw.split('T').map((it, id) => id === 0 ? it.split('-').map(a => parseInt(a)) : it.split(':').map(a => parseInt(a)))

    if (time !== undefined) {
      return new Time(
        date[0],
        date[1],
        date[2],
        time[0],
        time[1],
        time[2]
      )
    } else {
      return Time.buildDate(...date)
    }
  }

  /** Checks whether event affects certain date
   * @param {Event} event
   * @param {number} year
   * @param {number} month
   * @param {number} day
   * @returns {boolean}
   * @static
   */
  static eventAffectsDate (event, year, month, day) {
    const [start, end, date] = [
      new Date(`${event.start.year}-${event.start.month}-${event.start.day} 00:00:00`),
      new Date(`${event.end.year}-${event.end.month}-${event.end.day} 00:00:00`),
      new Date(`${year}-${month}-${day} 00:00:00`)
    ]

    return start <= date && end >= date
  }
}

/** Event directly converted from JSON
 * @typedef {Object} RawEvent
 * @property {string} title Event title (iCal summary)
 * @property {string=} description Event description
 * @property {string=} location Event location
 * @property {string} start Start time of the event
 * @property {string} end End time of the event
 */

/** Parsed Event
 * @typedef {Object} Event
 * @property {string} title Event title (iCal summary)
 * @property {string=} description Event description
 * @property {string=} location Event location
 * @property {Time} start Start time of the event
 * @property {Time} end End time of the event
 */

/** DayInMonth representation
 * @typedef {Object} DayInMonth
 * @property {number} year year part of date
 * @property {number} month month part of date
 * @property {number} day day part of date
 * @property {Event[]} events events of the day
 */

/** Creates a String of a fixed length from an integer
 * @param {number} int input integer
 * @param {number} [length=2] desired length, default 2
 * @returns string
 * @throws {TypeError}
 */
function fixedLengthInt (int, length = 2) {
  [int, length] = [parseInt(int), parseInt(length)]
  if ([int, length].some(it => isNaN(it))) throw new TypeError('int and length must be integers')

  let i = int.toString()
  if (i.length >= length) return i

  for (let c = length - i.length; c > 0; c--) i = '0' + i
  return i
}

class Time {
  /** The year for this date
   * @type {number}
   * @readonly
   */
  get year () { return this._year }

  /** The month for this date
   * @type {number}
   * @readonly
   */
  get month () { return this._month }

  /** The day for this date
   * @type {number}
   * @readonly
   */
  get day () { return this._day }

  /** The hour for this date
   * @type {number}
   * @readonly
   */
  get hour () { return this._hour }

  /** The minute for this date
   * @type {number}
   * @readonly
   */
  get minute () { return this._minute }

  /** The second for this date
   * @type {number}
   * @readonly
   */
  get second () { return this._second }

  /** If true the instance represents a date
   * @type {boolean}
   * @readonly
   */
  get isDate () { return this._isDate }

  /** Constructor for Time
   * @param {number} year The year for this date
   * @param {number} month The month for this date
   * @param {number} day The day for this date
   * @param {number=} hour The hour for this date
   * @param {number} [minute = 0] The minute for this date
   * @param {number} [second = 0] The second for this date
   * @param {boolean=} isDate If true the instance represents a date
   */
  constructor (year, month, day, hour = undefined, minute = 0, second = 0, isDate = undefined) {
    /** The year for this date
     * @type {number}
     * @private
     */
    this._year = year
    /** The month for this date
     * @type {number}
     * @private
     */
    this._month = month
    /** The day for this date
     * @type {number}
     * @private
     */
    this._day = day
    /** The hour for this date
     * @type {number}
     * @default 0
     * @private
     */
    this._hour = hour | 0
    /** The minute for this date
     * @type {number}
     * @default 0
     * @private
     */
    this._minute = minute
    /** The second for this date
     * @type {number}
     * @default 0
     * @private
     */
    this._second = second
    /** If true the instance represents a date
     * @type {boolean}
     * @private
     */
    this._isDate = isDate !== undefined ? isDate : hour === undefined
  }

  /** Compares the current to another instance of Time
   * @param {Time} other
   * @returns {-1|0|1} Returns -1 is current instance isset before other instance, returns 1 if current instance isset after other instance, returns 0 if both are the same
   * @example
   * // arr is an array of Time objects
   * arr.sort((a, b) => a.compare(b))
   */
  compare (other) {
    const [a, b] = [this.toUnixTime(), other.toUnixTime()]
    if (a < b) return -1
    else if (a > b) return 1
    else return 0
  }

  /** Converts this instance to UNIX time
   * @returns {number}
   */
  toUnixTime () {
    let res = this.second * 1e3
    res += this.minute * 6 * 1e4
    res += this.hour * 3.6 * 1e6
    res += (this.day - 1) * 8.64 * 1e7
    for (let i = this.month - 1; i > 0; i--) {
      res += Time.daysInMonth(this.month, this.year) * 8.64 * 1e7
    }
    for (let i = this.year - 1; i >= 1970; i--) {
      res += (Time.isLeapYear(i) ? 3.16224 : 3.1536) * 1e10
    }
    return res
  }

  /** converts this instance to a string
   * @returns {stirng}
   */
  toString () {
    let res = [this.year, this.month, this.day].map(it => fixedLengthInt(it)).join('-')
    if (!this.isDate) res += 'T' + [this.hour, this.minute, this.second].map(it => fixedLengthInt(it)).join(':')
    return res
  }

  /** converts this instance to a localized string
   * @param {string[]} monthNames Localized names of month
   * @param {string} [betweenDayMonth = '. ']
   * @param {string} [betweenMonthYear = ' ']
   * @return {string}
   */
  toLocalizedString (monthNames, betweenDayMonth = '. ', betweenMonthYear = ' ') {
    return fixedLengthInt(this.day) + betweenDayMonth + monthNames[this.month - 1] + betweenMonthYear + this.year
  }

  /** Checks if given year is a leap year
   * @param {number} year
   * @returns {boolean}
   * @static
   */
  static isLeapYear (year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  /** Calculates days in the specified month
   * @param {1|2|3|4|5|6|7|8|9|10|11|12} month
   * @param {number} year
   * @returns {28|29|30|31}
   * @static
   */
  static daysInMonth (month, year) {
    if ([1, 3, 5, 7, 8, 10, 12].some(it => month)) return 31
    else if (month === 2) return 28 + Time.isLeapYear(year)
    else return 30
  }

  /** Constructs a date instance
   * @param {number} year The year for this date
   * @param {number} month The month for this date
   * @param {number} day The day for this date
   * @returns {Time}
   * @static
   */
  static buildDate (year, month, day) {
    return new Time(year, month, day, undefined, 0, 0, true)
  }
}
