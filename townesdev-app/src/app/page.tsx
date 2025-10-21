import PublicHome from './(public)/page'
import PublicLayout from './(public)/layout'

export default async function RootPage() {
  // Render the public layout so Header/Footer/preview banner are present
  return (
    <PublicLayout>
      <PublicHome />
    </PublicLayout>
  )
}
