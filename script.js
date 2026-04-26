// ====== 에셋 관리 (프리로딩) ======
const AssetManager = {
    images: {},
    videos: {},
    
    async preloadImage(path) {
        if (this.images[path]) return;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                this.images[path] = true;
                resolve();
            };
            img.onerror = reject;
        });
    },
    
    async preloadVideo(path) {
        if (this.videos[path]) return;
        try {
            const response = await fetch(path);
            const blob = await response.blob();
            this.videos[path] = URL.createObjectURL(blob);
        } catch (err) {
            console.warn(`비디오 프리로딩 실패 (${path}):`, err);
        }
    },

    // 다음 스테이지 에셋 미리 로드
    preloadNextStage(stageNum) {
        if (stageNum < 4) {
            this.preloadImage(`./assets/Stage${String(stageNum + 1).padStart(2, '0')}.png`);
            this.preloadVideo(`./assets/Stage${String(stageNum + 1).padStart(2, '0')}In.mp4`);
        }
        if (stageNum === 4) {
            this.preloadImage('./assets/StageFinal.png');
            this.preloadVideo('./assets/StageFinalIn.mp4');
        }
    }
};

// ====== 제스처 관리 (AI 카메라 컨트롤) ======
const GestureManager = {
    hands: null,
    camera: null,
    isActive: false,
    currentGesture: null, // 마지막으로 인식된 숫자 (1-4)
    
    async init() {
        if (this.hands) return;
        
        const videoElement = document.getElementById('webcam-video');
        const canvasElement = document.getElementById('webcam-canvas');
        const canvasCtx = canvasElement.getContext('2d');
        const indicator = document.getElementById('gesture-indicator');
        
        canvasElement.width = 240;
        canvasElement.height = 180;
        
        this.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });
        
        this.hands.onResults((results) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];
                
                if (window.drawConnectors && window.drawLandmarks) {
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
                    drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1, radius: 2});
                }
                
                const fingers = this.countFingers(landmarks);
                if (fingers >= 1 && fingers <= 4) {
                    this.currentGesture = fingers;
                    indicator.innerText = `${fingers}번 선택됨 (시간 종료 시 제출)`;
                    indicator.classList.add('visible');
                    this.highlightOption(fingers);
                } else {
                    this.currentGesture = null;
                    indicator.classList.remove('visible');
                    this.highlightOption(null);
                }
            } else {
                this.currentGesture = null;
                indicator.classList.remove('visible');
                this.highlightOption(null);
            }
            canvasCtx.restore();
        });
        
        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                await this.hands.send({image: videoElement});
            },
            width: 240,
            height: 180
        });
    },
    
    resetState() {
        this.currentGesture = null;
        const indicator = document.getElementById('gesture-indicator');
        if (indicator) indicator.classList.remove('visible');
        this.highlightOption(null);
        
        // 캔버스 드로잉 초기화
        const canvasElement = document.getElementById('webcam-canvas');
        if (canvasElement) {
            const canvasCtx = canvasElement.getContext('2d');
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }
    },
    
    async start() {
        if (window.innerWidth >= 1024) {
            await this.init();
            this.resetState();
            if (!this.isActive) {
                document.getElementById('webcam-container').classList.add('active');
                this.camera.start();
                this.isActive = true;
            }
        }
    },
    
    stop() {
        if (this.isActive) {
            this.camera.stop();
            document.getElementById('webcam-container').classList.remove('active');
            this.isActive = false;
            this.resetState();
        }
    },
    
    countFingers(landmarks) {
        const tips = [8, 12, 16, 20];
        const pips = [6, 10, 14, 18];
        let count = 0;
        
        for (let i = 0; i < tips.length; i++) {
            if (landmarks[tips[i]].y < landmarks[pips[i]].y) {
                count++;
            }
        }
        return count;
    },
    
    highlightOption(index) {
        const options = document.querySelectorAll('.option-button');
        options.forEach((btn, idx) => {
            if (index !== null && idx === index - 1) {
                btn.style.boxShadow = '0 0 25px #f1c40f';
                btn.style.border = '2px solid #f1c40f';
                btn.style.transform = 'scale(1.05)';
            } else {
                btn.style.boxShadow = '';
                btn.style.border = '';
                btn.style.transform = '';
            }
        });
    }
};

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
    questionsForStage: [], // 이 스테이지의 5개 문제 인덱스
    questionIndex: 0, // 현재 제시하는 문제 인덱스 (0-4)
    correctCount: 0, // 맞춘 개수 (0-3, 3이면 클리어)
    wrongCount: 0, // 틀린 개수 (0-3, 3이면 탈락)
    correctAnswers: 0, // 맞춘 총 문제 수
    wrongAnswers: 0, // 틀린 총 문제 수
    timer: null,
    timeRemaining: 10,
    
    reset() {
        this.currentStage = 0;
        this.questionsForStage = [];
        this.questionIndex = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.stopTimer();
    },
    
    startStage(stageNum) {
        this.currentStage = stageNum;
        this.questionIndex = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        
        // 현재 스테이지의 20개 문제 중에서 5개를 무작위로 선택
        const allQuestions = Array.from({ length: 20 }, (_, i) => i);
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        this.questionsForStage = shuffled.slice(0, 5);
    },
    
    getCurrentQuestion() {
        if (this.questionIndex < this.questionsForStage.length) {
            return this.questionsForStage[this.questionIndex];
        }
        return null;
    },
    
    moveToNextQuestion() {
        this.questionIndex++;
    },

    startTimer(stageNum, callback) {
        this.stopTimer();
        this.timeRemaining = 10;
        const timerBar = document.getElementById('timerBar');
        if (timerBar) timerBar.style.width = '100%';

        this.timer = setInterval(() => {
            this.timeRemaining -= 0.1;
            if (timerBar) {
                timerBar.style.width = `${(this.timeRemaining / 10) * 100}%`;
            }

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                callback();
            }
        }, 100);
    },

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
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

