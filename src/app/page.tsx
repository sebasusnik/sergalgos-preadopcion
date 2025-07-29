'use client'
import React, { useState, useEffect } from 'react'
import { Input } from './ui/components/input'
import { Textarea } from './ui/components/textarea'
import { RadioGroup } from './ui/components/radio-group'
import { Button } from './ui/components/button'
import { FormField } from './ui/components/form-field'
import { Modal } from './ui/components/modal'
import { LoadingSkeleton } from './ui/components/loading-skeleton'
import { DropzoneUpload } from './ui/components/dropzone-upload'

export default function AdoptionPage(): React.ReactElement {
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    dni: '',
    address: '',
    neighborhood: '',
    city: '',
    phone: '',
    email: '',
    socialMedia: '',
    // Questions
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '',
    q11: '', q12: '', q13: '', q14: '', q15: '', q16: '', q17: '', q18: '', q19: '',
    q20: '', q21: '', q22: '', q23: '', q24: null as string | null, q25: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const questions = {
    // Personal Info
    fullName: 'Nombres y Apellidos',
    dni: 'DNI',
    address: 'Domicilio',
    neighborhood: 'Barrio',
    city: 'Ciudad',
    phone: 'Teléfonos',
    email: 'E-Mail',
    socialMedia: 'Usuario en redes sociales (Facebook o Instagram)',
    // Questions
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'file') {
      const target = e.target as HTMLInputElement
      if (name !== 'q24') {
        setFormData(prev => ({ ...prev, [name]: target.files?.[0] || null }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Update formData when files change
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, q24: uploadedFiles.length > 0 ? 'Archivos adjuntos' : null }))
  }, [uploadedFiles])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    // Basic validation: check if required fields are empty
    if (!formData.fullName.trim()) errors.fullName = 'El nombre es requerido.'
    if (!formData.dni.trim()) errors.dni = 'El DNI es requerido.'
    if (!formData.address.trim()) errors.address = 'El domicilio es requerido.'
    if (!formData.city.trim()) errors.city = 'La ciudad es requerida.'
    if (!formData.phone.trim()) errors.phone = 'El teléfono es requerido.'
    if (!formData.email.trim()) errors.email = 'El email es requerido.'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'El formato del email es inválido.'
    
    // Validate a few key questions
    if (!formData.q1.trim()) errors.q1 = 'Respuesta requerida.'
    if (!formData.q3) errors.q3 = 'Respuesta requerida.'
    if (!formData.q9.trim()) errors.q9 = 'Respuesta requerida.'
    if (!formData.q11) errors.q11 = 'Respuesta requerida.'
    if (!formData.q22) errors.q22 = 'Respuesta requerida.'
    if (!formData.q23) errors.q23 = 'Respuesta requerida.'
    if (!formData.q25) errors.q25 = 'Respuesta requerida.'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      const firstErrorKey = Object.keys(formErrors)[0]
      if (firstErrorKey) {
        const errorElement = document.getElementById(firstErrorKey)
        if(errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }
    
    setIsSubmitting(true)

    try {
      // Create FormData to send files
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof typeof formData] !== null) {
          formDataToSend.append(key, formData[key as keyof typeof formData] as string)
        }
      })
      
      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formDataToSend.append(`file_${index}`, file)
      })
      
      // Add file count
      formDataToSend.append('fileCount', uploadedFiles.length.toString())

      const response = await fetch('/api/adoptar', {
        method: 'POST',
        body: formDataToSend, // Send as FormData instead of JSON
      })

      const result = await response.json()

      if (result.success) {
        setShowSuccessModal(true)
      } else {
        alert('Error al enviar el formulario: ' + result.message)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error al enviar el formulario. Por favor, inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-0 sm:p-6 md:p-8 bg-gray-50">
      {showSuccessModal && (
        <Modal title="¡Formulario Enviado!" onClose={() => setShowSuccessModal(false)}>
          <p>¡Gracias por tu interés en adoptar!</p>
          <p className="mt-2">El formulario ha sido enviado correctamente a nuestro equipo.</p>
          <p className="mt-2 font-semibold">Nos pondremos en contacto contigo pronto para continuar con el proceso de adopción.</p>
          {uploadedFiles.length > 0 && (
            <p className="mt-2 text-sm text-green-600">✓ Las fotos han sido enviadas junto con el formulario.</p>
          )}
        </Modal>
      )}
      <div className="w-full max-w-3xl bg-white p-4 sm:p-8 rounded-none sm:rounded-xl shadow-none sm:shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Formulario de Preadopción</h1>
          <p className="text-gray-500 mt-2">Gracias por considerar darle un hogar a uno de nuestros rescatados.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Personal Info Section */}
            <div className="space-y-4 p-5 border border-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Datos Personales</h2>
              <FormField id="fullName" label={questions.fullName} required>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                {formErrors.fullName && <p className="text-red-500 text-xs">{formErrors.fullName}</p>}
              </FormField>
              <FormField id="dni" label={questions.dni} required>
                <Input id="dni" name="dni" type="number" value={formData.dni} onChange={handleChange} required />
                {formErrors.dni && <p className="text-red-500 text-xs">{formErrors.dni}</p>}
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField id="address" label={questions.address} required>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                  {formErrors.address && <div className="min-h-[20px]">
                    <p className="text-red-500 text-xs pt-1">{formErrors.address}</p>
                  </div>}
                </FormField>
                <FormField id="neighborhood" label={questions.neighborhood}>
                  <Input id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleChange} />
                  {formErrors.address && <div className="min-h-[20px]" />}
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField id="city" label={questions.city} required>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                  {formErrors.city && <div className="min-h-[20px]">
                    <p className="text-red-500 text-xs pt-1">{formErrors.city}</p>
                  </div>}
                </FormField>
                <FormField id="phone" label={questions.phone} required>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                  {formErrors.phone && <div className="min-h-[20px]">
                    <p className="text-red-500 text-xs pt-1">{formErrors.phone}</p>
                  </div>}
                </FormField>
              </div>
              <FormField id="email" label={questions.email} required>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
              </FormField>
              <FormField id="socialMedia" label={questions.socialMedia}>
                <Input id="socialMedia" name="socialMedia" value={formData.socialMedia} onChange={handleChange} />
              </FormField>
            </div>

            {/* Questions Section */}
            <div className="space-y-4 p-5 border border-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Cuestionario</h2>
              
              <FormField id="q1" label={questions.q1} required>
                <Input id="q1" name="q1" type="number" value={formData.q1} onChange={handleChange} required />
                {formErrors.q1 && <p className="text-red-500 text-xs">{formErrors.q1}</p>}
              </FormField>

              <FormField id="q2" label={questions.q2}>
                <Textarea id="q2" name="q2" value={formData.q2} onChange={handleChange} />
              </FormField>

              <FormField id="q3" label={questions.q3} required>
                <RadioGroup 
                  name="q3" 
                  options={[{value: 'Sí', label: 'Sí'}, {value: 'No', label: 'No'}]} 
                  selectedValue={formData.q3} 
                  onChange={handleRadioChange} 
                  required 
                />
                {formErrors.q3 && <p className="text-red-500 text-xs">{formErrors.q3}</p>}
              </FormField>

              <FormField id="q4" label={questions.q4}>
                <Textarea id="q4" name="q4" value={formData.q4} onChange={handleChange} />
              </FormField>

              <FormField id="q5" label={questions.q5}>
                <Textarea id="q5" name="q5" value={formData.q5} onChange={handleChange} />
              </FormField>

              <FormField id="q6" label={questions.q6}>
                <Textarea id="q6" name="q6" value={formData.q6} onChange={handleChange} />
              </FormField>

              <FormField id="q7" label={questions.q7}>
                <Textarea id="q7" name="q7" value={formData.q7} onChange={handleChange} />
              </FormField>

              <FormField id="q8" label={questions.q8}>
                <Textarea id="q8" name="q8" value={formData.q8} onChange={handleChange} />
              </FormField>
              
              <FormField id="q9" label={questions.q9} required>
                <Textarea id="q9" name="q9" value={formData.q9} onChange={handleChange} required />
                {formErrors.q9 && <p className="text-red-500 text-xs">{formErrors.q9}</p>}
              </FormField>
              
              <FormField id="q10" label={questions.q10}>
                <Textarea id="q10" name="q10" value={formData.q10} onChange={handleChange} />
              </FormField>
              
              <FormField id="q11" label={questions.q11} required>
                <RadioGroup 
                  name="q11" 
                  options={[{value: 'Casa', label: 'Casa'}, {value: 'Departamento', label: 'Departamento'}]} 
                  selectedValue={formData.q11} 
                  onChange={handleRadioChange} 
                  required 
                />
                {formErrors.q11 && <p className="text-red-500 text-xs">{formErrors.q11}</p>}
              </FormField>

              <FormField id="q12" label={questions.q12}>
                <RadioGroup 
                  name="q12" 
                  options={[{value: 'Sí', label: 'Sí'}, {value: 'No', label: 'No'}]} 
                  selectedValue={formData.q12} 
                  onChange={handleRadioChange} 
                />
              </FormField>

              <FormField id="q13" label={questions.q13}>
                <Textarea id="q13" name="q13" value={formData.q13} onChange={handleChange} />
              </FormField>

              <FormField id="q14" label={questions.q14}>
                <Textarea id="q14" name="q14" value={formData.q14} onChange={handleChange} />
              </FormField>

              <FormField id="q15" label={questions.q15}>
                <Textarea id="q15" name="q15" value={formData.q15} onChange={handleChange} />
              </FormField>

              <FormField id="q16" label={questions.q16}>
                <Textarea id="q16" name="q16" value={formData.q16} onChange={handleChange} />
              </FormField>

              <FormField id="q17" label={questions.q17}>
                <Textarea id="q17" name="q17" value={formData.q17} onChange={handleChange} />
              </FormField>

              <FormField id="q18" label={questions.q18}>
                <Textarea id="q18" name="q18" value={formData.q18} onChange={handleChange} />
              </FormField>

              <FormField id="q19" label={questions.q19}>
                <Textarea id="q19" name="q19" value={formData.q19} onChange={handleChange} />
              </FormField>

              <FormField id="q20" label={questions.q20}>
                <Textarea id="q20" name="q20" value={formData.q20} onChange={handleChange} />
              </FormField>

              <FormField id="q21" label={questions.q21}>
                <Textarea id="q21" name="q21" value={formData.q21} onChange={handleChange} />
              </FormField>
              
              <FormField id="q22" label={questions.q22} required>
                <RadioGroup 
                  name="q22" 
                  options={[{value: 'Sí', label: 'Sí'}, {value: 'No', label: 'No'}]} 
                  selectedValue={formData.q22} 
                  onChange={handleRadioChange} 
                  required 
                />
                {formErrors.q22 && <p className="text-red-500 text-xs">{formErrors.q22}</p>}
              </FormField>

              <FormField id="q23" label={questions.q23} required>
                <RadioGroup 
                  name="q23" 
                  options={[{value: 'Sí', label: 'Sí'}, {value: 'No', label: 'No'}]} 
                  selectedValue={formData.q23} 
                  onChange={handleRadioChange} 
                  required 
                />
                {formErrors.q23 && <p className="text-red-500 text-xs">{formErrors.q23}</p>}
              </FormField>
              
              <FormField id="q24" label={questions.q24}>
                <DropzoneUpload
                  files={uploadedFiles}
                  onFilesChange={setUploadedFiles}
                  error={fileError}
                  onError={setFileError}
                  maxSize={5 * 1024 * 1024} // 5MB
                  maxFiles={10}
                />
              </FormField>
              
              <FormField id="q25" label={questions.q25} required>
                <RadioGroup 
                  name="q25" 
                  options={[{value: 'Sí', label: 'Sí'}, {value: 'No', label: 'No'}]} 
                  selectedValue={formData.q25} 
                  onChange={handleRadioChange} 
                  required 
                />
                {formErrors.q25 && <p className="text-red-500 text-xs">{formErrors.q25}</p>}
              </FormField>
            </div>

            <div className="space-y-3">
              {Object.keys(formErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Hay campos requeridos sin completar
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Por favor, completa todos los campos marcados como obligatorios antes de enviar el formulario.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mb-3 md:mb-0">
                <Button type="submit" disabled={isSubmitting} className="min-w-24">
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 