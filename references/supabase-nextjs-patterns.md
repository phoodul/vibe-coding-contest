# Supabase + Next.js 15 — Quick Reference
> Context7 기반 최신 문서 조회 결과. 공모전 개발 시 빠른 참조용.

---

## Table of Contents

1. [Installation & Environment](#1-installation--environment)
2. [Client Setup (Server / Browser / Middleware)](#2-client-setup)
3. [Auth Patterns](#3-auth-patterns)
4. [Row Level Security (RLS)](#4-row-level-security-rls)
5. [Database Queries](#5-database-queries)
6. [Realtime Subscriptions](#6-realtime-subscriptions)
7. [Storage](#7-storage)
8. [Edge Functions](#8-edge-functions)
9. [TypeScript Type Generation](#9-typescript-type-generation)

---

## 1. Installation & Environment

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**.env.local**

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...   # anon key (safe for browser)
SUPABASE_SERVICE_ROLE_KEY=eyJ...               # server-only, never expose
```

> `PUBLISHABLE_KEY`는 Supabase 대시보드 Settings > API 에서 확인. 이전 문서에서는 `ANON_KEY`라 표기.

---

## 2. Client Setup

프로젝트 루트에 `utils/supabase/` 폴더를 생성하고, 용도별 클라이언트를 분리한다.

### 2-1. Browser Client (`utils/supabase/client.ts`)

Client Component에서 사용. 브라우저에서 실행된다.

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

### 2-2. Server Client (`utils/supabase/server.ts`)

Server Component, Server Action, Route Handler에서 사용.

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 setAll이 실패할 수 있음.
            // middleware가 세션을 refresh하므로 무시해도 안전.
          }
        },
      },
    }
  );
}
```

### 2-3. Middleware (`utils/supabase/middleware.ts`)

만료된 Auth 토큰을 갱신하고, 갱신된 토큰을 Server Component와 브라우저에 전달한다.

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 — 반드시 getUser() 호출
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 사용자를 로그인 페이지로 리다이렉트 (선택)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

### 2-4. Root Middleware (`middleware.ts`)

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // _next/static, _next/image, favicon 등 정적 파일 제외
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## 3. Auth Patterns

### 3-1. Sign Up (Server Action)

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) redirect("/error");

  // Supabase가 확인 이메일 전송. 사용자에게 안내 페이지로 리다이렉트.
  redirect("/check-email");
}
```

### 3-2. Sign In with Password (Server Action)

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) redirect("/error");

  redirect("/dashboard");
}
```

### 3-3. Sign In with OAuth (Client Component)

```tsx
"use client";

import { createClient } from "@/utils/supabase/client";

export function OAuthButton() {
  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google", // "github", "kakao", etc.
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return <button onClick={handleSignIn}>Google로 로그인</button>;
}
```

### 3-4. OAuth Callback Route Handler (`app/auth/callback/route.ts`)

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
```

### 3-5. Sign Out (Server Action)

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

### 3-6. Get Current User (Server Component)

```tsx
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // getUser()는 Auth 서버에 토큰을 검증 요청. 서버 코드에서 항상 이것을 사용.
  // getSession()은 JWT를 로컬에서만 파싱하므로 보안 로직에 사용하지 말 것.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>로그인이 필요합니다.</p>;
  }

  return <h1>안녕하세요, {user.email}</h1>;
}
```

### 3-7. Password Reset

```ts
// 1) 비밀번호 재설정 이메일 전송
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/auth/callback?next=/update-password`,
});

// 2) 새 비밀번호 설정 (콜백 후)
const { error } = await supabase.auth.updateUser({
  password: newPassword,
});
```

---

## 4. Row Level Security (RLS)

### 4-0. RLS 핵심 규칙

| Operation | `USING` | `WITH CHECK` |
|-----------|---------|--------------|
| SELECT    | **필수** | 사용 안 함    |
| INSERT    | 사용 안 함 | **필수**    |
| UPDATE    | 대부분 필요 | **필수**    |
| DELETE    | **필수** | 사용 안 함    |

- `USING`: 기존 행에 대한 접근 필터 (어떤 행을 볼/수정/삭제할 수 있는가)
- `WITH CHECK`: 새로 쓰여지는 행에 대한 검증 (이 데이터를 넣어도 되는가)
- `auth.uid()`: 현재 인증된 사용자의 UUID 반환
- `auth.jwt()`: 현재 JWT 클레임 전체 반환
- `TO` 절: `authenticated`, `anon`, 또는 커스텀 role 지정

### 4-1. RLS 활성화

```sql
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 테이블 소유자(보통 postgres)는 RLS를 무시함.
-- 소유자에게도 강제하려면:
ALTER TABLE todos FORCE ROW LEVEL SECURITY;
```

### 4-2. 기본 CRUD 정책 (개인 데이터)

```sql
-- 본인 데이터만 조회
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 본인 데이터만 삽입
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 본인 데이터만 수정
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 본인 데이터만 삭제
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 4-3. Public 읽기 + Private 쓰기

```sql
-- 모든 사용자(비로그인 포함)가 읽기 가능
CREATE POLICY "Public read access"
  ON posts FOR SELECT
  TO anon, authenticated
  USING (true);

-- 작성자만 수정 가능
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);
```

### 4-4. Public / Private 플래그 혼합

```sql
-- 공개 게시물은 누구나, 비공개 게시물은 작성자만
CREATE POLICY "Read posts"
  ON posts FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR auth.uid() = author_id
  );
```

### 4-5. 관계 테이블 기반 (팀/조직)

```sql
-- 같은 팀 멤버만 프로젝트 조회
CREATE POLICY "Team members can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
        AND team_members.user_id = auth.uid()
    )
  );
```

### 4-6. Role 기반 정책

```sql
-- JWT 클레임에서 role 확인
CREATE POLICY "Admins can do anything"
  ON todos FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'user_role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');
