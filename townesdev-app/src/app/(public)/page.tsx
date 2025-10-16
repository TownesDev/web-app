import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to TownesDev!</h1>
      <p className="mt-4 text-lg">Your go-to place for all things development.</p>
      <Image
        src="/logo.png"
        alt="TownesDev Logo"
        width={200}
        height={200}
        className="mt-8"
      /> 

    </div>
  );
}
