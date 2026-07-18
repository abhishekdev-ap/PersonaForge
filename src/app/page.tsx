'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Globe,
  FileText,
  ArrowRight,
  ArrowLeft,
  Copy,
  Download,
  Check,
  Loader2,
  User,
  Building2,
  Zap,
  AlertCircle,
  RefreshCw,
  Mail,
  Linkedin,
  Layout,
  MessageSquare,
  ThumbsUp,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type InputMode = 'text' | 'url';
type ContentType = 'landing-page' | 'cold-emails' | 'marketing-copy' | 'linkedin-post';
type Step = 'input' | 'persona' | 'generate' | 'output';

interface Persona {
  type: string;
  name: string;
  role?: string;
  industry?: string;
  seniority?: string;
  company?: string;
  skills?: string[];
  interests?: string[];
  tone_preference?: string;
  summary?: string;
  size?: string;
  target_audience?: string;
  offerings?: string[];
  tone?: string;
  values?: string[];
  [key: string]: unknown;
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string; num: number }[] = [
    { key: 'input', label: 'Input', num: 1 },
    { key: 'persona', label: 'Persona', num: 2 },
    { key: 'generate', label: 'Generate', num: 3 },
    { key: 'output', label: 'Output', num: 4 },
  ];
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              i <= currentIndex
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
              {i < currentIndex ? <Check className="w-3 h-3" /> : step.num}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                i < currentIndex ? 'bg-emerald-600' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Landing Page Preview ───────────────────────────────────────────────────

