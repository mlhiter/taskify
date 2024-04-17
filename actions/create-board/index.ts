'use server'

import { auth } from '@clerk/nextjs'
import { InputType, ReturnType } from './types'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { CreateBoard } from './schema'
import { createSafeAction } from '@/lib/create-safe-action'
import { createAuditLog } from '@/lib/create-audit-log'
import { ACTION, ENTITY_TYPE } from '@prisma/client'
import { incrementAvailableCount, hasAvailableCount } from '@/lib/org-limit'

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth()

  if (!userId || !orgId) {
    return {
      error: 'Unauthorized',
    }
  }

  const canCreate = await hasAvailableCount()

  if (!canCreate) {
    return {
      error:
        'You have reached the maximum number of boards allowed for your plan. Upgrade to create more boards.',
    }
  }

  const { title, image } = data

  const [imageId, imageThumbUrl, imageFullUrl, imageLinkHTML, imageUserName] =
    image.split('|')

  if (
    !imageId ||
    !imageThumbUrl ||
    !imageFullUrl ||
    !imageLinkHTML ||
    !imageUserName
  ) {
    return {
      error: 'Missing fields. Failed to create board.',
    }
  }

  let board
  try {
    board = await db.board.create({
      data: {
        title,
        orgId,
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageLinkHTML,
        imageUserName,
      },
    })

    await incrementAvailableCount()
    await createAuditLog({
      entityId: board.id,
      entityTitle: board.title,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.CREATE,
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
