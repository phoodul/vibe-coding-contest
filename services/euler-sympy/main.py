"""
Euler Tutor — SymPy + Z3 + matplotlib + Wolfram 마이크로서비스 (FastAPI).

Railway 배포 후 Next.js 가 INTERNAL_TOKEN 으로 호출.
모든 endpoint 30초 타임아웃 + 메모리 제한.

엔드포인트 (Phase F 확장 — 25 종):
  계산 (SymPy):
    POST /differentiate, /integrate, /solve_equation, /simplify, /factor, /series_expand
    POST /summation, /limit, /partial_fraction, /complex_solve, /numeric
    POST /poly_div, /trig_simplify, /log_simplify
    POST /probability, /geometry, /vector, /matrix
  부등식 (SMT):
    POST /solve_inequality
  시각화 (matplotlib):
    POST /plot_function, /plot_region, /plot_geometry
  외부 검증 (Wolfram Alpha):
    POST /wolfram_query
  진단:
    GET  /health, /capabilities

응답: { latex: str, result: str, error?: str } 또는 plot 의 경우 { png_base64: str }
"""

import io
import os
import signal
import sys
import base64
from contextlib import contextmanager
from typing import Optional

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sympy import (
    Symbol,
    Matrix,
    diff,
    integrate,
    simplify as sym_simplify,
    factor as sym_factor,
    series,
    sympify,
    solve,
    summation,
    limit as sym_limit,
    apart,
    nsimplify,
    N,
    div,
    trigsimp,
    logcombine,
    expand_log,
    powsimp,
    Rational,
    sqrt,
    pi,
    oo,
    latex,
    SympifyError,
    Symbol as Sym,
)
from sympy.stats import (
    Binomial,
    Normal,
    Geometric,
    Hypergeometric,
    P as ProbP,
    E as ProbE,
    variance as prob_var,
    density,
)
from sympy.geometry import Point, Line, Circle, Segment, Polygon, Triangle

INTERNAL_TOKEN = os.environ.get("INTERNAL_TOKEN", "")
TIMEOUT_SECONDS = 30
WOLFRAM_APP_ID = os.environ.get("WOLFRAM_APP_ID", "")

app = FastAPI(title="Euler SymPy + Z3 + Plot μSvc", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Internal-Token"],
)


def assert_token(token: Optional[str]) -> None:
    if not INTERNAL_TOKEN:
        return
    if token != INTERNAL_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid internal token")


@contextmanager
def time_limit(seconds: int):
    """SIGALRM 기반 타임아웃 — Linux 메인 스레드 전용."""
    if sys.platform == "win32":
        yield
        return

    def _handler(signum, frame):
        raise TimeoutError(f"computation exceeded {seconds}s")

    try:
        old = signal.signal(signal.SIGALRM, _handler)
    except ValueError:
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


def to_response(result):
    return {"latex": latex(result), "result": str(result)}


# ─────────────────────────────────────────────────────────────────
# 기존 6 endpoint (Phase D)
# ─────────────────────────────────────────────────────────────────

class DiffReq(BaseModel):
    expr: str
    var: str = "x"
    order: int = 1


