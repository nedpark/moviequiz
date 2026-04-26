[Role]

너는 숙련된 Frontend 개발자이자 Game Designer야. 제공된 JSON 데이터를 활용해 몰입감 있는 영화 퀴즈 웹앱을 Pure Vanilla JS(HTML5, CSS3, ES6+)로 제작했어.

[Data Context]

데이터 파일명: quizdata_example.json

데이터 구조: stages 배열 내에 4개의 레벨이 있고, 각 레벨(questions)마다 20개의 객관식 문제가 포함됨.

[Game Logic & Rules]

스테이지 진행 조건:

각 스테이지마다 20개 문제 중에서 5개를 무작위로 선택하여 제시해.

5개 문제 중에서 3개를 맞추면 다음 스테이지로 넘어갈 수 있어.

5개 문제 중에서 3개를 못 맞추면 해당 스테이지에서 탈락(Game Over)이야.

정답 누적 카운트와 오답 누적 카운트는 독립적으로 진행되고, 먼저 3개를 달성하는 쪽이 결과가 돼.

제한 시간 (타이머):
- 각 문제마다 10초의 제한 시간이 주어져야 해.
- 화면 상단 스테이터스 바 바로 아래에 줄어드는 붉은색 바그래프 형태로 남은 시간을 표시해줘.
- 10초 이내에 답을 선택하지 않으면 오답으로 처리하고 다음 단계(오답 카운트 증가 및 정답 공개)로 넘어가야 해.

화면 전환 및 미디어 연출 (Full Screen 모드):

최초 시작: StageStart.png 배경 + [시작하기] 버튼.

스테이지 진입: 시작 버튼 클릭 시 Stage01In.mp4를 화면 가득 재생 후 스테이지 1 퀴즈 화면으로 전환.

스테이지 중단/탈락: 스테이지 1에서 최종 탈락 시 Stage01Out.mp4 재생 후 [재도전] 버튼 표시. 클릭 시 최초 시작 화면으로 이동.

스테이지 클리어:

스테이지 1 통과 시 -> Stage02In.mp4 재생 -> 스테이지 2 진입.

스테이지 2 통과 시 -> Stage03In.mp4 재생 -> 스테이지 3 진입.

스테이지 3 통과 시 -> Stage04In.mp4 재생 -> 스테이지 4 진입.

최종 승리: 스테이지 4 통과 시 StageFinalIn.mp4 재생 후 StageFinal.png 배경 표시. [재시작] 버튼 클릭 시 최초 시작 화면으로 이동.

[UI/UX Requirements]

배경: 모든 이미지(png)와 영상(mp4)은 object-cover를 사용하여 화면에 꽉 차게 표시해줘.

영상 제어: 모든 .mp4 영상은 재생이 끝나면 자동으로 다음 상태(퀴즈 화면 또는 결과 화면)로 넘어가야 해.

배경음악: 각 스테이지와 결과 화면에서 적절한 .mp3 배경음악이 루프 재생되어야 해.
- 스테이지 1-4: Stage01.mp3 ~ Stage04.mp3
- 탈락 화면: StrageEnd.mp3
- 최종통과 화면: StrageFinal.mp3
- 비디오 재생 중: 배경음악 중지

스테이터스 바: 
- 상단 좌측: 현재 스테이지(Stage 1/4)
- 상단 중앙: 3개의 원 → 정답 시 녹색으로 하나씩 채워짐 → 3개 다 채워지면 스테이지 클리어
- 상단 우측: 3개의 원 → 오답 시 빨간색으로 하나씩 채워짐 → 3개 다 채워지면 탈락
- 진행 정보: 현재 제시된 문제 번호 (문제 X/5)

힌트 기능:
- 퀴즈 화면 하단에 [힌트보기] 버튼을 추가해줘.
- 버튼을 누르면 JSON 데이터의 hint 정보가 화면에 나타나야 해.
- 힌트가 나타나면 [힌트보기] 버튼은 숨겨줘.

애니메이션: 정답을 맞췄을 때와 틀렸을 때 시각적 피드백(초록색/붉은색 하이라이트)을 줘.

[Technical Instructions]

자산(Assets) 경로는 ./assets/ 폴더를 기준으로 작성해줘. (예: ./assets/Stage01.png)

