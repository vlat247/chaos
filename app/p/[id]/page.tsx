import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { Globe, Clock } from "lucide-react";

export default async function PublicNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !note) {
    return notFound();
  }

  if (!note.is_public) {
    return (
      <div className="min-h-screen bg-[#1c1c1e] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Globe className="w-8 h-8 text-white/20" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">Private Note</h1>
        <p className="text-white/40 max-w-xs">This note has been marked as private by its owner and cannot be shared.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#1c1c1e] selection:bg-[#eb9b34]/30">
      {/* Paper Texture Overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ 
          backgroundImage: `url('/apple_notes_texture.png')`,
          backgroundSize: '400px'
        }}
      />

      <div className="max-w-3xl mx-auto px-6 py-20 relative z-10">
        <header className="mb-12 flex items-center justify-between text-white/30">
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-[#eb9b34]">
            <Globe className="w-4 h-4" />
            <span>Public Note</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatDate(note.created_at)}</span>
          </div>
        </header>

        <article className="prose prose-invert prose-lg max-w-none">
          {note.image_url && (
            <div className="mb-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={note.image_url} 
                alt="Note attachment" 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          <div className="text-white/90 leading-relaxed text-2xl md:text-3xl font-light whitespace-pre-wrap">
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
              {note.content}
            </ReactMarkdown>
          </div>
        </article>

        <footer className="mt-24 pt-8 border-t border-white/5 text-center">
          <a 
            href="/" 
            className="text-white/20 hover:text-white/60 transition-colors text-sm font-medium tracking-wide uppercase"
          >
            Create your own notes on Chaos
          </a>
        </footer>
      </div>
    </div>
  );
}
