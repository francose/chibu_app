import Image from "next/image";
import Test from "./landing/page";

export default function Home() {
  return (
    <main>
      <div className="bg-gray-100 flex items-center justify-center h-screen">
        <div className="bg-black p-8 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-4">Welcome!</h1>
          <p className="text-gray-200 text-center">Chibu Assistant</p>
        </div>
      </div>
    </main>
  );
}
