'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './primitives'

export function Modal({ open, onClose, title, children, sheet = false }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; sheet?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])
  return (
    <dialog ref={ref} aria-label={title} className={sheet ? 'regent-modal regent-sheet' : 'regent-modal'}
      onCancel={onClose} onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className='modal-surface'>
        <header className='flex items-center justify-between gap-4 border-b border-line py-3 pl-6 pr-3'>
          <h2 className='font-medium'>{title}</h2>
          <IconButton label={'Close ' + title.toLowerCase()} onClick={onClose}><X className='size-4' /></IconButton>
        </header>
        {children}
      </div>
    </dialog>
  )
}

