import { RegentMark } from '../brand'

export function StoreBrand() {
  return <span className='store-brand-lockup'>
    <RegentMark className='size-9' />
    <span className='store-brand-copy'><strong>Regency Stores</strong><span>Your everyday grocer</span></span>
  </span>
}