```

### 4-7. Service Role (RLS 우회)

```ts
// 서버 전용 — 절대 클라이언트에 노출하지 말 것
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// service_role 키로 생성한 클라이언트는 RLS를 완전히 우회함
const { data } = await supabaseAdmin.from("todos").select("*");
```

### 4-8. RLS 성능 팁

```sql
-- RLS 정책에서 사용하는 컬럼에 인덱스 추가
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_team_members_user_team ON team_members(user_id, team_id);
```

### 4-9. Storage RLS 정책

```sql
-- storage.objects 테이블에 정책 적용
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 5. Database Queries

### 5-1. SELECT (조회)

```ts
// 전체 조회
const { data, error } = await supabase.from("todos").select("*");

// 컬럼 지정
const { data } = await supabase.from("todos").select("id, title, is_complete");

// 관계 조회 (Foreign Key)
const { data } = await supabase
  .from("todos")
  .select("*, profiles(username, avatar_url)");

// 카운트만
const { count } = await supabase
  .from("todos")
  .select("*", { count: "exact", head: true });
```

### 5-2. INSERT (삽입)

```ts
// 단일 삽입
const { data, error } = await supabase
  .from("todos")
  .insert({ title: "New todo", user_id: userId })
  .select(); // .select()를 호출해야 삽입된 데이터 반환

// 다중 삽입
const { data } = await supabase
  .from("todos")
  .insert([
    { title: "Todo 1", user_id: userId },
    { title: "Todo 2", user_id: userId },
  ])
  .select();
```

### 5-3. UPDATE (수정)

```ts
const { data, error } = await supabase
  .from("todos")
  .update({ is_complete: true })
  .eq("id", todoId)
  .select(); // 수정된 행 반환
```

### 5-4. UPSERT

```ts
const { data } = await supabase
  .from("todos")
  .upsert({ id: existingId, title: "Updated title" })
  .select();
```

### 5-5. DELETE (삭제)

```ts
const { error } = await supabase.from("todos").delete().eq("id", todoId);
```

### 5-6. Filters

```ts
const { data } = await supabase
  .from("todos")
  .select("*")
  .eq("user_id", userId)          // = 같음
  .neq("status", "archived")      // != 다름
  .gt("priority", 3)              // > 초과
  .gte("priority", 3)             // >= 이상
  .lt("priority", 8)              // < 미만
  .lte("priority", 8)             // <= 이하
  .like("title", "%urgent%")      // LIKE 패턴
  .ilike("title", "%URGENT%")     // ILIKE (대소문자 무시)
  .is("deleted_at", null)         // IS NULL
  .in("status", ["active", "pending"])  // IN 배열
  .contains("tags", ["work"])     // @> 배열 포함
  .or("is_public.eq.true,author_id.eq." + userId); // OR 조건
```