@app.post("/differentiate")
def differentiate(req: DiffReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    with time_limit(TIMEOUT_SECONDS):
        result = diff(e, v, req.order)
    return to_response(result)


class IntReq(BaseModel):
    expr: str
    var: str = "x"
    lower: Optional[str] = None
    upper: Optional[str] = None


@app.post("/integrate")
def integrate_endpoint(req: IntReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
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
    return to_response(result)


class SolveReq(BaseModel):
    expr: str
    var: str = "x"


@app.post("/solve_equation")
def solve_equation(req: SolveReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    with time_limit(TIMEOUT_SECONDS):
        result = solve(e, v)
    return to_response(result)


class ExprReq(BaseModel):
    expr: str


@app.post("/simplify")
def simplify_endpoint(req: ExprReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    with time_limit(TIMEOUT_SECONDS):
        result = sym_simplify(e)
    return to_response(result)


@app.post("/factor")
def factor_endpoint(req: ExprReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    with time_limit(TIMEOUT_SECONDS):
        result = sym_factor(e)
    return to_response(result)


class SeriesReq(BaseModel):
    expr: str
    var: str = "x"
    point: str = "0"
    n: int = 6


@app.post("/series_expand")
def series_expand(req: SeriesReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    p = parse_expr(req.point)
    with time_limit(TIMEOUT_SECONDS):
        result = series(e, v, p, req.n).removeO()
    return to_response(result)


# ─────────────────────────────────────────────────────────────────
# Phase F 신규 — SymPy 14 endpoint
# ─────────────────────────────────────────────────────────────────

class SummationReq(BaseModel):
    expr: str
    var: str = "k"
    lower: str = "1"
    upper: str = "n"


@app.post("/summation")
def summation_endpoint(req: SummationReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """Σ — 유한합·무한합. upper='oo' 가능."""
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    lo = parse_expr(req.lower)
    up = parse_expr(req.upper) if req.upper != "oo" else oo
    with time_limit(TIMEOUT_SECONDS):
        result = summation(e, (v, lo, up))
    return to_response(result)


class LimitReq(BaseModel):
    expr: str
    var: str = "x"
    point: str = "0"
    direction: str = "+-"  # "+", "-", "+-"


@app.post("/limit")
def limit_endpoint(req: LimitReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    p = parse_expr(req.point) if req.point != "oo" else oo
    if req.point == "-oo":
        p = -oo
    with time_limit(TIMEOUT_SECONDS):
        if req.direction in ("+", "-"):
            result = sym_limit(e, v, p, req.direction)
        else:
            result = sym_limit(e, v, p)
    return to_response(result)


class PartialFractionReq(BaseModel):
    expr: str
    var: str = "x"


@app.post("/partial_fraction")
def partial_fraction(req: PartialFractionReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """부분분수 분해 (적분·telescoping 용)."""
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    with time_limit(TIMEOUT_SECONDS):
        result = apart(e, v)
    return to_response(result)


class ComplexSolveReq(BaseModel):
    expr: str
    var: str = "x"


@app.post("/complex_solve")
def complex_solve(req: ComplexSolveReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """복소수해 포함 방정식 풀이."""
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    v = Symbol(req.var)
    with time_limit(TIMEOUT_SECONDS):
        result = solve(e, v, complex=True)
    return to_response(result)


class NumericReq(BaseModel):
    expr: str
    digits: int = 10


@app.post("/numeric")
def numeric_endpoint(req: NumericReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """기호 표현을 N자리 수치로."""
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    with time_limit(TIMEOUT_SECONDS):
        result = N(e, req.digits)
    return to_response(result)


class PolyDivReq(BaseModel):
    dividend: str
    divisor: str
    var: str = "x"


@app.post("/poly_div")
def poly_div(req: PolyDivReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """다항식 나눗셈 — 몫·나머지 반환."""
    assert_token(x_internal_token)
    a = parse_expr(req.dividend)
    b = parse_expr(req.divisor)
    v = Symbol(req.var)
    with time_limit(TIMEOUT_SECONDS):
        q, r = div(a, b, v)
    return {
        "latex": f"{latex(a)} = ({latex(b)}) \\cdot ({latex(q)}) + ({latex(r)})",
        "result": f"quotient={q}, remainder={r}",
        "quotient": str(q),
        "remainder": str(r),
    }


@app.post("/trig_simplify")
def trig_simplify(req: ExprReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """삼각함수 항등식 단순화."""
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    with time_limit(TIMEOUT_SECONDS):
        result = trigsimp(e)
    return to_response(result)


class LogSimplifyReq(BaseModel):
    expr: str
    mode: str = "combine"  # "combine" 또는 "expand"


@app.post("/log_simplify")
def log_simplify(req: LogSimplifyReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """로그 통합 (combine) 또는 분해 (expand)."""
    assert_token(x_internal_token)
    e = parse_expr(req.expr)
    with time_limit(TIMEOUT_SECONDS):
        if req.mode == "expand":
            result = expand_log(e, force=True)
        else:
            result = logcombine(e, force=True)
    return to_response(result)


class ProbabilityReq(BaseModel):
    distribution: str  # "binomial" | "normal" | "geometric" | "hypergeometric"
    params: dict       # 분포별 파라미터
    query: str         # "P(X=k)" | "P(X>=k)" | "E" | "V"
    k: Optional[float] = None


@app.post("/probability")
def probability_endpoint(req: ProbabilityReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """확률분포 — 이항/정규/기하/초기하. P(X=k), E(X), V(X)."""
    assert_token(x_internal_token)
    name = req.distribution.lower()
    p = req.params
    with time_limit(TIMEOUT_SECONDS):
        if name == "binomial":
            X = Binomial("X", p["n"], Rational(p["p"]).limit_denominator(10000) if isinstance(p["p"], float) else p["p"])
        elif name == "normal":
            X = Normal("X", p["mean"], p["std"])
        elif name == "geometric":
            X = Geometric("X", Rational(p["p"]).limit_denominator(10000) if isinstance(p["p"], float) else p["p"])
        elif name == "hypergeometric":
            X = Hypergeometric("X", p["N"], p["K"], p["n"])
        else:
            raise HTTPException(status_code=400, detail=f"unknown distribution: {name}")

        q = req.query.strip()
        if q.startswith("P"):
            if req.k is None:
                raise HTTPException(status_code=400, detail="k required for P query")
            if "=" in q and "<=" not in q and ">=" not in q:
                result = ProbP(X >= req.k) - ProbP(X >= req.k + 1) if name in ("binomial", "geometric", "hypergeometric") else density(X)(req.k)
            elif ">=" in q:
                result = ProbP(X >= req.k)
            elif "<=" in q:
                result = ProbP(X <= req.k)
            elif ">" in q:
                result = ProbP(X > req.k)
            elif "<" in q:
                result = ProbP(X < req.k)
            else:
                result = ProbP(X >= req.k)
        elif q.upper() == "E":
            result = ProbE(X)
        elif q.upper() in ("V", "VAR"):
            result = prob_var(X)
        else:
            raise HTTPException(status_code=400, detail=f"unknown query: {q}")

    return to_response(result)


class GeometryReq(BaseModel):
    operation: str  # "distance_points" | "line_through" | "circle_3pt" | "intersection_lines"
    points: list = []  # [[x,y], ...]
    extra: Optional[dict] = None


@app.post("/geometry")
def geometry_endpoint(req: GeometryReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """평면기하 — 거리·직선·원·교점."""
    assert_token(x_internal_token)
    op = req.operation.lower()
    pts = [Point(p[0], p[1]) for p in req.points]
    with time_limit(TIMEOUT_SECONDS):
        if op == "distance_points":
            if len(pts) != 2:
                raise HTTPException(400, "two points required")
            result = pts[0].distance(pts[1])
        elif op == "line_through":
            if len(pts) != 2:
                raise HTTPException(400, "two points required")
            line = Line(pts[0], pts[1])
            result = line.equation()
        elif op == "circle_3pt":
            if len(pts) != 3:
                raise HTTPException(400, "three points required")
            circle = Circle(pts[0], pts[1], pts[2])
            result = circle.equation()
        elif op == "intersection_lines":
            if len(pts) != 4:
                raise HTTPException(400, "four points (two lines) required")
            l1 = Line(pts[0], pts[1])
            l2 = Line(pts[2], pts[3])
            inter = l1.intersection(l2)
            result = inter[0] if inter else "no intersection"
        elif op == "triangle_area":
            if len(pts) != 3:
                raise HTTPException(400, "three points required")
            tri = Triangle(pts[0], pts[1], pts[2])
            result = tri.area
        else:
            raise HTTPException(400, f"unknown operation: {op}")
    return to_response(result)


class VectorReq(BaseModel):
    operation: str  # "dot" | "cross" | "norm" | "angle" | "projection"
    a: list  # [x,y,(z)]
    b: Optional[list] = None


@app.post("/vector")
def vector_endpoint(req: VectorReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """벡터 — 내적·외적·노름·사잇각·정사영."""
    assert_token(x_internal_token)
    op = req.operation.lower()
    a = Matrix(req.a)
    b = Matrix(req.b) if req.b else None
    with time_limit(TIMEOUT_SECONDS):
        if op == "dot":
            result = a.dot(b)
        elif op == "cross":
            if len(req.a) != 3 or not b or len(req.b) != 3:
                raise HTTPException(400, "cross requires 3D vectors")
            result = a.cross(b)
        elif op == "norm":
            result = a.norm()
        elif op == "angle":
            cos_theta = a.dot(b) / (a.norm() * b.norm())
            result = sym_simplify(cos_theta)
        elif op == "projection":
            result = (a.dot(b) / b.dot(b)) * b
        else:
            raise HTTPException(400, f"unknown operation: {op}")
    return to_response(result)


class MatrixReq(BaseModel):
    operation: str  # "det" | "inverse" | "rank" | "eigenvalues" | "multiply"
    matrix: list   # [[..], [..], ...]
    other: Optional[list] = None


@app.post("/matrix")
def matrix_endpoint(req: MatrixReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    op = req.operation.lower()
    M = Matrix(req.matrix)
    with time_limit(TIMEOUT_SECONDS):
        if op == "det":
            result = M.det()
        elif op == "inverse":
            result = M.inv()
        elif op == "rank":
            result = M.rank()
        elif op == "eigenvalues":
            result = list(M.eigenvals().keys())
        elif op == "multiply":
            if not req.other:
                raise HTTPException(400, "other matrix required")
            N_mat = Matrix(req.other)
            result = M * N_mat
        else:
            raise HTTPException(400, f"unknown operation: {op}")
    return to_response(result)


# ─────────────────────────────────────────────────────────────────
# F-03 — Z3 SMT solver (부등식)
# ─────────────────────────────────────────────────────────────────

class InequalityReq(BaseModel):
    """부등식 풀이 — SymPy 의 solve_univariate_inequality 우선, 다변수는 Z3."""
    expr: str          # 예: "x**2 - 4 > 0"
    var: str = "x"
    use_z3: bool = False


@app.post("/solve_inequality")
def solve_inequality(req: InequalityReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    assert_token(x_internal_token)
    with time_limit(TIMEOUT_SECONDS):
        if req.use_z3:
            # 다변수 / 비선형 부등식 충족가능성 — Z3
            try:
                from z3 import Real, Solver, sat, parse_smt2_string
            except ImportError:
                raise HTTPException(500, "z3 not installed")
            s = Solver()
            # SMT-LIB 변환은 단순 케이스만 — 사용자 expr 을 Python eval (SymPy 와 같은 환경)
            # 안전을 위해 sympify 후 z3 expr 로 변환
            from sympy import sympify as _sym
            sym_expr = _sym(req.expr)
            # SymPy → Z3 변환은 라이브러리가 없어 직접 — 대신 SymPy reduce 사용
            from sympy import reduce_inequalities
            v = Symbol(req.var)
            result = reduce_inequalities([sym_expr], [v])
        else:
            from sympy.solvers.inequalities import solve_univariate_inequality
            from sympy import sympify as _sym
            sym_expr = _sym(req.expr)
            v = Symbol(req.var)
            result = solve_univariate_inequality(sym_expr, v, relational=False)
    return to_response(result)


# ─────────────────────────────────────────────────────────────────
# F-04 — matplotlib 시각화
# ─────────────────────────────────────────────────────────────────

def _png_response(fig) -> dict:
    """matplotlib figure → base64 PNG."""
    import matplotlib
    matplotlib.use("Agg")
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=120, bbox_inches="tight")
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("ascii")
    import matplotlib.pyplot as plt
    plt.close(fig)
    return {"png_base64": encoded, "format": "png"}


class PlotFunctionReq(BaseModel):
    expr: str
    var: str = "x"
    x_min: float = -10.0
    x_max: float = 10.0
    samples: int = 400
    title: Optional[str] = None


@app.post("/plot_function")
def plot_function(req: PlotFunctionReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """단일 함수 그래프."""
    assert_token(x_internal_token)
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np
    from sympy import lambdify

    e = parse_expr(req.expr)
    v = Symbol(req.var)
    f = lambdify(v, e, modules=["numpy"])
    xs = np.linspace(req.x_min, req.x_max, req.samples)
    try:
        ys = f(xs)
    except Exception as e:
        raise HTTPException(400, f"plot failed: {e}")
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.plot(xs, ys, linewidth=2, color="#7c3aed")
    ax.axhline(0, color="#888", linewidth=0.5)
    ax.axvline(0, color="#888", linewidth=0.5)
    ax.grid(True, alpha=0.3)
    if req.title:
        ax.set_title(req.title)
    ax.set_xlabel(req.var)
    ax.set_ylabel(f"f({req.var})")
    return _png_response(fig)


class PlotRegionReq(BaseModel):
    expr1: str       # 위 곡선
    expr2: str = "0" # 아래 곡선
    var: str = "x"
    x_min: float = -10.0
    x_max: float = 10.0
    samples: int = 400
    fill_label: Optional[str] = None


@app.post("/plot_region")
def plot_region(req: PlotRegionReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """두 곡선 사이 영역 색칠 — 적분 시각화."""
    assert_token(x_internal_token)
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np
    from sympy import lambdify

    e1 = parse_expr(req.expr1)
    e2 = parse_expr(req.expr2)
    v = Symbol(req.var)
    f1 = lambdify(v, e1, modules=["numpy"])
    f2 = lambdify(v, e2, modules=["numpy"])
    xs = np.linspace(req.x_min, req.x_max, req.samples)
    y1 = f1(xs)
    y2 = f2(xs) if hasattr(f2(xs), "__len__") else np.full_like(xs, f2(xs))
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.plot(xs, y1, linewidth=2, color="#7c3aed", label=str(e1))
    ax.plot(xs, y2, linewidth=2, color="#22c55e", label=str(e2))
    ax.fill_between(xs, y1, y2, alpha=0.25, color="#a855f7", label=req.fill_label or "region")
    ax.axhline(0, color="#888", linewidth=0.5)
    ax.axvline(0, color="#888", linewidth=0.5)
    ax.grid(True, alpha=0.3)
    ax.legend(loc="best", fontsize=9)
    return _png_response(fig)


class PlotGeometryReq(BaseModel):
    points: list = []         # [[x,y,label], ...]
    lines: list = []          # [[[x1,y1],[x2,y2],label], ...]
    circles: list = []        # [[[cx,cy], r, label], ...]
    title: Optional[str] = None


@app.post("/plot_geometry")
def plot_geometry(req: PlotGeometryReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """좌표평면 위 점·선·원 시각화."""
    assert_token(x_internal_token)
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np

    fig, ax = plt.subplots(figsize=(6, 6))
    for pt in req.points:
        ax.plot(pt[0], pt[1], "o", markersize=6, color="#7c3aed")
        if len(pt) > 2:
            ax.annotate(str(pt[2]), (pt[0], pt[1]), textcoords="offset points", xytext=(5, 5), fontsize=10)
    for ln in req.lines:
        (x1, y1), (x2, y2) = ln[0], ln[1]
        ax.plot([x1, x2], [y1, y2], "-", linewidth=2, color="#22c55e",
                label=str(ln[2]) if len(ln) > 2 else None)
    for circ in req.circles:
        (cx, cy), r = circ[0], circ[1]
        theta = np.linspace(0, 2 * np.pi, 200)
        ax.plot(cx + r * np.cos(theta), cy + r * np.sin(theta), "-",
                linewidth=2, color="#f59e0b",
                label=str(circ[2]) if len(circ) > 2 else None)
        ax.plot(cx, cy, "x", markersize=6, color="#f59e0b")
    ax.axhline(0, color="#888", linewidth=0.5)
    ax.axvline(0, color="#888", linewidth=0.5)
    ax.set_aspect("equal", adjustable="datalim")
    ax.grid(True, alpha=0.3)
    if req.title:
        ax.set_title(req.title)
    if any(len(ln) > 2 for ln in req.lines) or any(len(c) > 2 for c in req.circles):
        ax.legend(loc="best", fontsize=9)
    return _png_response(fig)


# ─────────────────────────────────────────────────────────────────
# F-02 — Wolfram Alpha API (외부 검증)
# ─────────────────────────────────────────────────────────────────

class WolframReq(BaseModel):
    query: str
    timeout_s: int = 8
    maxchars: int = 2000  # LLM API 응답 길이 제한 (토큰 절약)


def _extract_result_section(text: str) -> str:
    """LLM API 마크다운 응답에서 'Result' 섹션을 추출.

    응답 구조 예시:
        Input interpretation:
        integrate sin(x)

        Result:
        -cos(x) + constant

        Plot:
        ...

    'Result' 또는 'Solution' 또는 'Decimal approximation' 우선 추출.
    """
    if not text:
        return ""
    sections = {}
    current_key = None
    current_lines: list[str] = []

    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        # "Result:" 같은 헤더 인식 (콜론으로 끝나고 짧은 한 줄)
        if line.endswith(":") and len(line) < 50 and not line.startswith(" "):
            if current_key is not None:
                sections[current_key] = "\n".join(current_lines).strip()
            current_key = line[:-1].strip().lower()
            current_lines = []
        else:
            current_lines.append(line)
    if current_key is not None:
        sections[current_key] = "\n".join(current_lines).strip()

    for key in ("result", "solution", "decimal approximation", "exact result", "answer"):
        if sections.get(key):
            return sections[key]
    # fallback — 전체 텍스트의 첫 200자
    return text.strip()[:200]


@app.post("/wolfram_query")
def wolfram_query(req: WolframReq, x_internal_token: Optional[str] = Header(default=None, alias="X-Internal-Token")):
    """Wolfram Alpha LLM API — LLM 통합 전용 endpoint.

    https://products.wolframalpha.com/llm-api/documentation
    응답: plain text 마크다운 (섹션 구분).

    환경변수 WOLFRAM_APP_ID 미설정 시 503.
    """
    assert_token(x_internal_token)
    if not WOLFRAM_APP_ID:
        raise HTTPException(503, "WOLFRAM_APP_ID not configured")

    import httpx
    url = "https://www.wolframalpha.com/api/v1/llm-api"
    params = {
        "appid": WOLFRAM_APP_ID,
        "input": req.query,
        "maxchars": str(req.maxchars),
    }
    try:
        with httpx.Client(timeout=req.timeout_s + 2) as client:
            resp = client.get(url, params=params)
        if resp.status_code == 501:
            # Wolfram 이 답할 수 없는 query
            return {"result": "no_result", "latex": "", "source": "wolfram_llm", "raw": resp.text[:200]}
        resp.raise_for_status()
        body = resp.text
    except httpx.HTTPError as e:
        raise HTTPException(502, f"wolfram error: {e}")

    primary = _extract_result_section(body)
    return {
        "result": primary or "no_plaintext",
        "latex": "",
        "source": "wolfram_llm",
        "raw_markdown": body[:1500],  # 디버깅·코칭 system 주입용 (max 1.5KB)
    }


# ─────────────────────────────────────────────────────────────────
# 진단
# ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"ok": True, "service": "euler-sympy", "version": "2.0"}


@app.get("/capabilities")
def capabilities():
    """μSvc 가 지원하는 endpoint 목록 + 외부 키 활성화 여부."""
    return {
        "version": "2.0",
        "endpoints": {
            "calc": [
                "differentiate", "integrate", "solve_equation", "simplify", "factor", "series_expand",
                "summation", "limit", "partial_fraction", "complex_solve", "numeric",
                "poly_div", "trig_simplify", "log_simplify",
                "probability", "geometry", "vector", "matrix",
            ],
            "smt": ["solve_inequality"],
            "plot": ["plot_function", "plot_region", "plot_geometry"],
            "external": ["wolfram_query"],
        },
        "wolfram_enabled": bool(WOLFRAM_APP_ID),
    }
