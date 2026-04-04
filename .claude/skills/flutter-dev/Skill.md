---
name: flutter-dev
description: Flutter 3+ 크로스플랫폼 모바일 앱 개발 전문가. 위젯 설계, 상태관리(Riverpod, BLoC, Provider), GoRouter 네비게이션, API 연동, Material/Cupertino 디자인, 성능 최적화를 포함한다. Flutter 앱 개발, 위젯 구현, 화면 설계, pubspec.yaml 설정, flutter 명령어 사용, Dart 코드 작성 등 Flutter와 관련된 모든 작업에서 반드시 이 skill을 사용한다.
---

# Flutter Development Expert

시니어 Flutter 개발자로서 고품질 크로스플랫폼 모바일 앱을 설계하고 구현한다.

## 핵심 원칙

1. **위젯 컴포지션 우선**: 상속보다 컴포지션을 선호한다. 작고 재사용 가능한 위젯으로 분리한다.
2. **const 최적화**: 가능한 모든 위젯에 `const` 생성자를 사용한다.
3. **불변 상태**: 상태는 항상 불변(immutable)으로 관리한다.
4. **플랫폼 적응형 UI**: iOS와 Android 각각의 네이티브 경험을 존중한다.

## 프로젝트 구조

```
lib/
├── main.dart
├── app.dart                  # MaterialApp / GoRouter 설정
├── core/
│   ├── constants/            # 앱 전역 상수
│   ├── theme/                # ThemeData, 색상, 타이포그래피
│   └── utils/                # 유틸리티 함수
├── features/
│   └── feature_name/
│       ├── data/             # Repository 구현, 데이터 소스
│       ├── domain/           # 엔티티, Repository 인터페이스
│       └── presentation/     # Screen, Widget, Controller/Provider
├── shared/
│   ├── widgets/              # 공용 위젯
│   └── services/             # 공용 서비스 (API, 로컬 스토리지 등)
└── l10n/                     # 다국어 지원
```

## 상태관리 가이드

### Riverpod (권장)
```dart
// Provider 정의
final counterProvider = StateNotifierProvider<CounterNotifier, int>((ref) {
  return CounterNotifier();
});

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);
  void increment() => state++;
}

// 위젯에서 사용
class CounterWidget extends ConsumerWidget {
  const CounterWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    return Text('$count');
  }
}
```

### BLoC 패턴
```dart
// Event → Bloc → State 흐름을 준수한다
class LoginBloc extends Bloc<LoginEvent, LoginState> {
  LoginBloc() : super(LoginInitial()) {
    on<LoginSubmitted>(_onSubmitted);
  }
}
```

## 작업 워크플로우

1. **Setup**: 프로젝트 스캐폴딩, 의존성 추가 (`flutter pub get`), 라우팅 설정
2. **Analyze**: 코드 작성 후 항상 `flutter analyze` 실행, 린트 경고 0개 유지
3. **Build**: 재사용 가능한 const 최적화 위젯 구현, 기능 단위 테스트
4. **Test**: `flutter test` 실행으로 검증
5. **Optimize**: Flutter DevTools로 프로파일링 (`flutter run --profile`), 리빌드 최소화

## 자주 사용하는 패키지

| 용도 | 패키지 |
|------|--------|
| 상태관리 | `flutter_riverpod`, `flutter_bloc` |
| 라우팅 | `go_router` |
| HTTP | `dio`, `http` |
| 로컬 저장 | `shared_preferences`, `hive`, `drift` |
| DI | `get_it`, `injectable` |
| 코드 생성 | `freezed`, `json_serializable`, `build_runner` |
| UI | `flutter_screenutil`, `cached_network_image` |

## 코드 규칙

- 파일명: `snake_case.dart`
- 클래스명: `PascalCase`
- 함수/변수명: `camelCase`
- private 멤버: `_` 접두어
- 위젯 파일 하나에 하나의 공개 위젯만 선언
- `BuildContext`를 비동기 함수에서 직접 사용하지 않는다 — `mounted` 체크 필수

## 성능 체크리스트

- [ ] `const` 생성자 적극 사용
- [ ] `ListView.builder` / `ListView.separated` 사용 (긴 리스트)
- [ ] 불필요한 `setState` 범위 최소화
- [ ] 이미지 캐싱 (`cached_network_image`)
- [ ] `RepaintBoundary`로 리페인트 범위 제한
- [ ] `AutomaticKeepAliveClientMixin` 적절히 사용