### 5-7. Ordering & Pagination

```ts
const { data } = await supabase
  .from("todos")
  .select("*")
  .order("created_at", { ascending: false })
  .range(0, 9); // 0~9번째 행 (10개)

// limit만 사용
const { data } = await supabase.from("todos").select("*").limit(5);
```

### 5-8. Single Row

```ts
const { data } = await supabase
  .from("todos")
  .select("*")
  .eq("id", todoId)
  .single(); // 1행만 반환, 없으면 error
```

### 5-9. RPC (Stored Procedure)

```ts
const { data, error } = await supabase.rpc("get_user_stats", {
  target_user_id: userId,
});
```

---

## 6. Realtime Subscriptions

### 6-1. Postgres Changes 수신

```ts
const channel = supabase
  .channel("todos-changes")
  .on(
    "postgres_changes",
    {
      event: "*",          // "INSERT" | "UPDATE" | "DELETE" | "*"
      schema: "public",
      table: "todos",
    },
    (payload) => {
      console.log("Change:", payload.eventType, payload.new, payload.old);
    }
  )
  .subscribe();
```

### 6-2. 필터 적용

```ts
const channel = supabase
  .channel("my-todos")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "todos",
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log("New todo:", payload.new);
    }
  )
  .subscribe();
```

### 6-3. 여러 이벤트 동시 수신

```ts
const channel = supabase
  .channel("multi-events")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
    (payload) => handleNewMessage(payload.new))
  .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users" },
    (payload) => handleUserUpdate(payload.new))
  .subscribe();
```

### 6-4. 구독 해제

```ts
// 채널 해제
await supabase.removeChannel(channel);

// 모든 채널 해제
await supabase.removeAllChannels();
```

### 6-5. Broadcast (클라이언트 간 메시지)

```ts
// 송신
const channel = supabase.channel("room-1");
channel.subscribe((status) => {
  if (status === "SUBSCRIBED") {
    channel.send({
      type: "broadcast",
      event: "cursor-pos",
      payload: { x: 100, y: 200 },
    });
  }
});

// 수신
channel.on("broadcast", { event: "cursor-pos" }, (payload) => {
  console.log("Cursor:", payload.payload);
});
```

### 6-6. Presence (온라인 상태)

```ts
const channel = supabase.channel("room-1");

channel.on("presence", { event: "sync" }, () => {
  const state = channel.presenceState();
  console.log("Online users:", state);
});

channel.subscribe(async (status) => {
  if (status === "SUBSCRIBED") {
    await channel.track({ user_id: userId, online_at: new Date().toISOString() });
  }
});
```

### 6-7. Realtime을 위한 RLS 설정

Realtime은 RLS를 존중한다. 테이블에 적절한 SELECT 정책이 있어야 변경 사항을 수신할 수 있다.

```sql
-- Supabase Dashboard > Database > Publications 에서
-- supabase_realtime publication에 테이블 추가 필요
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
```

---

## 7. Storage

### 7-1. 파일 업로드

```ts
const { data, error } = await supabase.storage
  .from("avatars") // 버킷 이름
  .upload(`${userId}/profile.png`, file, {
    cacheControl: "3600",
    upsert: true, // 같은 경로에 덮어쓰기
  });
```

### 7-2. 파일 다운로드

```ts
const { data, error } = await supabase.storage
  .from("avatars")
  .download(`${userId}/profile.png`);
// data는 Blob
```

### 7-3. Public URL (공개 버킷)

```ts
const { data } = supabase.storage
  .from("public-images")
  .getPublicUrl("hero.png");

// data.publicUrl = "https://<project>.supabase.co/storage/v1/object/public/public-images/hero.png"
```

### 7-4. Signed URL (비공개 버킷)

```ts
const { data, error } = await supabase.storage
  .from("avatars")
  .createSignedUrl(`${userId}/profile.png`, 60 * 60); // 3600초 (1시간)

// data.signedUrl
```

