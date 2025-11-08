import dotenv from 'dotenv'

async function main() {
  dotenv.config({ path: '.env.local' })

  const [{ publicSanity }, { qPlans }] = await Promise.all([
    import('../src/lib/public/client'),
    import('../src/sanity/lib/queries'),
  ])

  const data = await publicSanity.fetch(qPlans as string)
  console.log(JSON.stringify(data, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
