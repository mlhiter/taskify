'use client'

import { useQuery } from '@tanstack/react-query'

import { Header } from './header'
import { useCardModal } from '@/hooks/use-card-modal'
import { Dialog, DialogContent } from '@/components/ui/dialog'

import { CardWithList } from '@/types'
import { fetcher } from '@/lib/fetcher'

export const CardModal = () => {
  const { id, isOpen, onClose } = useCardModal()

  const { data: cardData } = useQuery<CardWithList>({
    queryKey: ['card', id],
    queryFn: () => fetcher(`/api/cards/${id}`),
  })

  console.log(cardData)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {!cardData ? <Header.Skeleton /> : <Header data={cardData} />}
      </DialogContent>
    </Dialog>
  )
}
