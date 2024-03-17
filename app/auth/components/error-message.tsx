import { ShieldX } from "lucide-react";

export default function ErrorMessage({ message, className = "" }: { message: string, className?: string }) {
  return (
    <div className={"rounded-md bg-red-50 p-4 " + className}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ShieldX className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-medium text-red-800 ml-2">
          {message}
        </h3>
      </div>
    </div>
  );
}
