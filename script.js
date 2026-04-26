// ====== 배경음악 관리 ======
const MusicManager = {
    currentMusic: null, // 현재 재생 중인 음악
    
    playMusic(stageNum, type) {
        // 기존 음악 중지
        this.stopMusic();
        
        let musicPath = '';
        
        if (type === 'quiz') {
            // 스테이지 1-4 배경음악
            musicPath = `./assets/Stage${String(stageNum).padStart(2, '0')}.mp3`;
        } else if (type === 'gameOver') {
            // 탈락 화면 배경음악
            musicPath = './assets/StrageEnd.mp3';
        } else if (type === 'final') {
            // 최종통과 화면 배경음악
            musicPath = './assets/StrageFinal.mp3';
        }
        
        if (musicPath) {
            this.currentMusic = new Audio(musicPath);
            this.currentMusic.loop = true;
            this.currentMusic.volume = 0.5; // 볼륨 50%
            this.currentMusic.play().catch(err => {
                console.warn('배경음악 재생 실패:', err);
            });
        }
    },
    
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }
};

// ====== 게임 상태 관리 ======
const GameState = {
    quizData: null,
    currentStage: 0, // 0 = 시작 화면, 1-4 = 각 스테이지
    remainingQuestions: [], // 남은 문제 인덱스 배열
    currentQuestionSet: [], // 현재 5개 문제
    correctCount: 0, // 연속 정답 수 (0-5)
    mistakesCount: 0, // 실수 횟수 (0-3)
    usedQuestionIndices: [], // 사용한 문제의 원본 인덱스
    correctAnswers: 0, // 맞춘 총 문제 수
    wrongAnswers: 0, // 틀린 총 문제 수
    
    reset() {
        this.currentStage = 0;
        this.remainingQuestions = [];
        this.currentQuestionSet = [];
        this.correctCount = 0;
        this.mistakesCount = 0;
        this.usedQuestionIndices = [];
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
    },
    
    startStage(stageNum) {
        this.currentStage = stageNum;
        this.correctCount = 0;
        this.mistakesCount = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.usedQuestionIndices = [];
        // 현재 스테이지의 모든 문제 인덱스 생성 (0-19)
        this.remainingQuestions = Array.from({ length: 20 }, (_, i) => i);
        this.drawQuestionSet();
    },
    
    drawQuestionSet() {
        // 남은 문제 중 5개를 무작위로 추출
        const shuffled = this.remainingQuestions.sort(() => Math.random() - 0.5);
        this.currentQuestionSet = shuffled.slice(0, 5);
        // 추출한 문제를 남은 문제 목록에서 제거
        this.remainingQuestions = this.remainingQuestions.filter(
            idx => !this.currentQuestionSet.includes(idx)
        );
    },
    
    addUsedQuestions() {
        const stageData = this.quizData.movie_quiz_app.stages[this.currentStage - 1];
        this.currentQuestionSet.forEach(idx => {
            const questionId = stageData.questions[idx].id;
            if (!this.usedQuestionIndices.includes(questionId)) {
                this.usedQuestionIndices.push(questionId);
            }
        });
    },
    
    getRemainingCount() {
        return this.remainingQuestions.length;
    },
    
    getTotalUsed() {
        return this.usedQuestionIndices.length;
    }
};

