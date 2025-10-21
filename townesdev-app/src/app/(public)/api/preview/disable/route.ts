import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST() {
  const draft = await draftMode()

  draft.disable()

  redirect('/')
}
