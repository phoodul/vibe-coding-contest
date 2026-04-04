---
name: flutter-testing
description: Flutter 테스트 작성 전문가. Unit test, Widget test, Integration test를 작성하고 테스트 커버리지를 관리한다. Riverpod/BLoC 상태관리 테스트, 모킹 패턴, Golden test를 포함한다. "테스트 작성", "테스트 코드", "단위 테스트", "위젯 테스트", "통합 테스트", "TDD", "테스트 실패", "커버리지" 등의 요청에서 반드시 이 skill을 사용한다.
---

# Flutter Testing Expert

Flutter 앱의 안정성과 품질을 보장하는 체계적인 테스트 전략을 제공한다.

## 테스트 피라미드

```
        /  Integration  \        ← 적게, 핵심 흐름만
       /   Widget Tests   \      ← 중간, UI 상호작용
      /    Unit Tests       \    ← 많이, 비즈니스 로직
```

## 테스트 파일 구조

```
test/
├── unit/
│   ├── models/
│   ├── repositories/
│   └── providers/          # 또는 blocs/
├── widget/
│   ├── screens/
│   └── components/
├── integration/
│   └── flows/
├── helpers/
│   ├── test_helpers.dart   # 공용 헬퍼
│   └── mocks.dart          # Mock 클래스 모음
└── fixtures/
    └── json/               # 테스트용 JSON 데이터
```

## Unit Test

비즈니스 로직, 모델, 유틸리티 함수를 테스트한다.

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('UserModel', () {
    test('fromJson으로 올바르게 파싱된다', () {
      final json = {'id': 1, 'name': '홍길동', 'email': 'hong@test.com'};
      final user = UserModel.fromJson(json);

      expect(user.id, 1);
      expect(user.name, '홍길동');
      expect(user.email, 'hong@test.com');
    });

    test('이메일이 null이면 빈 문자열을 반환한다', () {
      final json = {'id': 1, 'name': '홍길동'};
      final user = UserModel.fromJson(json);

      expect(user.email, isEmpty);
    });
  });
}
```

## Widget Test

위젯의 렌더링과 사용자 상호작용을 테스트한다.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('로그인 버튼 탭 시 로딩 표시', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: LoginScreen()),
    );

    // 버튼 찾기
    final loginButton = find.byType(ElevatedButton);
    expect(loginButton, findsOneWidget);

    // 탭
    await tester.tap(loginButton);
    await tester.pump();

    // 로딩 인디케이터 확인
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
```

## Mocking (mocktail 사용)

```dart
import 'package:mocktail/mocktail.dart';

class MockUserRepository extends Mock implements UserRepository {}

void main() {
  late MockUserRepository mockRepo;

  setUp(() {
    mockRepo = MockUserRepository();
  });

  test('사용자 목록을 가져온다', () async {
    // Arrange
    when(() => mockRepo.getUsers()).thenAnswer(
      (_) async => [UserModel(id: 1, name: '테스트')],
    );

    // Act
    final result = await mockRepo.getUsers();

    // Assert
    expect(result, hasLength(1));
    verify(() => mockRepo.getUsers()).called(1);
  });
}
```

## Riverpod 테스트

```dart
void main() {
  test('counterProvider 증가 테스트', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    expect(container.read(counterProvider), 0);

    container.read(counterProvider.notifier).increment();
    expect(container.read(counterProvider), 1);
  });
}
```

## 테스트 실행 명령어

```bash
# 전체 테스트
flutter test

# 특정 파일
flutter test test/unit/models/user_model_test.dart

# 커버리지 포함
flutter test --coverage

# 커버리지 리포트 (HTML)
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

## 테스트 네이밍 규칙

- 파일: `{대상}_test.dart`
- group: 테스트 대상 클래스/기능명
- test: 한국어로 **"~하면 ~한다"** 형식
  - 예: `'이메일이 비어있으면 에러를 반환한다'`
  - 예: `'로그인 성공 시 홈 화면으로 이동한다'`

## AAA 패턴

모든 테스트는 Arrange → Act → Assert 순서를 따른다:

```dart
test('설명', () {
  // Arrange: 테스트 데이터와 의존성 준비
  // Act: 테스트 대상 실행
  // Assert: 결과 검증
});
```
