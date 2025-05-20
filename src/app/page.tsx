import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex space-x-1">
          <h3>Good morning, </h3>
          <h3 className="bg-gradient-to-r from-primary2 to-secondary2 bg-clip-text text-transparent">
            nickname!
          </h3>
        </div>
        <Card className=" shadow-lg rounded-xl p-4 w-48">
          <CardHeader className="flex flex-col items-start">
            {" "}
            <Image
              src="/icono.png"
              alt="icono"
              width={32}
              height={32}
              className="mb-2 w-48"
            />
            <CardTitle className="text-xl font-bold">Card Title</CardTitle>
            <CardDescription className="text-sm">
              Card Description
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
