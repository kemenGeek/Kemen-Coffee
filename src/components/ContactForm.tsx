import { ArrowRight } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useToast } from '../hooks/useToast'
import { cn } from '../lib/cn'

type FieldName = 'name' | 'email' | 'message'
type FormValues = Record<FieldName, string>
type FormErrors = Partial<Record<FieldName, string>>

const EMPTY_FORM: FormValues = { name: '', email: '', message: '' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FIELD_ORDER: FieldName[] = ['name', 'email', 'message']

const fieldClasses =
  'mt-2 w-full rounded-xl border bg-cream-light px-4 py-3.5 text-charcoal transition-colors duration-200 placeholder:text-coffee/80 hover:border-coffee'

function validate({ name, email, message }: FormValues) {
  const errors: FormErrors = {}

  if (!name.trim()) {
    errors.name = 'Please enter your name.'
  }

  if (!email.trim()) {
    errors.email = 'Please enter your email address.'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!message.trim()) {
    errors.message = 'Please write a short message.'
  }

  return errors
}

export function ContactForm() {
  const showToast = useToast()
  const [values, setValues] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name as FieldName

    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validate(values)
    const firstInvalidField = FIELD_ORDER.find((field) => nextErrors[field])

    setErrors(nextErrors)

    if (firstInvalidField) {
      const field = event.currentTarget.elements.namedItem(firstInvalidField)
      if (field instanceof HTMLElement) {
        field.focus()
      }
      return
    }

    setValues(EMPTY_FORM)
    showToast({
      title: 'Demo only: message not sent',
      description:
        'This form is a design preview, so your message was not sent or saved anywhere.',
    })
  }

  const fieldProps = (field: FieldName) => ({
    id: `contact-${field}`,
    name: field,
    value: values[field],
    onChange: handleChange,
    required: true,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
    className: cn(fieldClasses, errors[field] ? 'border-[#9c2f1f]' : 'border-espresso/20'),
  })

  const fieldError = (field: FieldName) =>
    errors[field] && (
      <p id={`contact-${field}-error`} className="mt-2 text-sm font-medium text-[#9c2f1f]">
        {errors[field]}
      </p>
    )

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Contact form demo"
      className="space-y-6 rounded-3xl bg-white p-7 shadow-soft sm:p-10"
    >
      <div>
        <label htmlFor="contact-name" className="text-sm font-semibold text-espresso">
          Name
        </label>
        <input {...fieldProps('name')} type="text" autoComplete="name" placeholder="Your name" />
        {fieldError('name')}
      </div>

      <div>
        <label htmlFor="contact-email" className="text-sm font-semibold text-espresso">
          Email
        </label>
        <input
          {...fieldProps('email')}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        {fieldError('email')}
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm font-semibold text-espresso">
          Message
        </label>
        <textarea {...fieldProps('message')} rows={5} placeholder="How can we help?" />
        {fieldError('message')}
      </div>

      <button
        type="submit"
        className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-espresso px-7 text-sm font-semibold tracking-wide text-cream transition-colors duration-300 ease-premium hover:bg-coffee sm:w-auto"
      >
        Send Message
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 ease-premium group-hover:translate-x-1"
        />
      </button>

      <p className="text-sm text-coffee">
        Demo form: messages are not actually sent or stored.
      </p>
    </form>
  )
}
