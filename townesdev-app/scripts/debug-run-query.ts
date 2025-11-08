import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const { runQueryNoCache } = await import('../src/lib/client')
  const { qPlans } = await import('../src/sanity/lib/queries')

  const data = await runQueryNoCache(qPlans as string)
  console.log(JSON.stringify(data, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
