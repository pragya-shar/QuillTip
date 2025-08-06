export default function Home() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-6xl font-bold text-brand-blue mb-4">
          QuillTip
        </h1>
        <p className="text-2xl text-brand-accent font-handwritten mb-8">
          Decentralized Publishing Platform
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
          <h2 className="text-2xl font-semibold text-quill-800 mb-4">
            Phase 1: Core Editor Development
          </h2>
          <div className="space-y-2 text-quill-600">
            <p>✅ Step 1: Next.js project initialized</p>
            <p>✅ Step 2: Tailwind with QuillTip brand colors configured</p>
            <p>✅ Step 3: Project structure created</p>
            <p className="text-quill-400">⏳ Step 4: Installing core dependencies...</p>
          </div>
        </div>
      </div>
    </div>
  );
}