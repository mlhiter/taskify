'use server'

import { auth } from '@clerk/nextjs'
import { InputType, ReturnType } from './types'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { CreateBoard } from './schema'
import { createSafeAction } from '@/lib/create-safe-action'

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId } = auth()

  if (!userId) {
    return {
      error: 'Unauthorized',
    }
  }

  const { title } = data

  let board
  try {
    board = await db.board.create({
      data: {
        title,
      },
    })
  } catch (error) {
    return {
      error: 'Failed to create.',
    }
  }

  revalidatePath(`/boards/${board.id}`)
  return {
    data: board,
  }
}

export const createBoard = createSafeAction(CreateBoard, handler)