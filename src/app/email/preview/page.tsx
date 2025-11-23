import ResultsEmail from "@/emails/ResultsEmail";

export const dynamic = "force-static";

export default async function EmailPreview({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const { url } = await searchParams;
  const link = url || "https://example.com";
  // Render the email component directly
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <ResultsEmail url={link} />
      </div>
    </div>
  );
}
