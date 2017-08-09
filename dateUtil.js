const formatDate = (date) => {
  return `${weekdays[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}`
}

const pad = number => (number < 10 ? '0' : '') + number

const formatReverseIsoDate = (date) => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`

const addDay = (date, days) => {
  const newDate = new Date(date.getTime())
  newDate.setDate(newDate.getDate() + days)
  return newDate
}
const weekdays = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'].map(x => x.toUpperCase())
const matchWeekday = new RegExp(`(${weekdays.join('|')})`, 'g')

const strToDate = str => {
  const dmy = str.split('.')
  return new Date(+dmy[2], (+dmy[1] - 1), +dmy[0])
}

const isOpen = date => date.getDay() !== 0 && date.getDay() !== 1 && date.getDay() !== 6

const toMidnight = date => {
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

module.exports = {
  formatDate,
  formatReverseIsoDate,
  addDay,
  toMidnight,
  isOpen
}
