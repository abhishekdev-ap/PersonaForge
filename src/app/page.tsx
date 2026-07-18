'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Globe,
  FileText,
  Upload,
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
type PersonaType = 'individual' | 'company';
type ContentType = 'marketing-copy' | 'landing-page' | 'ui-microcopy' | 'email-sequence';
type Step = 'input' | 'persona' | 'generate' | 'output';

interface Persona {
  type: PersonaType;
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
}

interface ContentVariant {
  title: string;
  angle: string;
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

// ─── Variant Card Renderer ──────────────────────────────────────────────────

function VariantCard({
  variant,
  index,
  contentType,
  onCopy,
}: {
  variant: ContentVariant;
  index: number;
  contentType: ContentType;
  onCopy: (text: string) => void;
}) {
  const colors = [
    'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800',
    'from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800',
    'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800',
  ];

  const accentColors = ['text-emerald-700 dark:text-emerald-400', 'text-violet-700 dark:text-violet-400', 'text-amber-700 dark:text-amber-400'];

  const renderField = (key: string, value: unknown) => {
    if (key === 'title' || key === 'angle') return null;
    if (typeof value === 'string') {
      return (
        <div key={key} className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {formatKey(key)}
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
        </div>
      );
    }
    if (Array.isArray(value)) {
      return (
        <div key={key} className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {formatKey(key)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {value.map((item, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {String(item)}
              </Badge>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`bg-gradient-to-br ${colors[index % 3]} border overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              Variant {index + 1}
            </Badge>
            <CardTitle className={`text-lg ${accentColors[index % 3]}`}>{variant.title}</CardTitle>
            <CardDescription className="mt-1">{variant.angle}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onCopy(JSON.stringify(variant, null, 2))}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="mb-4" />
        {Object.entries(variant).map(([key, value]) => renderField(key, value))}
      </CardContent>
    </Card>
  );
}

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
  const [extractedText, setExtractedText] = useState('');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [contentType, setContentType] = useState<ContentType>('marketing-copy');
  const [brief, setBrief] = useState('');
  const [variants, setVariants] = useState<ContentVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Step 1 → 2: Extract & Build Persona
  const handleExtractAndPersona = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Extract
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
      setExtractedText(extractData.extractedText);

      // Build Persona
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

  // Step 2 → 3: Generate Content
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, contentType, brief }),
      });
      const genData = await genRes.json();
      if (!genData.success) throw new Error(genData.error);
      setVariants(genData.variants || []);
      setStep('output');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [persona, contentType, brief]);

  // Export
  const handleExport = useCallback(
    async (format: string) => {
      try {
        const res = await fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variants, persona, contentType, format }),
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
        toast({ title: 'Export failed', description: err instanceof Error ? err.message : '', variant: 'destructive' });
      }
    },
    [variants, persona, contentType]
  );

  // Copy handler
  const handleCopy = useCallback(async (text: string, index?: number) => {
    await navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
    toast({ title: 'Copied to clipboard!' });
  }, []);

  // Regenerate
  const handleRegenerate = useCallback(() => {
    setVariants([]);
    setStep('generate');
    // Auto-trigger generation
    setTimeout(() => {
      handleGenerate();
    }, 100);
  }, [handleGenerate]);

  // Content type options
  const contentTypes: { value: ContentType; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'marketing-copy', label: 'Marketing Copy', icon: <Zap className="w-5 h-5" />, desc: 'Headlines, body copy, CTAs' },
    { value: 'landing-page', label: 'Landing Page', icon: <Globe className="w-5 h-5" />, desc: 'Hero, value props, social proof' },
    { value: 'ui-microcopy', label: 'UI Microcopy', icon: <FileText className="w-5 h-5" />, desc: 'Buttons, empty states, tooltips' },
    { value: 'email-sequence', label: 'Email Sequence', icon: <Sparkles className="w-5 h-5" />, desc: 'Subject lines, body, sign-offs' },
  ];

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
                    Paste a profile bio, company description, or a company website URL. We&apos;ll
                    extract identity signals and build a persona.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Input mode tabs */}
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
                        placeholder="Paste a LinkedIn bio, resume text, company description, or any profile text here..."
                        className="min-h-[200px] resize-y"
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Tip: The more detail you provide, the richer the persona will be. Include
                        role, industry, skills, and interests for best results.
                      </p>
                    </TabsContent>
                    <TabsContent value="url" className="mt-4">
                      <Input
                        placeholder="https://example.com or example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        We&apos;ll scrape the public website (About page, homepage) to extract
                        company info. This works best with company websites.
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

                  {/* Key attributes grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {persona.industry && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Industry
                        </p>
                        <p className="text-sm font-medium mt-0.5">{persona.industry}</p>
                      </div>
                    )}
                    {persona.seniority && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Seniority
                        </p>
                        <p className="text-sm font-medium mt-0.5 capitalize">{persona.seniority}</p>
                      </div>
                    )}
                    {persona.size && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Company Size
                        </p>
                        <p className="text-sm font-medium mt-0.5 capitalize">{persona.size}</p>
                      </div>
                    )}
                    {(persona.tone_preference || persona.tone) && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Tone
                        </p>
                        <p className="text-sm font-medium mt-0.5 capitalize">
                          {persona.tone_preference || persona.tone}
                        </p>
                      </div>
                    )}
                    {persona.target_audience && (
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Target Audience
                        </p>
                        <p className="text-sm font-medium mt-0.5">{persona.target_audience}</p>
                      </div>
                    )}
                  </div>

                  {/* Skills/Offerings */}
                  {persona.skills && persona.skills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Skills & Expertise
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {persona.offerings && persona.offerings.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Offerings
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.offerings.map((item, i) => (
                          <Badge key={i} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests/Values */}
                  {persona.interests && persona.interests.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Interests
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.interests.map((item, i) => (
                          <Badge key={i} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {persona.values && persona.values.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Brand Values
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.values.map((item, i) => (
                          <Badge key={i} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Content type selection */}
                  <div>
                    <p className="text-sm font-semibold mb-3">What kind of content do you want to generate?</p>
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
                      Content Brief{' '}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </p>
                    <Textarea
                      placeholder="Describe what you want — e.g., 'Write copy for a product launch email targeting CTOs' or 'Landing page for a new AI feature'..."
                      className="min-h-[100px] resize-y"
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
                      {loading ? 'Generating Content...' : 'Generate 3 Variants'}
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
              <p className="text-lg font-medium">Generating your content variants...</p>
              <p className="text-sm text-muted-foreground">This usually takes 5-10 seconds</p>
            </motion.div>
          )}

          {/* ── STEP 4: Output ────────────────────────────── */}
          {step === 'output' && variants.length > 0 && (
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
                    <p className="text-xs text-muted-foreground">
                      {contentType.replace('-', ' ')} · {variants.length} variants
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleRegenerate}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </Button>
                </div>
              </div>

              {/* Variant cards */}
              <div className="grid gap-6">
                {variants.map((variant, i) => (
                  <VariantCard
                    key={i}
                    variant={variant}
                    index={i}
                    contentType={contentType}
                    onCopy={(text) => handleCopy(text, i)}
                  />
                ))}
              </div>

              {/* Actions */}
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
                    onClick={() => handleCopy(
                      variants.map((v, i) => `--- Variant ${i + 1}: ${v.title} ---\n${Object.entries(v)
                        .filter(([, val]) => val !== undefined && val !== null)
                        .map(([k, val]) => `${formatKey(k)}: ${Array.isArray(val) ? val.join(', ') : val}`)
                        .join('\n')}`).join('\n\n')
                    )}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy All
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
          <span>PersonaForge — Powered by Groq LLM</span>
          <span>No data stored · Stateless pipeline</span>
        </div>
      </footer>
    </div>
  );
}
