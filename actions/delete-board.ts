'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deleteBoard(id: string) {
  await db.board.delete({
    where: {
      id,
    },
  })
  revalidatePath('/organization/org_2cMacIDIX7tl0K8jYxzKM9VwcHy')
}
