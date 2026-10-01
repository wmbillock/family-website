import jsPDF from 'jspdf'
import { objective, employment, education, otherRelated } from './data'
import { shortEmployment, earlierEmployment, careerHighlights, achievements, projects, writingAndSpeaking } from './portfolio'

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 36
const CONTENT_W = PAGE_W - 2 * MARGIN
const FONT_BODY = 9.5
const LINE_HEIGHT = 12
const clean = text => String(text).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')

export default function buildPdf({ full = false } = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  doc.setProperties({ title: `Willow Billock - ${full ? 'Career Portfolio' : 'Resume'}`, author: 'Willow Billock' })
  let y = MARGIN
  const ensure = height => {
    if (y + height > PAGE_H - MARGIN - 16) { doc.addPage(); y = MARGIN }
  }
  const text = (value, { bold = false, indent = 0, size = FONT_BODY } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size)
    const lines = doc.splitTextToSize(clean(value), CONTENT_W - indent)
    for (const line of lines) {
      ensure(LINE_HEIGHT)
      doc.text(line, MARGIN + indent, y + size)
      y += LINE_HEIGHT
    }
  }
  const bullet = value => {
    ensure(LINE_HEIGHT)
    doc.setFont('helvetica', 'normal').setFontSize(FONT_BODY).text('•', MARGIN + 4, y + FONT_BODY)
    text(value, { indent: 14 })
  }
  const section = title => {
    ensure(48)
    y += 7
    text(title, { bold: true, size: 12 })
    y += 5
    doc.setLineWidth(.5).line(MARGIN, y, PAGE_W - MARGIN, y)
    y += 5
  }
  const job = (item, compact = false) => {
    ensure(compact ? 36 : 60)
    if (compact) {
      text(`${item['start-date']} - ${item['end-date'] || 'Present'} | ${item.title} | ${item.company}`)
    } else {
      text(`${item.title} | ${item.company}`, { bold: true })
      text(`${item['start-date']} - ${item['end-date'] || 'Present'} | ${item.location}`)
      item.responsibilities.forEach(bullet)
    }
    y += 4
  }
  text('WILLOW BILLOCK', { bold: true, size: 18 }); y += 10
  text(full ? 'Career portfolio | 2004-present' : 'Staff / Principal engineering | Distributed systems & applied AI')
  doc.setFontSize(FONT_BODY).textWithLink('billock.org/willow', MARGIN, y + FONT_BODY, { url: 'https://billock.org/willow' }); y += LINE_HEIGHT
  section('Objective'); text(objective)
  if (full) {
    section('Achievement stories')
    text('Employer metrics are from my career accounts. These stories distinguish my contribution, system scope, and the context behind each result.')
    achievements.forEach(item => {
      ensure(72); y += 8
      text(`${item.title} | ${item.organization}`, { bold: true })
      for (const [label, value] of [['My contribution', item.contribution], ['Approach', item.approach], ['Result', item.result], ['Context', item.context]]) text(`${label}: ${value}`)
    })
    section('Full employment history'); employment.forEach(item => job(item))
    section('Independent projects')
    projects.forEach(item => { ensure(60); text(item.name, { bold: true }); text(item.description); text(item.url); y += 4 })
  } else {
    section('Recent experience'); shortEmployment.forEach(item => job(item))
    section('Selected career highlights'); careerHighlights.forEach(bullet)
    doc.addPage(); y = MARGIN
    section('Earlier experience'); earlierEmployment.forEach(item => job(item, true))
  }
  if (full) { section('Writing, speaking & developer education'); writingAndSpeaking.forEach(bullet) }
  section('Education')
  education.forEach(item => {
    ensure(48)
    text(`${item.degree} - ${item.major}`, { bold: true })
    text(`${item.school}, ${item.city} | ${item.graduationDate}`)
    if (full && item.notes) text(item.notes)
    y += 4
  })
  if (full) {
    section('Teaching, music leadership, and recognition')
    otherRelated.forEach(item => { ensure(48); text(item.data, { bold: true }); item.children.forEach(bullet); y += 4 })
  } else {
    section('Teaching & leadership')
    text('Graphics and game-development teaching: DeVry (2011-2018), SNHU (2012-2017), Rasmussen (2012-2015).')
    text('Music leadership: Chicago Brass Band President (2025); NABBA board member and tech lead (2022-2024).')
    y += 5
    text('Full career, achievements, and projects: billock.org/willow')
  }
  const total = doc.getNumberOfPages()
  for (let page = 1; page <= total; page++) {
    doc.setPage(page).setFont('helvetica', 'normal').setFontSize(8)
    doc.text(`Willow Billock | ${full ? 'Career portfolio' : 'Resume'} | ${page} of ${total}`, MARGIN, PAGE_H - 22)
  }
  return doc
}
