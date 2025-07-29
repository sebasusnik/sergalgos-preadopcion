import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { jsPDF } from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const formFields: Record<string, string> = {}
    const files: File[] = []
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_')) {
        // Handle File objects and FormDataEntryValue
        if (value instanceof File) {
          files.push(value)
        } else if (typeof value === 'object' && value !== null && 'arrayBuffer' in value) {
          // Handle other file-like objects that have arrayBuffer method
          files.push(value as File)
        } else if (typeof value === 'object' && value !== null && 'name' in value && 'size' in value) {
          // Handle mobile browser file objects that might not be instanceof File
          files.push(value as File)
        }
      } else if (key !== 'fileCount') {
        formFields[key] = value as string
      }
    }

    // Check total file size to prevent memory issues
    const totalFileSize = files.reduce((total, file) => total + file.size, 0)
    const maxTotalSize = 50 * 1024 * 1024 // 50MB total limit
    
    if (totalFileSize > maxTotalSize) {
      throw new Error(`Total file size too large: ${(totalFileSize / 1024 / 1024).toFixed(2)}MB > ${maxTotalSize / 1024 / 1024}MB`)
    }

    // Check required environment variables
    if (!process.env.SMTP_USER) {
      throw new Error('SMTP_USER environment variable is not set')
    }
    if (!process.env.SMTP_PASS) {
      throw new Error('SMTP_PASS environment variable is not set')
    }

    // Generate PDF
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('Formulario de Preadopción', 105, 15, { align: 'center' })
    
    let y = 25
    const margin = 15
    const pageHeight = doc.internal.pageSize.getHeight()

    // --- Section 1: Personal Data (Two Columns) ---
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Datos del Adoptante', margin, y)
    y += 7

    const col1X = margin
    const col2X = doc.internal.pageSize.getWidth() / 2 + 5
    const colWidth = doc.internal.pageSize.getWidth() / 2 - margin - 5

    const addColText = (title: string, text: string, x: number, currentY: number) => {
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(10)
      let splitTitle = doc.splitTextToSize(`${title}:`, colWidth)
      doc.text(splitTitle, x, currentY)
      let titleHeight = splitTitle.length * 4.5

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      let splitText = doc.splitTextToSize(text || 'Sin respuesta', colWidth)
      doc.text(splitText, x, currentY + titleHeight)
      doc.setTextColor(0, 0, 0)
      let textHeight = splitText.length * 4
      return titleHeight + textHeight
    }

    const questions = {
      fullName: 'Nombres y Apellidos',
      dni: 'DNI',
      address: 'Domicilio',
      neighborhood: 'Barrio',
      city: 'Ciudad',
      phone: 'Teléfonos',
      email: 'E-Mail',
      socialMedia: 'Usuario en redes sociales (Facebook o Instagram)',
      q1: '1. ¿Cuántas personas viven en la casa?',
      q2: '2. ¿De qué edades?',
      q3: '3. ¿Están todos los miembros de la familia de acuerdo en adoptar?',
      q4: '4. ¿A qué se dedican los miembros de la familia o qué profesión ejercen?',
      q5: '5. ¿Tiene algún animal en casa? ¿Cuál? ¿Está castrado?',
      q6: '6. Si tienen perros, ¿de qué raza son y qué temperamento tienen?',
      q7: '7. ¿En qué parte de la casa vive el perro?',
      q8: '8. Si no tienen, ¿han tenido? Si es así, ¿qué pasó con ellos?',
      q9: '9. ¿Por qué quiere adoptar? ¿Cuál es su motivación?',
      q10: '10. ¿Vio algún rescatado en nuestra Web que lo haya decidido a adoptar?',
      q11: '11. ¿Dónde vivirá el animal? (casa, departamento)',
      q12: '12. En caso de tener jardín o patio, ¿están totalmente cerrados?',
      q13: '13. ¿Tienen la vivienda en propiedad o alquiler? En el último caso, ¿cuentan con la autorización del propietario?',
      q14: '14. ¿Han pensado qué pasaría con el perro si tuvieran que cambiar de domicilio?',
      q15: '15. En caso de enfermedad o algún imprevisto, ¿tienen quién se haga cargo del animal?',
      q16: '16. ¿Dónde dormirá el perro?',
      q17: '17. ¿Cuántas veces lo sacarán al día y quién se encargará de hacerlo?',
      q18: '18. ¿Cuánto tiempo pasará el animal solo en casa?',
      q19: '19. ¿Han pensado qué hacer con el animal en vacaciones?',
      q20: '20. ¿Ante qué situación o por qué motivo devolvería al perro?',
      q21: '21. Cuando salen a pasear, ¿sueltan su perro para que corra libremente? ¿En qué lugar?',
      q22: '22. La adopción es para toda la vida del perro, ¿son conscientes de la responsabilidad que esto significa? ¿Asumen esa responsabilidad?',
      q23: '23. Realizamos una entrevista previa a la adopción y seguimientos posteriores, ¿está dispuesto a recibir una visita nuestra?',
      q24: '24. Adjuntar fotos del lugar, patio y dónde vivirá.',
      q25: '25. El traslado tiene un costo de $20.000. ¿Podrá abonarlo?'
    }

    const personalInfo = [
      { title: questions.fullName, value: formFields.fullName },
      { title: questions.dni, value: formFields.dni },
      { title: questions.address, value: formFields.address },
      { title: questions.neighborhood, value: formFields.neighborhood },
      { title: questions.city, value: formFields.city },
      { title: questions.phone, value: formFields.phone },
      { title: questions.email, value: formFields.email },
      { title: questions.socialMedia, value: formFields.socialMedia },
    ]

    let leftHeight = 0
    let rightHeight = 0
    for (let i = 0; i < personalInfo.length; i++) {
      const item = personalInfo[i]
      if (i % 2 === 0) { // Left column
        leftHeight = addColText(item.title, item.value, col1X, y)
      } else { // Right column
        rightHeight = addColText(item.title, item.value, col2X, y)
        y += Math.max(leftHeight, rightHeight) + 4
        leftHeight = 0
        rightHeight = 0
      }
    }
    if (personalInfo.length % 2 !== 0) {
      y += leftHeight + 4
    }

    // --- Section 2: Questionnaire (Compact List) ---
    y += 5
    if (y > pageHeight - 20) { doc.addPage(); y = 15; }

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Cuestionario', margin, y)
    y += 7

    const addQuestionText = (title: string, text: string) => {
      if (y > pageHeight - 25) { // Check for page break with margin
        doc.addPage()
        y = 15
      }
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(10)
      const maxWidth = doc.internal.pageSize.getWidth() - (margin * 2)
      let splitTitle = doc.splitTextToSize(title, maxWidth)
      doc.text(splitTitle, margin, y)
      y += (splitTitle.length * 4.5)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      let splitText = doc.splitTextToSize(text || 'Sin respuesta', maxWidth)
      doc.setTextColor(80, 80, 80)
      doc.text(splitText, margin, y)
      doc.setTextColor(0, 0, 0)
      y += (splitText.length * 4) + 5 // Reduced space
    }

    Object.keys(questions).forEach(key => {
      if (key.startsWith('q')) {
        let answer = formFields[key as keyof typeof formFields]
        if (key === 'q24' && files.length > 0) {
          answer = `${files.length} archivo(s) adjunto(s)`
        }
        addQuestionText(questions[key as keyof typeof questions], answer)
      }
    })

    // Get PDF as base64
    const pdfBase64 = doc.output('datauristring').split(',')[1]

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 1,
      debug: false, // Disable debug for cleaner output
      logger: false
    })

    // Prepare attachments array
    const attachments: any[] = [
      {
        filename: `formulario-preadopcion-${formFields.fullName.replace(/\s+/g, '-')}.pdf`,
        content: pdfBase64,
        encoding: 'base64'
      }
    ]

    // Add image files as separate attachments
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i]
        
        // Skip empty files
        if (!file) {
          continue
        }
        
        // Check if file has required methods
        if (!file.arrayBuffer) {
          continue
        }
        
        const buffer = await file.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const fileExtension = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg'
        const attachment = {
          filename: `foto-${i + 1}-${formFields.fullName.replace(/\s+/g, '-')}.${fileExtension}`,
          content: base64,
          encoding: 'base64'
        }
        
        attachments.push(attachment)
      } catch (error) {
        // Continue with other files even if one fails
      }
    }

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADOPTION_EMAIL || 'adopciones@refugio.com',
      subject: `Nuevo Formulario de Preadopción - ${formFields.fullName}`,
      html: `
        <h2>Nuevo Formulario de Preadopción</h2>
        <p><strong>Nombre:</strong> ${formFields.fullName}</p>
        <p><strong>Email:</strong> ${formFields.email}</p>
        <p><strong>Teléfono:</strong> ${formFields.phone}</p>
        <p><strong>Ciudad:</strong> ${formFields.city}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        <br>
        <p>Se adjunta el formulario completo en formato PDF.</p>
        ${files.length > 0 ? `<p>Se adjuntan ${files.length} foto(s) del lugar donde vivirá el perro.</p>` : ''}
      `,
      attachments
    }

    // Verify SMTP connection first
    try {
      await transporter.verify()
    } catch (verifyError) {
      throw new Error(`SMTP server connection failed: ${verifyError}`)
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      success: true, 
      message: 'Formulario enviado correctamente' 
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al enviar el formulario',
        error: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
} 