import PdfPrinter from 'pdfmake'

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
}

const printer = new PdfPrinter(fonts)

export function generateResumePDF(resumeData) {
  const { name, summary, experience = [], skills = [], projects = [], education } = resumeData

  const content = []

  content.push({ text: name, style: 'name' })
  if (summary) content.push({ text: summary, style: 'summary', margin: [0, 4, 0, 8] })

  if (experience.length) {
    content.push({ text: 'EXPERIENCE', style: 'sectionHeader' })
    experience.forEach((exp) => {
      content.push({ text: `${exp.title} — ${exp.company}`, bold: true, fontSize: 10 })
      content.push({ text: `${exp.start} – ${exp.end}`, fontSize: 9, color: '#666', margin: [0, 1, 0, 2] })
      if (exp.bullets?.length) {
        content.push({ ul: exp.bullets, fontSize: 9, margin: [0, 0, 0, 6] })
      }
    })
  }

  if (skills.length) {
    content.push({ text: 'SKILLS', style: 'sectionHeader' })
    content.push({ text: Array.isArray(skills) ? skills.join(' · ') : skills, fontSize: 9, margin: [0, 0, 0, 8] })
  }

  if (projects.length) {
    content.push({ text: 'PROJECTS', style: 'sectionHeader' })
    projects.forEach((p) => {
      content.push({ text: p.name, bold: true, fontSize: 10 })
      content.push({ text: p.description, fontSize: 9, margin: [0, 1, 0, 6] })
    })
  }

  if (education) {
    content.push({ text: 'EDUCATION', style: 'sectionHeader' })
    content.push({ text: `${education.degree} — ${education.institution} (${education.year})`, fontSize: 9 })
  }

  const docDefinition = {
    content,
    defaultStyle: { font: 'Helvetica', fontSize: 10, lineHeight: 1.3 },
    styles: {
      name: { fontSize: 20, bold: true, margin: [0, 0, 0, 4] },
      summary: { fontSize: 10, color: '#444' },
      sectionHeader: { fontSize: 11, bold: true, color: '#1a1a1a', margin: [0, 8, 0, 4], decoration: 'underline' },
    },
    pageMargins: [40, 40, 40, 40],
  }

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = printer.createPdfKitDocument(docDefinition)
      const chunks = []
      pdfDoc.on('data', (chunk) => chunks.push(chunk))
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
      pdfDoc.on('error', reject)
      pdfDoc.end()
    } catch (err) {
      reject(err)
    }
  })
}
