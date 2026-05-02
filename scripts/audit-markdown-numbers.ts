/**
 * audit-markdown-numbers.ts
 * 5년치 수능 마크다운에서 영역별 문제 번호 표기를 추출해 누락/중복/순서 이상을 매트릭스화한다.
 * 출력: docs/qa/markdown-number-audit.md
 */

import * as fs from "fs";
import * as path from "path";

type Area = "공통" | "확률과통계" | "미적분" | "기하";

interface AreaSlice {
  area: Area;
  startLine: number; // 1-based
  endLine: number;   // inclusive
  numbers: { displayed: number; line: number }[]; // 발견된 ^N\. 라벨
}

interface YearAudit {
  year: number;
  slices: AreaSlice[];
}

const YEARS = [2022, 2023, 2024, 2025, 2026];
const PARSED_DIR = path.resolve(
  process.cwd(),
  "user_docs/suneung-math/parsed"
);

function detectAreaFromConfirmBlock(text: string): Area | null {
  // ## * 확인 사항 블록에서 "이어서, 「선택과목(<X>)」" 추출
  if (text.includes("선택과목(미적분)") || text.includes("「선택과목(미적분)」")) return "미적분";
  if (text.includes("선택과목(기하)") || text.includes("「선택과목(기하)」")) return "기하";
  if (text.includes("선택과목(확률과 통계)") || text.includes("선택과목(확률과통계)")) return "확률과통계";
  return null;
}

function sliceFile(year: number, lines: string[]): AreaSlice[] {
  // 영역 경계: ## * 확인 사항 가 분리자.
  // 첫 영역 = 공통 (year 2022~2026)
  // ## * 확인 사항 블록의 "선택과목(X)" → 다음 영역의 라벨
  // 일부 마크다운(2023/2024/2026)은 한 파일에 짝수형+홀수형 모두 포함되어 있다.
  // 첫 [^0] 라인까지만 첫 시험분량으로 절단.
  let cut = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "[^0]") {
      cut = i;
      break;
    }
  }
  const lines0 = lines.slice(0, cut);

  const confirmIdx: number[] = [];
  for (let i = 0; i < lines0.length; i++) {
    if (lines0[i].startsWith("## * 확인 사항")) confirmIdx.push(i);
  }
  // 이후 lines 참조를 lines0 으로 교체
  // 함수 내부 reassignment for clarity
  // @ts-ignore
  lines = lines0;

  const slices: AreaSlice[] = [];
  // 영역 시작은 0, 그 다음은 confirmIdx[k] + (다음 ## 5지선다형) 부근
  // 영역 식별:
  //   - 첫 영역: 공통, 라인 0 ~ confirmIdx[0]-1
  //   - 그 다음 영역: confirmIdx[k] 블록의 "선택과목(...)" 텍스트 → 영역 라벨,
  //     본문 시작은 confirmIdx[k] 이후 첫 ## 5지선다형 라인부터, 끝은 다음 confirmIdx[k+1]-1 (없으면 EOF)

  // 첫 영역 = 공통
  const firstEnd = confirmIdx.length > 0 ? confirmIdx[0] - 1 : lines.length - 1;
  slices.push({
    area: "공통",
    startLine: 1,
    endLine: firstEnd + 1,
    numbers: [],
  });

  for (let k = 0; k < confirmIdx.length; k++) {
    // 이 confirm 블록 텍스트 (다음 ## 5지선다형 또는 다음 confirm 까지)
    const blockStart = confirmIdx[k];
    let blockEnd = lines.length - 1;
    for (let j = blockStart + 1; j < lines.length; j++) {
      if (lines[j].startsWith("## 5지선다형")) {
        blockEnd = j - 1;
        break;
      }
    }
    const blockText = lines.slice(blockStart, blockEnd + 1).join("\n");
    const area = detectAreaFromConfirmBlock(blockText);
    if (!area) continue;

    // 다음 영역 본문 시작 = blockEnd + 1 (즉 ## 5지선다형 라인)
    // 다음 영역 본문 끝 = 다음 confirmIdx[k+1] - 1 또는 EOF
    const sectionStart = blockEnd + 1;
    const sectionEnd =
      k + 1 < confirmIdx.length ? confirmIdx[k + 1] - 1 : lines.length - 1;

    slices.push({
      area,
      startLine: sectionStart + 1,
      endLine: sectionEnd + 1,
      numbers: [],
    });
  }

  // 각 슬라이스에서 ^(\d+)\. 라인 추출
  const numRe = /^(\d+)\.\s/;
  for (const s of slices) {
    for (let i = s.startLine - 1; i <= s.endLine - 1 && i < lines.length; i++) {
      const m = lines[i].match(numRe);
      if (m) {
        s.numbers.push({
          displayed: parseInt(m[1], 10),
          line: i + 1,
        });
      }
    }
  }

  return slices;
}

