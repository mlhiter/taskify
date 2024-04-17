'use server'

import { auth } from '@clerk/nextjs'
import { InputType, ReturnType } from './types'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { CopyList } from './schema'
import { createSafeAction } from '@/lib/create-safe-action'
import { ACTION, ENTITY_TYPE } from '@prisma/client'
import { createAuditLog } from '@/lib/create-audit-log'

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth()

  if (!userId || !orgId) {
    return {
      error: 'Unauthorized',
    }
  }

  const { id, boardId } = data
  let list
  try {
    const listToCoy = await db.list.findUnique({
      where: {
        id,
        boardId,
        board: {
          orgId,
        },
      },
      include: {
        cards: true,
      },
    })
    if (!listToCoy) {
      return {
        error: 'List not found',
      }
    }

    const lastList = await db.list.findFirst({
      where: {
        boardId,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    })

    const newOrder = lastList ? lastList.order + 1 : 1
    list = await db.list.create({
      data: {
        boardId: listToCoy.boardId,
        title: `${listToCoy.title} - Copy`,
        order: newOrder,
        cards: {
          createMany: {
            data: listToCoy.cards.map((card) => ({
              title: card.title,
              description: card.description,
              order: card.order,
            })),
          },
        },
      },
      include: {
        cards: true,
      },
    })
    await createAuditLog({
      entityId: list.id,
      entityTitle: list.title,
      entityType: ENTITY_TYPE.LIST,
      action: ACTION.CREATE,
    })
  } catch (error) {
    return {
      error: 'Failed to copy.',
    }
  }
  revalidatePath(`/board/${boardId}`)
  return { data: list }
}

export const copyList = createSafeAction(CopyList, handler)