function renderQuizScreen(stageNum) {
    const app = document.getElementById('app');
    const stageData = GameState.quizData.movie_quiz_app.stages[stageNum - 1];
    const currentQuestionIndex = GameState.getCurrentQuestion();
    const questionData = stageData.questions[currentQuestionIndex];
    
    // 정답 원 (3개): 맞춘 개수만큼 녹색으로 채워짐
    const correctCircles = Array.from({ length: 3 }, (_, i) => `
        <div class="circle ${i < GameState.correctCount ? 'active correct-circle' : ''}"></div>
    `).join('');
    
    // 오답 원 (3개): 틀린 개수만큼 빨간색으로 채워짐
    const wrongCircles = Array.from({ length: 3 }, (_, i) => `
        <div class="circle ${i < GameState.wrongCount ? 'active mistake-circle' : ''}"></div>
    `).join('');
    
    // 진행 상황 (예: 문제 2/5)
    const progressText = `문제 ${GameState.questionIndex + 1}/5`;
    
    app.innerHTML = `
        <img src="./assets/Stage${String(stageNum).padStart(2, '0')}.png" class="screen-background" alt="Stage ${stageNum}">
        <div class="quiz-screen">
            <div class="status-bar">
                <div class="status-left">Stage ${stageNum}/4</div>
                <div class="status-center circles-container">${correctCircles}</div>
                <div class="status-right circles-container">${wrongCircles}</div>
            </div>
            <div class="timer-container">
                <div class="timer-bar" id="timerBar"></div>
            </div>
            <div class="progress-info">${progressText}</div>
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
                <div class="hint-container">
                    <button class="hint-btn" id="hintBtn">💡 힌트보기</button>
                    <div class="hint-text" id="hintText">${questionData.hint}</div>
                </div>
            </div>
        </div>
    `;
    
    // 옵션 버튼 이벤트 리스너
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.addEventListener('click', () => {
            GameState.stopTimer();
            checkAnswer(stageNum, btn.dataset.option, btn);
        });
    });

    // 힌트 버튼 이벤트 리스너
    const hintBtn = document.getElementById('hintBtn');
    const hintText = document.getElementById('hintText');
    hintBtn.addEventListener('click', () => {
        hintText.classList.add('visible');
        hintBtn.style.display = 'none';
    });

    // 타이머 시작
    GameState.startTimer(stageNum, () => {
        const lastGesture = GestureManager.currentGesture;
        if (lastGesture) {
            const buttons = document.querySelectorAll('.option-button');
            const targetBtn = buttons[lastGesture - 1];
            if (targetBtn) {
                checkAnswer(stageNum, targetBtn.dataset.option, targetBtn);
            } else {
                checkAnswer(stageNum, null, null);
            }
        } else {
            checkAnswer(stageNum, null, null);
        }
    });

    // 다음 스테이지 에셋 프리로드
    AssetManager.preloadNextStage(stageNum);

    // 제스처 컨트롤 시작 (데스크탑)
    GestureManager.resetState();
    GestureManager.start();
}

