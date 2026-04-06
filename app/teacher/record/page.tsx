"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

export default function RecordPage() {
  const [studentName, setStudentName] = useState("");
  const [attendance, setAttendance] = useState("");
  const [performance, setPerformance] = useState("");
  const [club, setClub] = useState("");
  const [volunteer, setVolunteer] = useState("");
  const [special, setSpecial] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!studentName) return;
    setIsLoading(true);
    setCompletion("");

    try {
      const res = await fetch("/api/teacher/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, attendance, performance, club, volunteer, special }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setCompletion(text);
      }
    } catch (error) {
      console.error("Record generation failed:", error);
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold mb-2">생활기록부 초안 작성</h1>
          <p className="text-[var(--muted-foreground)] mb-8">
            학생 활동 데이터를 입력하면 AI가 생기부 문장을 생성합니다
          </p>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedContainer delay={0.1}>
            <GlassCard className="p-6 space-y-4" hover={false}>
              <div>
                <Label htmlFor="name">학생 이름</Label>
                <Input
                  id="name"
                  placeholder="홍길동"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="attendance">출결 사항</Label>
                <Input
                  id="attendance"
                  placeholder="예: 개근 / 지각 2회 / 결석 1회"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="performance">수행평가 내용 및 점수</Label>
                <Textarea
                  id="performance"
                  placeholder="예: 과학 탐구 보고서 A등급, 영어 프레젠테이션 B+등급"
                  value={performance}
                  onChange={(e) => setPerformance(e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="club">동아리 활동</Label>
                <Input
                  id="club"
                  placeholder="예: 과학탐구반 부장, 주 1회 활동"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="volunteer">봉사활동</Label>
                <Input
                  id="volunteer"
                  placeholder="예: 지역아동센터 학습 멘토링 20시간"
                  value={volunteer}
                  onChange={(e) => setVolunteer(e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="special">특기사항</Label>
                <Textarea
                  id="special"
                  placeholder="예: 교내 과학경진대회 은상, 학급 반장"
                  value={special}
                  onChange={(e) => setSpecial(e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !studentName}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생기부 작성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI 생기부 초안 생성
                  </>
                )}
              </Button>
            </GlassCard>
          </AnimatedContainer>

          <AnimatedContainer delay={0.2}>
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">AI 생기부 초안</h2>
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
                    ? "AI가 생기부를 작성하고 있습니다..."
                    : "학생 정보를 입력한 뒤 생성 버튼을 누르세요"}
                </div>
              )}
            </GlassCard>
          </AnimatedContainer>
        </div>
      </main>
    </>
  );
}