상태 관리는 useState와 useEffect를 효율적으로 사용하여 영상 재생 종료 시점을 감지해줘 (onEnded 이벤트 활용).

퀴즈 문제는 매 세트마다 섞이도록(Shuffle) 구현해줘.

[Technical Constraints: Pure Vanilla JS]

No Frameworks/Libraries: React, Vue, jQuery, Tailwind CSS 등 어떠한 외부 프레임워크나 라이브러리도 사용하지 마. 오직 HTML5, CSS3, ES6+ JavaScript만 사용해.

Single File or Clean Module: index.html, style.css, script.js 세 개의 파일로 분리하거나, 관리를 위해 하나의 HTML 파일 안에 모든 로직을 작성해줘.

Asset Management:

quizdata_example.json 파일은 fetch() API를 사용해 비동기적으로 로드해.

영상과 이미지 경로는 ./assets/ 폴더를 기준으로 작성해.

State Management: 전역 변수나 클로저를 활용해 현재 스테이지, 남은 문제 풀, 연속 정답 횟수를 관리하는 간단한 상태 관리 시스템을 직접 구현해.

[Implementation Details]

DOM Manipulation: document.querySelector와 addEventListener를 사용하여 모든 이벤트를 처리해.

Video Control: 비디오 재생이 끝나는 시점은 video.onended 이벤트 핸들러를 사용하여 다음 로직(퀴즈 시작 또는 스테이지 전환)으로 자연스럽게 넘어가도록 해.

CSS Layout:

Flexbox나 Grid를 사용하여 화면 중앙 정렬과 Full Screen 레이아웃을 잡아줘.

모든 미디어(PNG, MP4)는 position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: cover;를 적용해 화면에 꽉 차게 연출해.

퀴즈 UI(문제, 보기 버튼 등)는 영상이나 이미지 위에 떠 있는 z-index 계층으로 설계해.

Shuffle Logic: 
- 스테이지 시작 시 20개의 문제 배열을 무작위로 섞기 (sort(() => Math.random() - 0.5))
- 각 문제의 객관식 보기도 무작위로 셔플하기

---

[Implementation Status - ✅ COMPLETED]

## 프로젝트 구조

```
movie_quiz/
├── index.html                 # 메인 HTML 파일
├── style.css                  # 스타일시트 (Flexbox/Grid 레이아웃)
├── script.js                  # 게임 로직 (ES6+ Vanilla JS)
├── quizdata_example.json      # 퀴즈 데이터 (4 stages × 20 questions)
├── assets/                    # 미디어 폴더
│   ├── StageStart.png         # 시작 화면 배경
│   ├── StageEnd.png           # 탈락 화면 배경
│   ├── StageFinal.png         # 최종 클리어 화면
│   ├── Stage01.png~04.png     # 각 스테이지 배경
│   ├── Stage01In.mp4~04In.mp4 # 스테이지 진입 영상
│   ├── StageFinalIn.mp4       # 최종 진입 영상
│   └── Stage01Out.mp4~04Out.mp4 # 스테이지 탈락 영상
├── README.md                  # 설치 및 사용 가이드
└── prompt.md                  # 이 파일 (프로젝트 요구사항)
```

## 구현된 기능

### ✅ 게임 로직
- [x] 20개 문제 중 5개를 무작위로 선택 (Shuffle)
- [x] 매 문제마다 객관식 보기의 순서를 무작위로 셔플 (Shuffle Options)
- [x] 3개 정답 달성 시 스테이지 클리어
- [x] 3개 오답 달성 시 스테이지 탈락
- [x] 정답/오답 누적 카운트 독립 관리

### ✅ 배경음악 관리 (MusicManager 객체)
```javascript
MusicManager = {
    currentMusic,           // 현재 재생 중인 음악
    playMusic(stageNum, type), // 음악 재생 (type: 'quiz', 'gameOver', 'final')
    stopMusic()            // 음악 중지
}
```
- [x] 각 스테이지별 배경음악 자동 재생 (Stage01.mp3 ~ Stage04.mp3)
- [x] 탈락 화면 배경음악 (StrageEnd.mp3)
- [x] 최종통과 화면 배경음악 (StrageFinal.mp3)
- [x] 배경음악 루프 재생 (loop = true)
- [x] 비디오 재생 시 배경음악 자동 중지
- [x] 음악 볼륨 50% 설정

