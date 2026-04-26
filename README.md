# 영화 퀴즈 웹앱

Pure Vanilla JavaScript로 만든 몰입감 있는 영화 퀴즈 게임입니다.

## 프로젝트 구조

```
movie_quiz/
├── index.html                 # 메인 HTML
├── style.css                  # 스타일시트
├── script.js                  # 게임 로직
├── quizdata_example.json      # 퀴즈 데이터
├── assets/                    # 이미지 및 영상 폴더
│   ├── StageStart.png         # 시작 화면 배경
│   ├── StageEnd.png           # 탈락 화면 배경
│   ├── StageFinal.png         # 최종 클리어 화면
│   ├── Stage01.png            # 스테이지 1 배경
│   ├── Stage02.png            # 스테이지 2 배경
│   ├── Stage03.png            # 스테이지 3 배경
│   ├── Stage04.png            # 스테이지 4 배경
│   ├── Stage01In.mp4          # 스테이지 1 진입 영상
│   ├── Stage02In.mp4          # 스테이지 2 진입 영상
│   ├── Stage03In.mp4          # 스테이지 3 진입 영상
│   ├── Stage04In.mp4          # 스테이지 4 진입 영상
│   ├── StageFinalIn.mp4       # 최종 진입 영상
│   ├── Stage01Out.mp4         # 스테이지 1 탈락 영상
│   ├── Stage02Out.mp4         # 스테이지 2 탈락 영상
│   ├── Stage03Out.mp4         # 스테이지 3 탈락 영상
│   └── Stage04Out.mp4         # 스테이지 4 탈락 영상
└── README.md                  # 이 파일
```

## 필수 assets 파일

### 이미지 파일 (.png)
- `StageStart.png` - 시작 화면 배경 (1920x1080 권장)
- `Stage01.png` ~ `Stage04.png` - 각 스테이지 배경
- `StageEnd.png` - 탈락 화면 배경
- `StageFinal.png` - 최종 클리어 화면 배경

### 영상 파일 (.mp4)
- `Stage01In.mp4` ~ `Stage04In.mp4` - 각 스테이지 진입 영상
- `StageFinalIn.mp4` - 최종 스테이지 진입 영상
- `Stage01Out.mp4` ~ `Stage04Out.mp4` - 각 스테이지 탈락 영상

### 음악 파일 (.mp3)
- `Stage01.mp3` ~ `Stage04.mp3` - 각 스테이지 배경음악 (루프 재생)
- `StrageEnd.mp3` - 탈락 화면 배경음악
- `StrageFinal.mp3` - 최종 클리어 화면 배경음악

모든 미디어 파일은 `./assets/` 폴더에 배치해야 합니다.

## 게임 규칙

### 스테이지 진행 조건
1. 각 스테이지마다 **20개 문제 중 5개를 무작위로 선택하여 제시**
2. **5개 문제 중 3개를 맞추면 다음 스테이지 진행** ✅
3. **5개 문제 중 3개를 못 맞추면 해당 스테이지에서 탈락** (Game Over)
4. **각 문제당 10초의 제한 시간**이 있으며, 시간 초과 시 오답 처리 ⏱️
5. 정답과 오답 누적 카운트는 독립적으로 진행
5. 최대 5개 문제를 제시받으면 게임 진행

### 화면 흐름
1. **시작 화면** → StageStart.png 배경
2. **[시작하기] 클릭** → Stage01In.mp4 재생
3. **스테이지 1 퀴즈** → 5연속 정답 필요
4. **스테이지 1 클리어** → Stage02In.mp4 재생
5. 같은 방식으로 스테이지 2, 3, 4 진행
6. **최종 클리어** → StageFinalIn.mp4 재생 → StageFinal.png 표시
7. **탈락** → Stage0XOut.mp4 재생 → [재도전] 버튼

## 기능

### UI/UX
- **전체 화면(fullscreen) 레이아웃** - 모든 미디어는 object-cover로 화면에 꽉 차게 표시
- **상단 스테이터스 바**:
  - 좌측: 현재 스테이지 (Stage X/4)
  - 중앙: 3개 원 표시 (정답 시 녹색 ● 으로 하나씩 채워짐 → 3개 완성 시 클리어)
  - 우측: 3개 원 표시 (오답 시 빨간색 ● 으로 하나씩 채워짐 → 3개 완성 시 탈락)
- **진행 상황 표시**: 현재 문제 번호 (문제 X/5)
- **정답/오답 피드백** - 정답은 초록색, 오답은 빨강색으로 하이라이트
- **자동 영상 재생 완료** - 비디오 재생이 끝나면 자동으로 다음 상태로 전환
- **배경음악** - 각 스테이지, 탈락, 최종통과 화면에서 적절한 배경음악 자동 재생 (루프)
- **제한 시간 타이머** - 각 문제당 10초의 제한 시간이 있으며, 상단에 시각적인 바그래프로 표시
- **힌트 기능** - 문제 풀이가 어려울 때 [힌트보기] 버튼을 통해 힌트를 확인 가능
- **보기 셔플링** - 각 문제의 객관식 보기를 무작위 순서로 표시
- **반응형 디자인** - 태블릿, 모바일에서도 재생 가능

### 기술 스택
- **HTML5** - 구조화된 마크업
- **CSS3** - Flexbox/Grid 레이아웃, 애니메이션
- **Vanilla JavaScript (ES6+)** - 프레임워크 없는 순수 JavaScript

## 실행 방법

### 1. 로컬 서버에서 실행 (권장)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server
```

브라우저에서 `http://localhost:8000` 접속

### 2. VS Code Live Server 확장 사용
- Live Server 확장 설치 후 `index.html`에서 우클릭 → "Open with Live Server"

## 상태 관리

게임 상태는 `GameState` 객체로 관리됩니다:

```javascript
GameState = {
    currentStage,           // 현재 스테이지 (0-4)
    remainingQuestions,     // 남은 문제 인덱스 배열
    currentQuestionSet,     // 현재 문제 세트
    correctCount,           // 연속 정답 수 (0-5)
    mistakesCount,          // 현재 스테이지 실수 횟수 (0-3)
    usedQuestionIndices,    // 사용한 문제 ID 배열
    correctAnswers,         // 맞춘 총 문제 수
    wrongAnswers            // 틀린 총 문제 수
}
```

## 주요 함수

- `initGame()` - 데이터 로드 및 게임 초기화
- `renderStartScreen()` - 시작 화면 렌더링
- `renderQuizScreen()` - 퀴즈 화면 렌더링
- `checkAnswer()` - 정답 검증 및 로직 처리
- `playVideoAndTransition()` - 비디오 재생 및 화면 전환
- `renderGameOverScreen()` - 탈락 화면 렌더링
- `renderFinalScreen()` - 최종 클리어 화면 렌더링

## 브라우저 호환성

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 라이선스

MIT
