const MAP: Array<[RegExp, string]> = [
  [/^\/tutor\b/, "tutor"],
  [/^\/euler-tutor\b/, "euler-tutor"],
  [/^\/mind-map\b/, "mind-map"],
  [/^\/palace\b/, "palace"],
  [/^\/books\b/, "books"],
  [/^\/career\b/, "career"],
  [/^\/pathfinder\b/, "pathfinder"],
  [/^\/vocabulary\b/, "vocabulary"],
  [/^\/grammar-listen\b/, "grammar-listen"],
  [/^\/conversation\b/, "conversation"],
  [/^\/paps\b/, "paps"],
  [/^\/internship\b/, "internship"],
  [/^\/music-review\b/, "music-review"],
  [/^\/crisis\b/, "crisis"],
  [/^\/teacher\/lesson-prep\b/, "teacher:lesson-prep"],
  [/^\/teacher\/documents\b/, "teacher:documents"],
  [/^\/teacher\/feedback\b/, "teacher:feedback"],
  [/^\/teacher\/records\b/, "teacher:records"],
  [/^\/teacher\b/, "teacher:home"],
  [/^\/dashboard\b/, "dashboard"],
  [/^\/admin\b/, "admin"],
  [/^\/(login|signup|auth)\b/, "auth"],
  [/^\/$/, "landing"],
];

export function pathToFeature(pathname: string): string {
  for (const [re, feature] of MAP) {
    if (re.test(pathname)) return feature;
  }
  return "other";
}
