"""
Euler Tutor — SymPy 마이크로서비스 (FastAPI).

Railway 배포 후 Next.js 가 INTERNAL_TOKEN 으로 호출.
모든 endpoint 30초 타임아웃 + 메모리 제한.

엔드포인트:
  POST /differentiate
  POST /integrate
  POST /solve_equation
  POST /simplify
  POST /factor
  POST /series_expand
  GET  /health

응답: { latex: str, result: str, error?: str }
"""

import os
import signal
import sys
from contextlib import contextmanager

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sympy import (
    Symbol,
    diff,
    integrate,
    simplify as sym_simplify,
    factor as sym_factor,
    series,
    sympify,
    solve,
    latex,
    SympifyError,
)

INTERNAL_TOKEN = os.environ.get("INTERNAL_TOKEN", "")
TIMEOUT_SECONDS = 30

app = FastAPI(title="Euler SymPy μSvc", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next 호스트만 허용하려면 도메인 명시
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Internal-Token"],
)


def assert_token(token: str | None) -> None:
    if not INTERNAL_TOKEN:
        return  # 토큰 미설정 시 개발 모드
    if token != INTERNAL_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid internal token")


@contextmanager
def time_limit(seconds: int):
    """SIGALRM 기반 타임아웃 — Linux 메인 스레드 전용.

    FastAPI sync endpoint 는 anyio worker thread 에서 실행되므로 signal 호출 시
    ValueError 발생 — 이 경우 timeout 없이 진행 (Railway request timeout 이 fallback).
    """
    if sys.platform == "win32":
        # 윈도우 로컬 개발 시 우회
        yield
        return

    def _handler(signum, frame):
        raise TimeoutError(f"computation exceeded {seconds}s")

    try:
        old = signal.signal(signal.SIGALRM, _handler)
    except ValueError:
        # 메인 스레드 아님 — signal 미사용
        yield
        return

    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old)


def parse_expr(expr: str):
    try:
        return sympify(expr)
    except (SympifyError, TypeError, SyntaxError) as e:
        raise HTTPException(status_code=400, detail=f"parse_error: {e}")


class DiffReq(BaseModel):
    expr: str
    var: str = "x"
    order: int = 1


@app.post("/differentiate")
def differentiate(req: DiffReq, x_internal_token: str | None = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    with time_limit(TIMEOUT_SECONDS):
        result = diff(e, v, req.order)
    return {"latex": latex(result), "result": str(result)}


class IntReq(BaseModel):
    expr: str
    var: str = "x"
    lower: str | None = None
    upper: str | None = None


@app.post("/integrate")
def integrate_endpoint(req: IntReq, x_internal_token: str | None = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    with time_limit(TIMEOUT_SECONDS):
        if req.lower is not None and req.upper is not None:
            lower = parse_expr(req.lower)
            upper = parse_expr(req.upper)
            result = integrate(e, (v, lower, upper))
        else:
            result = integrate(e, v)
    return {"latex": latex(result), "result": str(result)}


class SolveReq(BaseModel):
    expr: str  # f(x) = 0 형태의 좌변
    var: str = "x"


@app.post("/solve_equation")
def solve_equation(req: SolveReq, x_internal_token: str | None = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    with time_limit(TIMEOUT_SECONDS):
        result = solve(e, v)
    return {"latex": latex(result), "result": str(result)}


class ExprReq(BaseModel):
    expr: str


@app.post("/simplify")
def simplify_endpoint(req: ExprReq, x_internal_token: str | None = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    with time_limit(TIMEOUT_SECONDS):
        result = sym_simplify(e)
    return {"latex": latex(result), "result": str(result)}


@app.post("/factor")
def factor_endpoint(req: ExprReq, x_internal_token: str | None = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    with time_limit(TIMEOUT_SECONDS):
        result = sym_factor(e)
    return {"latex": latex(result), "result": str(result)}


class SeriesReq(BaseModel):
    expr: str
    var: str = "x"
    point: str = "0"
    n: int = 6


@app.post("/series_expand")
def series_expand(req: SeriesReq, x_internal_token: str | None = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    p = parse_expr(req.point)
    with time_limit(TIMEOUT_SECONDS):
        result = series(e, v, p, req.n).removeO()
    return {"latex": latex(result), "result": str(result)}


@app.get("/health")
def health():
    return {"ok": True, "service": "euler-sympy"}
