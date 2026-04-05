"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

export default function FeedbackPage() {
  const [title, setTitle] = useState("");
  const [rubric, setRubric] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [copied, setCopied] = useState(false);

  const { completion, isLoading, complete } = useCompletion({
    api: "/api/teacher/feedback",
  });

  async function handleGenerate() {
    if (!rubric || !studentAnswer) return;
    await complete("", {
      body: { title, rubric, studentAnswer },
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
        <AnimatedContainer>
          <h1 className="text-3xl font-bold mb-2">수행평가 피드백 생성</h1>
          <p className="text-[var(--muted-foreground)] mb-8">
            루브릭과 학생 답안을 입력하면 AI가 피드백 초안을 생성합니다
          </p>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <AnimatedContainer delay={0.1}>
            <GlassCard className="p-6 space-y-4" hover={false}>
              <div>
                <Label htmlFor="title">평가 제목</Label>
                <Input
                  id="title"
                  placeholder="예: 2학기 과학 보고서 평가"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="rubric">루브릭 (채점 기준)</Label>
                <Textarea
                  id="rubric"
                  placeholder="예:&#10;1. 주제 이해도 (30점): 주제를 정확히 파악하고 핵심을 서술&#10;2. 논리적 구성 (30점): 서론-본론-결론의 구조&#10;3. 근거 제시 (20점): 구체적 사례나 데이터 활용&#10;4. 표현력 (20점): 문장의 명확성과 어휘의 적절성"
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  className="mt-1.5 min-h-[150px] bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="answer">학생 답안</Label>
                <Textarea
                  id="answer"
                  placeholder="학생이 작성한 답안을 붙여넣으세요..."
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  className="mt-1.5 min-h-[150px] bg-white/5 border-white/10"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !rubric || !studentAnswer}
                className="w-full bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)] hover:opacity-90 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    피드백 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI 피드백 생성
                  </>
                )}
              </Button>
            </GlassCard>
          </AnimatedContainer>

          {/* Output */}
          <AnimatedContainer delay={0.2}>
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">AI 피드백 초안</h2>
                {completion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-[var(--muted-foreground)]"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copied ? "복사됨" : "복사"}
                  </Button>
                )}
              </div>
              {completion ? (
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                  {completion}
                </div>
              ) : (
                <div className="text-[var(--muted-foreground)] text-sm text-center py-12">
                  {isLoading
                    ? "AI가 피드백을 작성하고 있습니다..."
                    : "루브릭과 답안을 입력한 뒤 생성 버튼을 누르세요"}
                </div>
              )}
            </GlassCard>
          </AnimatedContainer>
        </div>
      </main>
    </>
  );
}