function renderFinalScreen() {
    GestureManager.stop();
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
    GestureManager.stop();
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
function checkAnswer(stageNum, selectedAnswer, buttonElement) {
    GestureManager.stop();
    GameState.stopTimer();
    const stageData = GameState.quizData.movie_quiz_app.stages[stageNum - 1];
    const currentQuestionIndex = GameState.getCurrentQuestion();
    const questionData = stageData.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === questionData.answer;
    
    // 모든 버튼 비활성화
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.disabled = true;
        btn.style.boxShadow = '';
        btn.style.transform = '';
    });
    
    if (isCorrect && buttonElement) {
        // 정답 표시
        buttonElement.classList.add('correct');
        GameState.correctCount++;
        GameState.correctAnswers++;
        
        // 0.8초 후 다음 문제 또는 결과
        setTimeout(() => {
            if (GameState.correctCount === 3) {
                // 3개 정답 성공! 스테이지 클리어
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
                // 아직 3개가 아님, 다음 문제로
                GameState.moveToNextQuestion();
                setTimeout(() => renderQuizScreen(stageNum), 500);
            }
        }, 800);
    } else {
        // 오답 표시 (또는 시간 초과)
        if (buttonElement) {
            buttonElement.classList.add('wrong');
        }
        
        GameState.wrongAnswers++;
        GameState.wrongCount++;
        
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
            if (GameState.wrongCount >= 3) {
                // 3개 오답 - 탈락
                setTimeout(() => {
                    playVideoAndTransition(stageNum, 'stageOut');
                }, 500);
            } else {
                // 다시 도전
                GameState.moveToNextQuestion();
                renderQuizScreen(stageNum);
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
    
    // 프리로드된 비디오 URL이 있으면 사용
    const finalVideoPath = AssetManager.videos[videoPath] || videoPath;
    
    app.innerHTML = `
        <div class="video-container">
            <video autoplay muted playsinline>
                <source src="${finalVideoPath}" type="video/mp4">
            </video>
        </div>
    `;
    
    const video = document.querySelector('video');
    
    video.onended = () => {
        if (type === 'stageIntro') {
            GameState.startStage(stageNum);
            renderQuizScreen(stageNum);
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
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #fff;">
            <div class="loader"></div>
            <p style="margin-top: 20px;" id="loadingText">데이터를 불러오는 중...</p>
        </div>
    `;

    try {
        const response = await fetch('./quizdata_example.json');
        if (!response.ok) throw new Error('데이터 로드 실패');
        
        GameState.quizData = await response.json();
        GameState.reset();

        // 필수 초기 에셋 프리로딩
        const initialAssets = [
            './assets/StageStart.png',
            './assets/Stage01.png',
            './assets/Stage01In.mp4'
        ];

        const loadingText = document.getElementById('loadingText');
        for (let i = 0; i < initialAssets.length; i++) {
            loadingText.innerText = `에셋 최적화 중... (${i + 1}/${initialAssets.length})`;
            if (initialAssets[i].endsWith('.png')) {
                await AssetManager.preloadImage(initialAssets[i]);
            } else {
                await AssetManager.preloadVideo(initialAssets[i]);
            }
        }
        
        renderStartScreen();
    } catch (error) {
        console.error('초기화 오류:', error);
        app.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #fff; text-align: center;">
                <h2>오류 발생</h2>
                <p>${error.message}</p>
                <button class="btn" onclick="location.reload()">새로고침</button>
            </div>
        `;
    }
}

// 문서 로드 완료 후 게임 시작
document.addEventListener('DOMContentLoaded', initGame);
