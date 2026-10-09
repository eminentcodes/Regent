import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fail, ok } from '@/lib/http'
import { currentUser, isAdmin } from '@/lib/auth/guard'
import { memwal, knowledgeNamespace } from '@/lib/memwal'
import { workspaceId } from '@/config/shop'

export const runtime = 'nodejs'

const FILES = ['catalogue.md', 'policies.md']

function chunk(markdown: string): string[] {
  const blocks = markdown.split('\n## ')
  const chunks: string[] = []
  for (const block of blocks) {
    const text = block.trim()
    if (text.length > 0) chunks.push(text)
  }
  return chunks
}

export async function POST() {
  const user = await currentUser()
  if (!user) return fail('unauthorized', 'Not signed in', 401)
  if (!isAdmin(user.email)) return fail('forbidden', 'Admin only', 403)

  const namespace = knowledgeNamespace(workspaceId)
  let written = 0

  for (const file of FILES) {
    const full = path.join(process.cwd(), 'knowledge', file)
    const markdown = await readFile(full, 'utf8')
    for (const block of chunk(markdown)) {
      await memwal().remember(block, namespace)
      written += 1
    }
  }

  return ok({ ok: true, namespace, written })
}
