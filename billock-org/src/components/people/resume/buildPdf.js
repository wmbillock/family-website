import jsPDF from 'jspdf'
import { skills, employment, education, otherRelated } from './data'

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 36
const CONTENT_W = PAGE_W - 2 * MARGIN
const BULLET_INDENT = 14

const FONT_BODY = 10
const FONT_H1 = 18
const FONT_H2 = 13
const LINE_GAP = 1.35

export default function buildPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  let y = MARGIN

  const newPageIfNeeded = (needed) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  const drawWrappedText = (text, x, opts = {}) => {
    const { width = CONTENT_W - (x - MARGIN), font = FONT_BODY, style = 'normal', bullet = false } = opts
    doc.setFont('helvetica', style).setFontSize(font)
    const lineHeight = font * LINE_GAP
    const lines = doc.splitTextToSize(text, width)
    for (let i = 0; i < lines.length; i++) {
      newPageIfNeeded(lineHeight)
      if (bullet && i === 0) {
        doc.setFont('helvetica', 'normal').text('•', x - 8, y + font * 0.85)
      }
      doc.setFont('helvetica', style).setFontSize(font).text(lines[i], x, y + font * 0.85)
      y += lineHeight
    }
  }

  const drawSectionHeader = (title) => {
    newPageIfNeeded(FONT_H2 * LINE_GAP + 12)
    y += 6
    doc.setFont('helvetica', 'bold').setFontSize(FONT_H2)
    doc.text(title, MARGIN, y + FONT_H2 * 0.85)
    y += FONT_H2 * LINE_GAP
    doc.setLineWidth(0.5)
    doc.line(MARGIN, y - 2, PAGE_W - MARGIN, y - 2)
    y += 2
  }

  // Title
  doc.setFont('helvetica', 'bold').setFontSize(FONT_H1)
  doc.text('WILLOW BILLOCK', PAGE_W / 2, y + FONT_H1 * 0.85, { align: 'center' })
  y += FONT_H1 * LINE_GAP

  // Skills
  drawSectionHeader('Skills')
  for (const s of skills) {
    drawWrappedText(`${s.skill} - ${s.level}`, MARGIN + BULLET_INDENT, { bullet: true })
  }

  // Employment
  drawSectionHeader('Employment')
  for (const job of employment) {
    const dateRange = `${job['start-date']}-${job['end-date'] || 'Present'}`
    const headerLine = `${dateRange}  —  ${job.title}  —  ${job.company}, ${job.location}`
    // Estimate space needed for entry header + at least 2 bullets to avoid orphan headers
    const minEntryHeight = (FONT_BODY * LINE_GAP) * 3
    newPageIfNeeded(minEntryHeight)
    doc.setFont('helvetica', 'bold').setFontSize(FONT_BODY)
    const headerLines = doc.splitTextToSize(headerLine, CONTENT_W)
    for (const line of headerLines) {
      newPageIfNeeded(FONT_BODY * LINE_GAP)
      doc.text(line, MARGIN, y + FONT_BODY * 0.85)
      y += FONT_BODY * LINE_GAP
    }
    for (const r of job.responsibilities) {
      drawWrappedText(r, MARGIN + BULLET_INDENT, { bullet: true })
    }
    y += 4
  }

  // Education
  drawSectionHeader('Education')
  for (const ed of education) {
    newPageIfNeeded(FONT_BODY * LINE_GAP * 4)
    doc.setFont('helvetica', 'bolditalic').setFontSize(FONT_BODY)
    doc.text(`${ed.degree} - ${ed.major}`, MARGIN, y + FONT_BODY * 0.85)
    y += FONT_BODY * LINE_GAP
    drawWrappedText(`${ed.school}, ${ed.city} (${ed.graduationDate})`, MARGIN + BULLET_INDENT, { bullet: true, style: 'bold' })
    if (ed.notes) drawWrappedText(ed.notes, MARGIN + BULLET_INDENT, { bullet: true })
    y += 4
  }

  // Other organizations
  drawSectionHeader('Other organizations and employment')
  for (const o of otherRelated) {
    const minHeight = FONT_BODY * LINE_GAP * (1 + Math.min(o.children.length, 2))
    newPageIfNeeded(minHeight)
    doc.setFont('helvetica', 'bold').setFontSize(FONT_BODY)
    const titleLines = doc.splitTextToSize(o.data, CONTENT_W)
    for (const line of titleLines) {
      newPageIfNeeded(FONT_BODY * LINE_GAP)
      doc.text(line, MARGIN, y + FONT_BODY * 0.85)
      y += FONT_BODY * LINE_GAP
    }
    for (const c of o.children) {
      drawWrappedText(c, MARGIN + BULLET_INDENT, { bullet: true })
    }
    y += 4
  }

  return doc
}
