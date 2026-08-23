import { HomePage } from "@/components/landing/home-page"
import { getPublicMascots } from "@/lib/store/public-mascots"

export default async function Home() {
  const initialProducts = await getPublicMascots()

  return <HomePage initialProducts={initialProducts} />
}