### 7-5. Signed Upload URL (서버에서 생성, 클라이언트에서 업로드)

```ts
// Server Action
const { data, error } = await supabase.storage
  .from("avatars")
  .createSignedUploadUrl(`${userId}/profile.png`);
// data.signedUrl, data.token — 클라이언트에 전달

// Client
const { error } = await supabase.storage
  .from("avatars")
  .uploadToSignedUrl(`${userId}/profile.png`, token, file);
```

### 7-6. 파일 삭제

```ts
const { error } = await supabase.storage
  .from("avatars")
  .remove([`${userId}/profile.png`]);
```

### 7-7. 파일 목록

```ts
const { data, error } = await supabase.storage
  .from("avatars")
  .list(userId, {
    limit: 100,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" },
  });
```

### 7-8. Storage 버킷 생성 (SQL / Dashboard)

```sql
-- 공개 버킷
INSERT INTO storage.buckets (id, name, public) VALUES ('public-images', 'public-images', true);

-- 비공개 버킷
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false);
```

---

## 8. Edge Functions

### 8-1. 생성 & 구조

```bash
supabase functions new my-function
```

생성되는 파일: `supabase/functions/my-function/index.ts`

```ts
// supabase/functions/my-function/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    // Authorization 헤더에서 JWT 추출
    const authHeader = req.headers.get("Authorization")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 인증된 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();

    // 비즈니스 로직
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user?.id);

    return new Response(JSON.stringify({ data }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
```

### 8-2. 로컬 실행

```bash
supabase start           # 로컬 Supabase 실행
supabase functions serve  # 모든 함수 로컬 서빙 (핫 리로드)
# http://localhost:54321/functions/v1/my-function
```

### 8-3. 배포

```bash
supabase functions deploy my-function
```

### 8-4. 클라이언트에서 호출

```ts
const { data, error } = await supabase.functions.invoke("my-function", {
  body: { name: "world" },
});
```

### 8-5. CORS 설정

```ts
// Edge Function 내부
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // OPTIONS preflight 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // ... 로직 ...

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

### 8-6. 환경 변수

```bash
# .env.local (로컬 개발)
MY_SECRET=super-secret-value

# 프로덕션 배포 시
supabase secrets set MY_SECRET=super-secret-value
```

```ts
// Edge Function에서 접근
const secret = Deno.env.get("MY_SECRET");
```

---

## 9. TypeScript Type Generation

### 9-1. CLI로 타입 생성

```bash
npx supabase gen types typescript --project-id <project-ref> > types/supabase.ts
```

### 9-2. 타입 적용

```ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

### 9-3. 타입 활용 예시

```ts
type Todo = Database["public"]["Tables"]["todos"]["Row"];
type TodoInsert = Database["public"]["Tables"]["todos"]["Insert"];
type TodoUpdate = Database["public"]["Tables"]["todos"]["Update"];
```

---

## Quick Recipe: 전체 Auth + RLS 워크플로우

```sql
-- 1. 테이블 생성
CREATE TABLE public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS 활성화
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 3. 정책 생성
CREATE POLICY "Users manage own todos" ON public.todos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;

-- 5. 인덱스
CREATE INDEX idx_todos_user_id ON public.todos(user_id);
```

```ts
// Next.js Server Action
"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTodo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase.from("todos").insert({
    title: formData.get("title") as string,
    user_id: user.id,
  });

  revalidatePath("/todos");
}
```

---

## Sources

- [Setting up Server-Side Auth for Next.js — Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Creating a Supabase client for SSR — Supabase Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Row Level Security — Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [RLS Policy AI Prompt — supabase/supabase GitHub](https://github.com/supabase/supabase/blob/master/examples/prompts/database-rls-policies.md)
- [JavaScript: Fetch data — Supabase Docs](https://supabase.com/docs/reference/javascript/select)
- [Postgres Changes (Realtime) — Supabase Docs](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Storage Buckets — Supabase Docs](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Edge Functions — Supabase Docs](https://supabase.com/docs/guides/functions)
- [Use Supabase Auth with Next.js — Supabase Docs](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