function LandingPagePreview({ data }: { data: Record<string, unknown> }) {
  const hero = data.hero as { headline: string; subheadline: string; cta_text: string; cta_secondary?: string } | undefined;
  const features = data.features as { icon: string; title: string; description: string }[] | undefined;
  const howItWorks = data.how_it_works as { title: string; steps: { number: string; title: string; description: string }[] } | undefined;
  const socialProof = data.social_proof as { title: string; items: { quote: string; author: string; role: string }[] } | undefined;
  const finalCta = data.final_cta as { headline: string; subheadline: string; cta_text: string } | undefined;
  const footer = data.footer as { tagline: string } | undefined;

  return (
    <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl">
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            {(String(data.name || 'C')[0] || 'C').toUpperCase()}
          </div>
          <span className="font-bold text-lg">{String(data.name || 'Company')}</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <span>Features</span>
          <span>How It Works</span>
          <span>Testimonials</span>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {hero?.cta_text || 'Get Started'}
          </Button>
        </div>
      </div>

      {/* Hero */}
      {hero && (
        <div className="relative px-6 py-20 text-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-zinc-950 dark:to-teal-950/30">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
              {hero.headline}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {hero.subheadline}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-base px-8">
                {hero.cta_text}
              </Button>
              {hero.cta_secondary && (
                <Button size="lg" variant="outline" className="text-base px-8">
                  {hero.cta_secondary}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      {features && features.length > 0 && (
        <div className="px-6 py-16 bg-white dark:bg-zinc-950">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="text-center p-6 rounded-xl border bg-muted/30 hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{f.icon || '✦'}</div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      {howItWorks && howItWorks.steps && (
        <div className="px-6 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{howItWorks.title || 'How It Works'}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.steps.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                    {step.number || i + 1}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Social Proof */}
      {socialProof && socialProof.items && socialProof.items.length > 0 && (
        <div className="px-6 py-16 bg-white dark:bg-zinc-950">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{socialProof.title || 'What People Say'}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {socialProof.items.map((item, i) => (
                <div key={i} className="p-6 rounded-xl border bg-muted/20">
                  <p className="text-sm leading-relaxed italic mb-4">&ldquo;{item.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-sm">{item.author}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      {finalCta && (
        <div className="px-6 py-16 text-center bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{finalCta.headline}</h2>
            <p className="text-emerald-100 mb-8">{finalCta.subheadline}</p>
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-8">
              {finalCta.cta_text}
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="px-6 py-6 border-t text-center text-sm text-muted-foreground bg-muted/20">
          {footer.tagline}
        </div>
      )}
    </div>
  );
}

// ─── Cold Email Cards ───────────────────────────────────────────────────────

function ColdEmailCards({ emails }: { emails: Record<string, unknown>[] }) {
  const targetColors: Record<string, { bg: string; border: string; text: string }> = {
    investor: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400' },
    customer: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400' },
    partner: { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', text: 'text-violet-700 dark:text-violet-400' },
  };

  return (
    <div className="space-y-6">
      {emails.map((email, i) => {
        const tType = String(email.target_type || 'customer');
        const colors = targetColors[tType] || targetColors.customer;

        return (
          <Card key={i} className={`border-2 ${colors.border} ${colors.bg} overflow-hidden`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <Badge className={`${colors.bg} ${colors.text} border ${colors.border} mb-2`}>
                    {tType === 'investor' ? '💰 Investor' : tType === 'partner' ? '🤝 Partner' : '🎯 Customer'}
                  </Badge>
                  <CardTitle className="text-lg">{String(email.target_persona)}</CardTitle>
                  <CardDescription className="mt-1">
                    From: {String(email.sender_title || 'Company Rep')}
                  </CardDescription>
                </div>
                <Mail className={`w-8 h-8 ${colors.text} opacity-30`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject & Preview */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Subject:</span>
                  <span className="font-medium text-sm">{String(email.subject_line)}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Preview:</span>
                  <span className="text-sm text-muted-foreground">{String(email.preview_text)}</span>
                </div>
              </div>

              {/* Email body */}
              <div className="space-y-3 text-sm leading-relaxed">
                <p>{String(email.greeting)}</p>
                <p className="font-medium">{String(email.opening)}</p>
                <p className="whitespace-pre-wrap">{String(email.body)}</p>
              </div>

              {/* CTA */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border">
                <p className="text-sm mb-1">{String(email.cta)}</p>
                <p className="text-sm text-muted-foreground">{String(email.sign_off)}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Marketing Copy ──────────────────────────────────────────────────────────

function MarketingCopyCards({ copies }: { copies: Record<string, unknown>[] }) {
  return (
    <div className="space-y-8">
      {copies.map((copy, i) => {
        const features = copy.features as { name: string; description: string; benefit: string }[] | undefined;
        const usps = copy.usps as { title: string; description: string; proof: string }[] | undefined;

        return (
          <Card key={i} className="border-2 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 pb-4">
              <Badge variant="outline" className="w-fit mb-2">Variant {i + 1}</Badge>
              <CardTitle className="text-2xl">{String(copy.title)}</CardTitle>
              <CardDescription className="text-base mt-1">
                <span className="font-medium text-emerald-700 dark:text-emerald-400">Angle:</span> {String(copy.angle)}
              </CardDescription>
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
                &ldquo;{String(copy.tagline)}&rdquo;
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Executive Summary */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Executive Summary</p>
                <p className="text-sm leading-relaxed">{String(copy.executive_summary)}</p>
              </div>

              {/* Features */}
              {features && features.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Features & Benefits</h3>
                  <div className="grid gap-4">
                    {features.map((f, fi) => (
                      <div key={fi} className="p-4 rounded-lg border bg-muted/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold">{f.name}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{f.description}</p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                              Benefit: {f.benefit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* USPs */}
              {usps && usps.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Unique Selling Propositions</h3>
                  <div className="grid gap-4">
                    {usps.map((u, ui) => (
                      <div key={ui} className="p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                        <p className="font-bold text-emerald-800 dark:text-emerald-300">{u.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{u.description}</p>
                        <p className="text-sm mt-1 italic">{u.proof}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Closing */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed font-medium">{String(copy.closing_statement)}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── LinkedIn Post ───────────────────────────────────────────────────────────

function LinkedInPostPreview({ post }: { post: Record<string, unknown> }) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
        {/* LinkedIn Header */}
        <div className="px-5 py-4 flex items-center gap-3 border-b bg-white dark:bg-zinc-900">
          <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
            {String(post.author_name || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] flex items-center gap-1">
              {String(post.author_name || 'Author')}
              <span className="text-xs text-muted-foreground">· 1st</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">{String(post.author_headline || post.author_role || '')}</p>
            <p className="text-xs text-muted-foreground">Just now · 🌐</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>

        {/* Content */}
        <div className="px-5 py-4 bg-white dark:bg-zinc-900">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{String(post.content || '')}</p>
        </div>

        {/* Hashtags */}
        <div className="px-5 pb-2 bg-white dark:bg-zinc-900">
          <div className="flex flex-wrap gap-1">
            {((post.hashtags || []) as string[]).map((tag, i) => (
              <span key={i} className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                #{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        </div>

        {/* Engagement bar */}
        <div className="px-5 py-2 border-t border-b bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>👍 ❤️ 142</span>
            <span>23 comments · 8 reposts</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-4 border-b bg-white dark:bg-zinc-900">
          {[
            { icon: <ThumbsUp className="w-5 h-5" />, label: 'Like' },
            { icon: <MessageSquare className="w-5 h-5" />, label: 'Comment' },
            { icon: <Repeat2 className="w-5 h-5" />, label: 'Repost' },
            { icon: <Bookmark className="w-5 h-5" />, label: 'Save' },
          ].map((action, i) => (
            <button
              key={i}
              className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>

        {/* CTA note */}
        <div className="px-5 py-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Call to Action:</span> {String(post.call_to_action || '')}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Read Time:</span> {String(post.estimated_read_time || '~1 min')}
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── Format Key Helper ───────────────────────────────────────────────────────

function formatKey(key: string): string {
  return key
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function Home() {
  const [step, setStep] = useState<Step>('input');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [url, setUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [contentType, setContentType] = useState<ContentType>('landing-page');
  const [brief, setBrief] = useState('');
  const [generatedData, setGeneratedData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 → 2: Extract & Build Persona
  const handleExtractAndPersona = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: inputMode,
          url: inputMode === 'url' ? url : undefined,
          text: inputMode === 'text' ? pastedText : undefined,
        }),
      });
      const extractData = await extractRes.json();
      if (!extractData.success) throw new Error(extractData.error);

      const personaRes = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractData.extractedText }),
      });
      const personaData = await personaRes.json();
      if (!personaData.success) throw new Error(personaData.error);
      setPersona(personaData.persona);
      setStep('persona');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [inputMode, url, pastedText]);

  // Step 2 → 3/4: Generate Content
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError('');
    setStep('generate');
    try {
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, contentType, brief }),
      });
      const genData = await genRes.json();
      if (!genData.success) throw new Error(genData.error);
      setGeneratedData(genData);
      setStep('output');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStep('persona');
    } finally {
      setLoading(false);
    }
  }, [persona, contentType, brief]);

  // Export
  const handleExport = useCallback(
    async (format: string) => {
      if (!generatedData) return;
      try {
        const res = await fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variants: generatedData,
            persona,
            contentType,
            format,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const blob = new Blob([data.content], { type: data.mimeType });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        toast({ title: 'Exported successfully!' });
      } catch (err: unknown) {
        toast({
          title: 'Export failed',
          description: err instanceof Error ? err.message : '',
          variant: 'destructive',
        });
      }
    },
    [generatedData, persona, contentType]
  );

  // Copy handler
  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  }, []);

  // Regenerate
  const handleRegenerate = useCallback(() => {
    setGeneratedData(null);
    handleGenerate();
  }, [handleGenerate]);

  // Content type options
  const contentTypes: { value: ContentType; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'landing-page', label: 'Landing Page', icon: <Layout className="w-5 h-5" />, desc: 'Full website landing page' },
    { value: 'cold-emails', label: 'Cold Emails', icon: <Mail className="w-5 h-5" />, desc: '3 emails: investor, customer, partner' },
    { value: 'marketing-copy', label: 'Marketing Copy', icon: <FileText className="w-5 h-5" />, desc: 'Features, USPs, download-ready' },
    { value: 'linkedin-post', label: 'LinkedIn Post', icon: <Linkedin className="w-5 h-5" />, desc: 'Authentic company post' },
  ];

  // Get the content label for export
  const getContentLabel = () => contentTypes.find((c) => c.value === contentType)?.label || contentType;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">PersonaForge</h1>
            <p className="text-xs text-muted-foreground">Identity-aware content generation</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Input ─────────────────────────────── */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">Who are we writing for?</CardTitle>
                  <CardDescription>
                    Paste a company description, LinkedIn bio, or enter a company website URL. We&apos;ll extract identity signals and build a persona.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text" className="gap-2">
                        <FileText className="w-4 h-4" /> Paste Text
                      </TabsTrigger>
                      <TabsTrigger value="url" className="gap-2">
                        <Globe className="w-4 h-4" /> Company URL
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="mt-4">
                      <Textarea
                        placeholder="Paste a company description, LinkedIn bio, or any profile text here..."
                        className="min-h-[200px] resize-y"
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Tip: Include company name, industry, products, target audience for best results.
                      </p>
                    </TabsContent>
                    <TabsContent value="url" className="mt-4">
                      <Input
                        placeholder="https://example.com or example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        We&apos;ll scrape the public website to extract company info.
                      </p>
                    </TabsContent>
                  </Tabs>

                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                    onClick={handleExtractAndPersona}
                    disabled={loading || (inputMode === 'text' ? !pastedText.trim() : !url.trim())}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {loading ? 'Extracting & Building Persona...' : 'Extract & Build Persona'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 2: Persona ───────────────────────────── */}
          {step === 'persona' && persona && (
            <motion.div
              key="persona"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {persona.type === 'individual' ? (
                          <User className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Building2 className="w-6 h-6 text-emerald-600" />
                        )}
                        {persona.name || 'Persona'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {persona.type === 'individual'
                          ? `${persona.role || 'Professional'}${persona.company ? ` at ${persona.company}` : ''}`
                          : `${persona.industry || 'Company'} · ${persona.size || ''}`}
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      {persona.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Summary */}
                  {persona.summary && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Summary</p>
                      <p className="text-sm leading-relaxed">{persona.summary}</p>
                    </div>
                  )}

                  {/* Key attributes */}
                  <div className="grid grid-cols-2 gap-4">
                    {persona.industry && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Industry</p>
                        <p className="text-sm font-medium mt-0.5">{persona.industry}</p>
                      </div>
                    )}
                    {persona.seniority && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seniority</p>
                        <p className="text-sm font-medium mt-0.5 capitalize">{persona.seniority}</p>
                      </div>
                    )}
                    {persona.size && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Size</p>
                        <p className="text-sm font-medium mt-0.5 capitalize">{persona.size}</p>
                      </div>
                    )}
                    {(persona.tone_preference || persona.tone) && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tone</p>
                        <p className="text-sm font-medium mt-0.5 capitalize">
                          {persona.tone_preference || persona.tone}
                        </p>
                      </div>
                    )}
                    {persona.target_audience && (
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Audience</p>
                        <p className="text-sm font-medium mt-0.5">{persona.target_audience}</p>
                      </div>
                    )}
                  </div>

                  {/* Skills/Offerings */}
                  {persona.skills && persona.skills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills & Expertise</p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {persona.offerings && persona.offerings.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Offerings</p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.offerings.map((item, i) => (
                          <Badge key={i} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {persona.interests && persona.interests.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interests</p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.interests.map((item, i) => (
                          <Badge key={i} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {persona.values && persona.values.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Brand Values</p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.values.map((item, i) => (
                          <Badge key={i} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Content type selection */}
                  <div>
                    <p className="text-sm font-semibold mb-3">What do you want to generate?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {contentTypes.map((ct) => (
                        <button
                          key={ct.value}
                          onClick={() => setContentType(ct.value)}
                          className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            contentType === ct.value
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                              : 'border-muted hover:border-muted-foreground/30'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              contentType === ct.value
                                ? 'bg-emerald-600 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {ct.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{ct.label}</p>
                            <p className="text-xs text-muted-foreground">{ct.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional brief */}
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Content Brief <span className="text-muted-foreground font-normal">(optional)</span>
                    </p>
                    <Textarea
                      placeholder="Any specific instructions? e.g., 'Focus on enterprise customers' or 'Emphasize the AI-powered features'..."
                      className="min-h-[80px] resize-y"
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('input')} className="gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                      onClick={handleGenerate}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {loading ? 'Generating...' : `Generate ${getContentLabel()}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 3: Generating (intermediate) ─────────── */}
          {step === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
              <p className="text-lg font-medium">Generating your {getContentLabel().toLowerCase()}...</p>
              <p className="text-sm text-muted-foreground">This usually takes 5-15 seconds</p>
            </motion.div>
          )}

          {/* ── STEP 4: Output ────────────────────────────── */}
          {step === 'output' && generatedData && (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Persona summary bar */}
              <div className="flex items-center justify-between mb-6 bg-muted/50 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  {persona?.type === 'individual' ? (
                    <User className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{persona?.name || 'Persona'}</p>
                    <p className="text-xs text-muted-foreground">{getContentLabel()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleRegenerate}>
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </Button>
                </div>
              </div>

              {/* ── Landing Page Output ─────────────── */}
              {contentType === 'landing-page' && generatedData.hero && (
                <div className="space-y-4">
                  <LandingPagePreview data={generatedData} />
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleCopy(JSON.stringify(generatedData, null, 2))}
                    >
                      <Copy className="w-4 h-4" /> Copy Page JSON
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Cold Emails Output ──────────────── */}
              {contentType === 'cold-emails' && generatedData.emails && (
                <ColdEmailCards emails={generatedData.emails as Record<string, unknown>[]} />
              )}

              {/* ── Marketing Copy Output ───────────── */}
              {contentType === 'marketing-copy' && generatedData.copies && (
                <MarketingCopyCards copies={generatedData.copies as Record<string, unknown>[]} />
              )}

              {/* ── LinkedIn Post Output ─────────────── */}
              {contentType === 'linkedin-post' && generatedData.post && (
                <LinkedInPostPreview post={generatedData.post as Record<string, unknown>} />
              )}

              {/* Actions bar */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50 p-4 rounded-xl">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setStep('persona')}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Edit Persona
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleCopy(JSON.stringify(generatedData, null, 2))}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleExport('md')}
                  >
                    <Download className="w-3.5 h-3.5" /> .md
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleExport('txt')}
                  >
                    <Download className="w-3.5 h-3.5" /> .txt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleExport('json')}
                  >
                    <Download className="w-3.5 h-3.5" /> .json
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>PersonaForge — AI-Powered Content Engine</span>
          <span>No data stored · Stateless pipeline</span>
        </div>
      </footer>
    </div>
  );
}
