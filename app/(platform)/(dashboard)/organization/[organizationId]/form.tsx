'use client'

import { createBoard } from '@/actions/create-board'
import { FormInput } from '@/components/form/form-input'
import { FormSubmit } from '@/components/form/form-submit'
import { useAction } from '@/hooks/use-action'

export const Form = () => {
  const { execute, fieldErrors } = useAction(createBoard, {
    onSuccess: (data) => {
      console.log('success', data)
    },
    onError: (error) => {
      console.error('error', error)
    },
  })
  const onSubmit = (formData: FormData) => {
    const title = formData.get('title') as string

    execute({ title })
  }
  return (
    <form action={onSubmit}>
      <div className="flex flex-col space-y-2"></div>
      <FormInput id="title" label="Board Title" errors={fieldErrors} />
      <FormSubmit>Save</FormSubmit>
    </form>
  )
}