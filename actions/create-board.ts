'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import z from 'zod'

export type State = {
  errors?: {
    title?: string[]
  }
  message?: string | null
}

const CreateBoardSchema = z.object({
  title: z.string().min(3, {
    message: 'Minimum length of 3 letters is required',
  }),
})

export async function create(prevState: State, formData: FormData) {
  const validateFields = CreateBoardSchema.safeParse({
    title: formData.get('title'),
  })

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Missing fields.',
    }
  }

  const { title } = validateFields.data

  try {
    await db.board.create({
      data: {
        title,
      },
    })
  } catch (error) {
    return {
      message: 'Database Error',
    }
  }

  revalidatePath('/organization/org_2cMacIDIX7tl0K8jYxzKM9VwcHy')
  redirect('/organization/org_2cMacIDIX7tl0K8jYxzKM9VwcHy')
}
