
const formatDate = (date) => {
  return `${weekdays[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}`
}

const formatReverseIsoDate = (date) => {
  const components = date.toISOString().split('T')[0].split('-')
  return `${components[2]}-${components[1]}-${components[0]}`
}

const addDay = (date, days)=> {
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

const notSunday = date => date.getDay() !== 0

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
  notSunday
}