### ✅ 상태 관리 (GameState 객체)
```javascript
GameState = {
    currentStage,           // 현재 스테이지 (0-4)
    remainingQuestions,     // 남은 문제 인덱스 배열
    currentQuestionSet,     // 현재 문제 세트 (무작위 선택)
    correctCount,           // 연속 정답 수 (0-5)
    mistakesCount,          // 현재 스테이지 실수 횟수 (0-3)
    usedQuestionIndices,    // 사용한 문제 ID 배열
    correctAnswers,         // 맞춘 총 문제 수
    wrongAnswers            // 틀린 총 문제 수
}
```

### ✅ UI/UX
- [x] 풀스크린 레이아웃 (object-cover)
- [x] 상단 스테이터스 바: "Stage X/4 | ✅ X | ❌ X | 남은 기회 X/20"
- [x] 정답/오답 애니메이션 (초록색/빨강색 하이라이트)
- [x] 버튼 호버 효과 및 트랜지션

### ✅ 비디오 제어
- [x] 비디오 자동 재생 (video.onended 이벤트)
- [x] 스테이지 진입 영상 → 퀴즈 화면 자동 전환
- [x] 탈락 영상 → 재도전 화면 자동 전환
- [x] 최종 영상 → 클리어 화면 자동 전환

### ✅ 데이터 로딩
- [x] fetch() API로 quizdata_example.json 비동기 로드
- [x] 에러 처리 및 사용자 피드백

### ✅ DOM 조작
- [x] document.querySelector/querySelectorAll
- [x] addEventListener로 모든 이벤트 처리
- [x] innerHTML로 동적 렌더링

## 주요 함수

| 함수 | 설명 |
|------|------|
| `initGame()` | 데이터 로드 및 게임 초기화 |
| `renderStartScreen()` | 시작 화면 렌더링 (배경음악 중지) |
| `renderQuizScreen(stageNum)` | 퀴즈 화면 렌더링 + 진행 정보 표시 + 배경음악 재생 |
| `checkAnswer(stageNum, selectedAnswer, buttonElement)` | 정답 검증 및 게임 로직 처리 (누적 카운팅) |
| `playVideoAndTransition(stageNum, type)` | 비디오 재생 및 화면 전환 + 배경음악 시작 |
| `renderGameOverScreen()` | 탈락 화면 렌더링 + 탈락 배경음악 재생 |
| `renderFinalScreen()` | 최종 클리어 화면 렌더링 + 최종통과 배경음악 재생 |
| `GameState.startStage(stageNum)` | 스테이지 시작: 5개 문제 무작위 선택 |
| `GameState.getCurrentQuestion()` | 현재 제시 중인 문제 인덱스 반환 |
| `GameState.moveToNextQuestion()` | 다음 문제로 이동 |
| `MusicManager.playMusic()` | 배경음악 재생 (stageNum, type 기반) |
| `MusicManager.stopMusic()` | 현재 재생 중인 배경음악 중지 |

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox/Grid 레이아웃, 애니메이션 (keyframes)
- **ES6+ JavaScript**: 클래스 없는 순수 객체 기반 상태 관리
- **Fetch API**: 비동기 JSON 데이터 로딩
- **Zero Dependencies**: 외부 라이브러리 없음

## 실행 방법

```bash
# 로컬 서버 실행
python -m http.server 8000

# 또는 Node.js
npx http-server

# 브라우저 접속
http://localhost:8000
```

## 추가된 개선사항

- ✅ 게임 규칙 변경: 5개 문제 중 3개 정답 또는 3개 오답 중 먼저 달성
- ✅ 스테이터스 바에 3개 정답 원(녹색) + 3개 오답 원(빨간색) 표시
- ✅ 진행 정보 표시 (문제 X/5)
- ✅ 각 스테이지별 배경음악 자동 재생 (Stage01.mp3 ~ Stage04.mp3)
- ✅ 탈락 화면 배경음악 (StrageEnd.mp3)
- ✅ 최종통과 화면 배경음악 (StrageFinal.mp3)
- ✅ 배경음악 루프 및 음량 관리 (MusicManager)
- ✅ 모든 기술 요구사항 충족
- ✅ 반응형 디자인 (모바일/태블릿)