function audit(): YearAudit[] {
  const out: YearAudit[] = [];
  for (const year of YEARS) {
    const fp = path.join(PARSED_DIR, `${year}수능문제.md`);
    const raw = fs.readFileSync(fp, "utf8");
    const lines = raw.split(/\r?\n/);
    const slices = sliceFile(year, lines);
    out.push({ year, slices });
  }
  return out;
}

function expectedRange(area: Area): number[] {
  // 공통 1~22, 선택 23~30
  if (area === "공통") return Array.from({ length: 22 }, (_, i) => i + 1);
  return Array.from({ length: 8 }, (_, i) => 23 + i);
}

function buildMarkdown(audits: YearAudit[]): string {
  const out: string[] = [];
  out.push("# 마크다운 문제 번호 감사 (5년 × 4영역)\n");
  out.push(
    "각 영역에서 마크다운 본문에 표기된 `N.` 번호 시퀀스 vs. 기대 시퀀스(공통 1~22 / 선택 23~30) 비교."
  );
  out.push("");
  out.push("## 매트릭스 요약 (영역별 표기 번호 집합 vs 기대)\n");
  out.push("| 연도 | 영역 | 표기 시퀀스 | 누락 | 중복 | 비고 |");
  out.push("|---|---|---|---|---|---|");

  for (const a of audits) {
    for (const s of a.slices) {
      const exp = new Set(expectedRange(s.area));
      const seenList = s.numbers.map((n) => n.displayed);
      const seenSet = new Set(seenList);
      const missing = [...exp].filter((x) => !seenSet.has(x));
      // 중복: 같은 displayed 가 2회 이상 등장
      const dup: number[] = [];
      const cnt = new Map<number, number>();
      for (const v of seenList) cnt.set(v, (cnt.get(v) || 0) + 1);
      for (const [k, v] of cnt) if (v > 1) dup.push(k);

      // shift 검출: 첫 번호가 기대 시작 + 1 인지 (예: 공통 첫 N=2, 선택 첫 N=24)
      const expectedFirst = s.area === "공통" ? 1 : 23;
      const actualFirst = seenList[0] ?? -1;
      const shift = actualFirst === expectedFirst + 1 ? "+1 시프트?" : "";

      out.push(
        `| ${a.year} | ${s.area} | ${seenList.join(",")} | ${
          missing.length ? missing.join(",") : "-"
        } | ${dup.length ? dup.join(",") : "-"} | ${shift} |`
      );
    }
  }

  out.push("");
  out.push("## 상세 (영역별 라인 매핑)\n");
  for (const a of audits) {
    out.push(`### ${a.year}학년도\n`);
    for (const s of a.slices) {
      out.push(
        `- **${s.area}** (lines ${s.startLine}~${s.endLine}, ${s.numbers.length}개 라벨)`
      );
      out.push(
        `  - 표기 → 라인: ${s.numbers
          .map((n) => `${n.displayed}@L${n.line}`)
          .join(", ")}`
      );
    }
    out.push("");
  }

  return out.join("\n");
}

function main() {
  const audits = audit();
  const md = buildMarkdown(audits);
  const outPath = path.resolve(process.cwd(), "docs/qa/markdown-number-audit.md");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md, "utf8");
  console.log(`[audit] wrote ${outPath}`);

  // 콘솔에도 매트릭스만 짧게
  for (const a of audits) {
    for (const s of a.slices) {
      const exp = new Set(expectedRange(s.area));
      const seen = new Set(s.numbers.map((n) => n.displayed));
      const missing = [...exp].filter((x) => !seen.has(x));
      console.log(
        `${a.year} / ${s.area}: ${s.numbers.length}개, missing=[${missing.join(
          ","
        )}], firstN=${s.numbers[0]?.displayed}`
      );
    }
  }
}

main();
