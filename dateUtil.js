exports.formatDate = (date) => `${weekdays[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}`

const pad = number => (number < 10 ? '0' : '') + number

exports.formatReverseIsoDate = (date) => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`

exports.addDay = (date, days) => {
  const newDate = new Date(date.getTime())
  newDate.setDate(newDate.getDate() + days)
  return newDate
}
const weekdays = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'].map(x => x.toUpperCase())

exports.isOpen = date => date.getDay() !== 0 && date.getDay() !== 1 && date.getDay() !== 6

exports.toMidnight = date => {
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}