// ====== 렌더링 함수 ======
function renderStartScreen() {
    // 시작 화면에서 배경음악 중지
    MusicManager.stopMusic();
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <img src="./assets/StageStart.png" class="screen-background" alt="Stage Start">
        <div class="start-screen">
            <h1>🎬 영화 퀴즈</h1>
            <p>영화에 대한 당신의 지식을 테스트하세요!</p>
            <button class="btn" id="startBtn">시작하기</button>
        </div>
    `;
    
    document.getElementById('startBtn').addEventListener('click', () => {
        playVideoAndTransition(1, 'stageIntro');
    });
}

function renderQuizScreen(stageNum, questions) {
    const app = document.getElementById('app');
    const stageData = GameState.quizData.movie_quiz_app.stages[stageNum - 1];
    const currentQuestion = questions[0];
    const questionData = stageData.questions[currentQuestion];
    
    // 정답 원 (5개): 연속 정답 시 녹색으로 채워짐
    const correctCircles = Array.from({ length: 5 }, (_, i) => `
        <div class="circle ${i < GameState.correctCount ? 'active correct-circle' : ''}"></div>
    `).join('');
    
    // 실수 원 (3개): 실수할 때마다 빨간색으로 채워짐
    const mistakeCircles = Array.from({ length: 3 }, (_, i) => `
        <div class="circle ${i < GameState.mistakesCount ? 'active mistake-circle' : ''}"></div>
    `).join('');
    
    app.innerHTML = `
        <img src="./assets/Stage${String(stageNum).padStart(2, '0')}.png" class="screen-background" alt="Stage ${stageNum}">
        <div class="quiz-screen">
            <div class="status-bar">
                <div class="status-left">Stage ${stageNum}/4</div>
                <div class="status-center circles-container">${correctCircles}</div>
                <div class="status-right circles-container">${mistakeCircles}</div>
            </div>
            <div class="quiz-content">
                <div class="question-box">
                    <div class="question-text">${questionData.question}</div>
                </div>
                <div class="options-container">
                    ${(() => {
                        const shuffledOptions = [...questionData.options].sort(() => Math.random() - 0.5);
                        return shuffledOptions.map((option, idx) => `
                            <button class="option-button" data-option="${option}">
                                ${String.fromCharCode(65 + idx)}. ${option}
                            </button>
                        `).join('');
                    })()}
                </div>
            </div>
        </div>
    `;
    
    // 옵션 버튼 이벤트 리스너
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.addEventListener('click', () => checkAnswer(stageNum, questions, btn.dataset.option, btn));
    });
}

function renderFinalScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <img src="./assets/StageFinal.png" class="screen-background" alt="Stage Final">
        <div class="result-screen">
            <div class="result-box">
                <h2>🎉 축하합니다!</h2>
                <p>모든 스테이지를 완료했습니다!</p>
                <div class="result-message">당신은 영화 마스터입니다!</div>
            </div>
            <button class="btn" id="restartBtn">재시작</button>
        </div>
    `;
    
    document.getElementById('restartBtn').addEventListener('click', () => {
        MusicManager.stopMusic();
        GameState.reset();
        renderStartScreen();
    });
}

function renderGameOverScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <img src="./assets/StageEnd.png" class="screen-background" alt="Stage End">
        <div class="result-screen">
            <div class="result-box">
                <h2>😢 탈락</h2>
                <p>Stage ${GameState.currentStage}</p>
                <div class="result-message">아쉽습니다! 다시 도전해보세요!</div>
            </div>
            <button class="btn" id="retryBtn">재도전</button>
        </div>
    `;
    
    document.getElementById('retryBtn').addEventListener('click', () => {
        MusicManager.stopMusic();
        GameState.reset();
        renderStartScreen();
    });
}

// ====== 게임 로직 ======
function checkAnswer(stageNum, questions, selectedAnswer, buttonElement) {
    const stageData = GameState.quizData.movie_quiz_app.stages[stageNum - 1];
    const currentQuestion = questions[0];
    const questionData = stageData.questions[currentQuestion];
    const isCorrect = selectedAnswer === questionData.answer;
    
    // 모든 버튼 비활성화
    document.querySelectorAll('.option-button').forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        // 정답 표시
        buttonElement.classList.add('correct');
        GameState.correctCount++;
        GameState.correctAnswers++;
        
        // 0.8초 후 다음 문제 또는 결과
        setTimeout(() => {
            if (GameState.correctCount === 5) {
                // 5연속 정답 성공! 스테이지 클리어
                GameState.addUsedQuestions();
                setTimeout(() => {
                    if (stageNum === 4) {
                        // 최종 스테이지 클리어
                        playVideoAndTransition(4, 'stageFinal');
                    } else {
                        // 다음 스테이지로
                        playVideoAndTransition(stageNum + 1, 'stageIntro');
                    }
                }, 500);
            } else {
                // 아직 5연속이 아님, 다음 문제로
                questions.shift();
                setTimeout(() => renderQuizScreen(stageNum, questions), 500);
            }
        }, 800);
    } else {
        // 오답 표시
        buttonElement.classList.add('wrong');
        GameState.wrongAnswers++;
        GameState.mistakesCount++;
        GameState.correctCount = 0; // 연속 정답 초기화
        
        // 다른 버튼들 dim 처리
        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn !== buttonElement && btn.dataset.option !== questionData.answer) {
                btn.classList.add('selected-wrong');
            }
        });
        
        // 정답 강조
        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn.dataset.option === questionData.answer) {
                btn.classList.add('correct');
            }
        });
        
        // 1.5초 후 처리
        setTimeout(() => {
            if (GameState.mistakesCount >= 3) {
                // 3번 실수 - 탈락
                setTimeout(() => {
                    playVideoAndTransition(stageNum, 'stageOut');
                }, 500);
            } else {
                // 다시 도전
                GameState.drawQuestionSet();
                renderQuizScreen(stageNum, GameState.currentQuestionSet);
            }
        }, 1500);
    }
}

// ====== 비디오 재생 및 전환 ======
function playVideoAndTransition(stageNum, type) {
    // 비디오 재생 시작 시점에 배경음악도 함께 시작
    if (type === 'stageIntro') {
        MusicManager.playMusic(stageNum, 'quiz');
    } else if (type === 'stageOut') {
        MusicManager.playMusic(null, 'gameOver');
    } else if (type === 'stageFinal') {
        MusicManager.playMusic(null, 'final');
    }
    
    const app = document.getElementById('app');
    let videoPath = '';
    
    if (type === 'stageIntro') {
        videoPath = `./assets/Stage${String(stageNum).padStart(2, '0')}In.mp4`;
    } else if (type === 'stageOut') {
        videoPath = `./assets/Stage${String(stageNum).padStart(2, '0')}Out.mp4`;
    } else if (type === 'stageFinal') {
        videoPath = './assets/StageFinalIn.mp4';
    }
    
    app.innerHTML = `
        <div class="video-container">
            <video autoplay muted playsinline>
                <source src="${videoPath}" type="video/mp4">
            </video>
        </div>
    `;
    
    const video = document.querySelector('video');
    
    video.onended = () => {
        if (type === 'stageIntro') {
            GameState.startStage(stageNum);
            GameState.drawQuestionSet();
            renderQuizScreen(stageNum, GameState.currentQuestionSet);
        } else if (type === 'stageOut') {
            renderGameOverScreen();
        } else if (type === 'stageFinal') {
            renderFinalScreen();
        }
    };
    
    video.play().catch(err => {
        console.warn('비디오 자동 재생 실패:', err);
        // 비디오 재생 실패 시 자동으로 다음 단계로
        video.onended();
    });
}

// ====== 초기화 ======
async function initGame() {
    try {
        const response = await fetch('./quizdata_example.json');
        if (!response.ok) throw new Error('데이터 로드 실패');
        
        GameState.quizData = await response.json();
        GameState.reset();
        renderStartScreen();
    } catch (error) {
        console.error('초기화 오류:', error);
        const app = document.getElementById('app');
        app.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #fff; text-align: center;">
                <h2>오류가 발생했습니다</h2>
                <p>${error.message}</p>
                <p>quizdata_example.json 파일이 프로젝트 루트에 있는지 확인하세요.</p>
                <button class="btn" onclick="location.reload()">새로고침</button>
            </div>
        `;
    }
}

// 문서 로드 완료 후 게임 시작
document.addEventListener('DOMContentLoaded', initGame);
