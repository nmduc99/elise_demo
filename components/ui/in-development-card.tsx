import { Construction } from "lucide-react";

interface InDevelopmentCardProps {
  title?: string;
  description?: string;
}

export default function InDevelopmentCard({
  title = "Tính năng đang phát triển",
  description = "Tính năng này đang được phát triển và sẽ sớm ra mắt trong thời gian tới."
}: InDevelopmentCardProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <Construction className="h-8 w-8 text-custom" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

