import { getLocale } from "next-intl/server";
import fs from "fs/promises";
import path from "path";
import { Link } from "@/i18n/routing";

export default async function TermsAndPrivacyPage() {
  const locale = await getLocale();
  const contentPath = path.join(
    process.cwd(),
    "content",
    `terms-${locale}.html`
  );

  let content = "";
  try {
    content = await fs.readFile(contentPath, "utf-8");
  } catch (error) {
    console.error("Error reading terms content:", error);
    // Fallback to Vietnamese if file not found
    const fallbackPath = path.join(process.cwd(), "content", "terms-vi.html");
    try {
      content = await fs.readFile(fallbackPath, "utf-8");
    } catch (fallbackError) {
      content = "<p>Content not available.</p>";
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f9] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <Link
              href="/auth"
              className="text-custom hover:underline inline-flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              {locale === "vi" ? "Quay lại" : "Back"}
            </Link>
          </div>
          <div className="flex justify-center items-center mb-6">
            <h1 className="text-[30px] font-bold">
              {locale === "vi"
                ? "ĐIỀU KHOẢN VÀ BẢO MẬT"
                : "TERMS AND PRIVACY POLICY"}
            </h1>
          </div>

          <div
            className="terms-content prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
