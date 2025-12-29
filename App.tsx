
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_QUESTIONS } from './constants';
import { GameStatus, Question, OptionKey, QuizResult } from './types';
import { 
  Trophy, 
  Timer, 
  RotateCcw, 
  Play, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Target
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import confetti from 'canvas-confetti';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const TOTAL_QUESTIONS = 10;
const SESSION_TIME = 30;

export default function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_TIME);
  const [userAnswers, setUserAnswers] = useState<(OptionKey | null)[]>([]);
  const [results, setResults] = useState<QuizResult | null>(null);
  
  // Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to fix namespace error in browser environment
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shuffleAndPick = useCallback(() => {
    const shuffled = [...ALL_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, TOTAL_QUESTIONS);
  }, []);

  const finishGame = useCallback((finalAnswers: (OptionKey | null)[], finalScore: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const correct = finalAnswers.filter((ans, idx) => ans === questions[idx]?.answer).length;
    const answeredCount = finalAnswers.filter(ans => ans !== null).length;
    const wrong = answeredCount - correct;
    const unanswered = TOTAL_QUESTIONS - answeredCount;

    setResults({
      score: finalScore,
      correctCount: correct,
      wrongCount: wrong,
      unansweredCount: unanswered,
      questions: [...questions],
      userAnswers: [...finalAnswers]
    });
    setStatus(GameStatus.FINISHED);
    
    if (finalScore > 5) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [questions]);

  const startGame = () => {
    const picked = shuffleAndPick();
    setQuestions(picked);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(SESSION_TIME);
    setUserAnswers(new Array(TOTAL_QUESTIONS).fill(null));
    setResults(null);
    setStatus(GameStatus.PLAYING);
  };

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishGame(userAnswers, score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, userAnswers, score, finishGame]);

  const handleAnswer = (option: OptionKey) => {
    const isCorrect = option === questions[currentIndex].answer;
    const newScore = isCorrect ? score + 1 : score - 1;
    const nextAnswers = [...userAnswers];
    nextAnswers[currentIndex] = option;

    setScore(newScore);
    setUserAnswers(nextAnswers);

    if (currentIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishGame(nextAnswers, newScore);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Trophy className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              大象專題研習挑戰
            </h1>
          </div>
          {status === GameStatus.PLAYING && (
            <div className={`flex items-center space-x-4 px-4 py-2 rounded-full font-mono font-bold text-lg shadow-inner ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
              <Timer className="w-5 h-5" />
              <span>00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300">
          {status === GameStatus.IDLE && (
            <div className="p-8 md:p-12 text-center">
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 scale-150"></div>
                  <img src="https://cdn-icons-png.flaticon.com/512/616/616412.png" alt="Elephant" className="relative w-32 h-32 md:w-48 md:h-48 drop-shadow-xl" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">《動物園雜誌》大象測驗</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                你準備好成為大象專家了嗎？<br/>
                系統將隨機抽取 <span className="font-bold text-blue-600">10 題</span>，限時 <span className="font-bold text-red-500">30 秒</span> 全力衝刺！
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                  <div className="bg-green-50 p-4 rounded-2xl flex flex-col items-center">
                    <span className="text-green-600 font-bold text-xl">+1</span>
                    <span className="text-xs text-slate-500">答對得分</span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl flex flex-col items-center">
                    <span className="text-red-600 font-bold text-xl">-1</span>
                    <span className="text-xs text-slate-500">答錯扣分</span>
                  </div>
                </div>
                <button 
                  onClick={startGame}
                  className="w-full sm:w-64 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2 group"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span className="text-lg">開始挑戰</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {status === GameStatus.PLAYING && (
            <div className="p-6 md:p-10">
              <div className="flex justify-between items-center mb-6">
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">
                  題目 {currentIndex + 1} / {TOTAL_QUESTIONS}
                </span>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 font-bold">積分: {score}</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-500" 
                    style={{ width: `${((currentIndex) / TOTAL_QUESTIONS) * 100}%` }}
                  ></div>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-tight">
                {questions[currentIndex]?.text}
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleAnswer(key)}
                    className="group relative flex items-center text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-bold text-slate-600 transition-colors mr-4">
                      {key}
                    </span>
                    <span className="text-slate-700 group-hover:text-blue-900 font-medium">
                      {questions[currentIndex]?.options[key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === GameStatus.FINISHED && results && (
            <div className="p-6 md:p-10 text-center">
              <div className="mb-6 flex flex-col items-center">
                <div className="bg-yellow-50 p-4 rounded-full mb-4">
                  <Trophy className="w-12 h-12 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">測驗結束！</h2>
                <div className="mt-2 text-5xl font-black text-blue-600 tracking-tight">
                  {results.score} 分
                </div>
                <p className="text-slate-400 text-sm mt-1 uppercase font-bold tracking-widest">Final Score</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 items-center">
                <div className="max-w-[240px] mx-auto w-full">
                  <Pie 
                    data={{
                      labels: ['正確', '錯誤', '未答'],
                      datasets: [{
                        data: [results.correctCount, results.wrongCount, results.unansweredCount],
                        backgroundColor: ['#22c55e', '#ef4444', '#cbd5e1'],
                        borderWidth: 0,
                      }]
                    }}
                    options={{
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center text-green-700 font-bold">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      正確題數
                    </div>
                    <span className="text-green-800 font-black">{results.correctCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center text-red-700 font-bold">
                      <XCircle className="w-5 h-5 mr-2" />
                      錯誤題數
                    </div>
                    <span className="text-green-800 font-black">{results.wrongCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center text-slate-700 font-bold">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      未答題數
                    </div>
                    <span className="text-slate-800 font-black">{results.unansweredCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={startGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>再挑戰一次</span>
                </button>
                <button 
                  onClick={() => setStatus(GameStatus.IDLE)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-8 rounded-2xl transition-all"
                >
                  回首頁
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>© 2024 《動物園雜誌》大象專題研習測驗</p>
        <p className="mt-1">愛護動物，從認識大象開始</p>
      </footer>
    </div>
  );
}
