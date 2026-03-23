import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Card, CardContent } from "../../components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, AlertTriangle } from "lucide-react";

const FullScreenTest = ({ testData }) => {
  const navigate = useNavigate();
  const { testId } = useParams();

  // Stable IDs and keys
  const resolvedTestId = testId || 1;
  const testKey = `test_${resolvedTestId}_session`;
  const lockoutKey = `lockout_${resolvedTestId}`;

  // Hydrate initial answers and currentQuestion from sessionStorage to avoid overwriting on first render
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`${testKey}_answers`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const saved = sessionStorage.getItem(`${testKey}_question`);
    return saved ? parseInt(saved) : 0;
  });

  const [timeLeft, setTimeLeft] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [promptCountdown, setPromptCountdown] = useState(10);

  // Refs for tracking state
  const testStartTimeRef = useRef(null);
  const promptTimerRef = useRef(null);
  const hasEnteredFullscreenRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const suppressExitUntilRef = useRef(0); // time threshold to ignore exit events right after mount
  const prevFullscreenRef = useRef(false); // track fullscreen state across resize
  const hydratedRef = useRef(false); // guard to prevent initial overwrite of session storage
  const backendUrl = import.meta.env.VITE_API_URL;

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchTest = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/aptitude-tests/user/${testId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data?.data) {
          setTest(data.data);
        } else {
          navigate("/home"); // redirect if invalid
        }
      } catch {
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId, navigate]);










  // Heuristic: consider both Fullscreen API and browser F11 fullscreen
  const isFullscreenActive = () => {
    const apiElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    const displayModeFullscreen =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: fullscreen)").matches;

    // Heuristic for browser UI fullscreen (F11)
    const sizeFullscreen =
      Math.abs(window.innerHeight - window.screen.height) <= 1 &&
      Math.abs(window.innerWidth - window.screen.width) <= 1;

    return !!(apiElement || displayModeFullscreen || sizeFullscreen);
  };


  // Initialize test session
  useEffect(() => {
    if (!test) return;
    // Lockout check
    const lockoutTime = sessionStorage.getItem(lockoutKey);
    if (lockoutTime && Date.now() < parseInt(lockoutTime)) {
      setIsLocked(true);
      return;
    }

    // Start time
    let startTime = sessionStorage.getItem(`${testKey}_start`);
    if (!startTime) {
      startTime = Date.now().toString();
      sessionStorage.setItem(`${testKey}_start`, startTime);
    }
    testStartTimeRef.current = parseInt(startTime);

    // Time left
    const elapsed = Math.floor((Date.now() - testStartTimeRef.current) / 1000);
    const remaining = Math.max(0, test.duration * 60 - elapsed);
    setTimeLeft(remaining);

    // Event listeners
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResizeCheck);

    // Set suppression window to ignore spurious exit events right after refresh
    suppressExitUntilRef.current = Date.now() + 1200;

    // Initial fullscreen evaluation (API or F11)
    const initializeFullscreen = async () => {
      const nowFs = isFullscreenActive();
      prevFullscreenRef.current = nowFs;

      if (nowFs) {
        // Already in fullscreen (after refresh)
        hasEnteredFullscreenRef.current = true;
        isInitialLoadRef.current = false;
        setShowFullscreenPrompt(false);
        stopPromptTimer();
      } else {
        // Try app fullscreen
        try {
          await enterFullscreen();
          hasEnteredFullscreenRef.current = true;
          isInitialLoadRef.current = false;
          setShowFullscreenPrompt(false);
          stopPromptTimer();
          prevFullscreenRef.current = true;
        } catch {
          // App fullscreen failed, prompt user, but only if still not fullscreen
          setTimeout(() => {
            if (!hasEnteredFullscreenRef.current && !isFullscreenActive()) {
              setShowFullscreenPrompt(true);
              startFullscreenPromptTimer();
            }
          }, 500);
          isInitialLoadRef.current = false;
        }
      }

      // Mark hydration complete so save effect can run safely
      hydratedRef.current = true;
    };

    const t = setTimeout(initializeFullscreen, 200);

    return () => {
      clearTimeout(t);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResizeCheck);
      if (promptTimerRef.current) clearInterval(promptTimerRef.current);
    };
    // We purposely depend only on keys that won't change during the session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test]);

  // Timer countdown for test duration
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isLocked) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLocked]);

  // Save progress to sessionStorage (guarded to avoid initial overwrite)
  useEffect(() => {
    if (!hydratedRef.current) return;
    sessionStorage.setItem(`${testKey}_answers`, JSON.stringify(answers));
    sessionStorage.setItem(`${testKey}_question`, currentQuestion.toString());
  }, [answers, currentQuestion, testKey]);

  const enterFullscreen = () => {
    const element = document.documentElement;
    const fullscreenPromise =
      element.requestFullscreen?.() ||
      element.mozRequestFullScreen?.() ||
      element.webkitRequestFullscreen?.() ||
      element.msRequestFullscreen?.() ||
      Promise.reject(new Error("Fullscreen not supported"));
    return fullscreenPromise;
  };

  const startFullscreenPromptTimer = () => {
    stopPromptTimer();
    setPromptCountdown(10);

    promptTimerRef.current = setInterval(() => {
      if (isFullscreenActive()) {
        hasEnteredFullscreenRef.current = true;
        setShowFullscreenPrompt(false);
        stopPromptTimer();
        return;
      }

      setPromptCountdown(prev => {
        if (prev <= 1) {
          stopPromptTimer();
          handlePromptTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePromptTimeout = () => {
    setShowFullscreenPrompt(false);
    if (isFullscreenActive()) {
      hasEnteredFullscreenRef.current = true;
      return;
    }
    handleConfirmExit();
  };

  const stopPromptTimer = () => {
    if (promptTimerRef.current) {
      clearInterval(promptTimerRef.current);
      promptTimerRef.current = null;
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => { });
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const maybeShowExitModalOnExit = () => {
    // Ignore exits that happen immediately after mount/refresh
    if (Date.now() < suppressExitUntilRef.current) return;

    // Show modal only if test is ongoing and user had entered fullscreen
    if (
      hasEnteredFullscreenRef.current &&
      !isInitialLoadRef.current &&
      currentQuestion < test.questions.length &&
      !showFullscreenPrompt // don't overlap with prompt
    ) {
      setShowExitModal(true);
    }
  };

  const handleFullscreenChange = () => {
    const nowFs = isFullscreenActive();

    if (nowFs) {
      hasEnteredFullscreenRef.current = true;
      setShowFullscreenPrompt(false);
      stopPromptTimer();
    } else {
      maybeShowExitModalOnExit();
    }

    prevFullscreenRef.current = nowFs;
  };

  const handleResizeCheck = () => {
    // Detect F11 toggling via size change
    const nowFs = isFullscreenActive();

    // Entered fullscreen via F11
    if (!prevFullscreenRef.current && nowFs) {
      hasEnteredFullscreenRef.current = true;
      setShowFullscreenPrompt(false);
      stopPromptTimer();
    }

    // Exited fullscreen via F11
    if (prevFullscreenRef.current && !nowFs) {
      maybeShowExitModalOnExit();
    }

    prevFullscreenRef.current = nowFs;
  };

  const handleKeyDown = e => {
    // During prompt, don't block F11; detection is via resize/heuristic
    if (showFullscreenPrompt) return;

    if (isFullscreenActive() && hasEnteredFullscreenRef.current) {
      // Prevent leaving via Escape or closing tab via Ctrl+W
      if (e.key === "Escape" || (e.ctrlKey && (e.key === "w" || e.key === "W"))) {
        e.preventDefault();
        setShowExitModal(true);
      }
    }
  };

  const handleAnswerChange = value => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    // Convert answers → A, B, C, D
    const formattedAnswers = Object.fromEntries(
      Object.entries(answers).map(([qIndex, val]) => [
        qIndex,
        String.fromCharCode(65 + parseInt(val)) // 0 → 'A', 1 → 'B'
      ])
    );

    // Call backend API
    const res = await fetch(`${backendUrl}/api/aptitude-tests/${test._id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ testId: test._id, answers: formattedAnswers })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Submission failed");

    // Clear sessionStorage after successful submission
    sessionStorage.removeItem(`${testKey}_start`);
    sessionStorage.removeItem(`${testKey}_answers`);
    sessionStorage.removeItem(`${testKey}_question`);

    // Navigate to results page with backend response
    exitFullscreen();
    navigate(`/results/${test._id}`, { state: { result: data.data } });
  } catch (err) {
    console.error("Submit error:", err);
    alert("Failed to submit test. Please try again.");
  }
};

  const handleConfirmExit = () => {
    const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutes
    sessionStorage.setItem(lockoutKey, lockoutTime.toString());

    // Clear test data
    sessionStorage.removeItem(`${testKey}_start`);
    sessionStorage.removeItem(`${testKey}_answers`);
    sessionStorage.removeItem(`${testKey}_question`);

    exitFullscreen();
    navigate('/home', { state: { section: "tests" } })
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Test Locked</h2>
            <p className="text-muted-foreground mb-4">
              You exited the test early and must wait 15 minutes before retaking it.
            </p>
            <Button onClick={() => navigate("/home", { state: { section: "tests" } })}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (loading) return <div className="p-6">Loading test...</div>;
  if (!test) return <div className="p-6">Test not found</div>;


  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const currentQ = test.questions[currentQuestion];

  return (
    <>
      <div className="fixed inset-0 bg-background z-50 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center p-6 border-b border-border bg-card"
        >
          <div className="flex-1" />

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">{test.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {test.questions.length}
            </p>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-destructive" />
              <span className="text-lg font-mono font-bold text-destructive">
                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-muted h-2">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl"
          >
            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-8 text-foreground leading-relaxed">
                  {currentQ.question}
                </h2>

                <RadioGroup
                  value={answers[currentQuestion] || ""}
                  onValueChange={handleAnswerChange}
                  className="space-y-4"
                >
                  {currentQ.options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 text-lg cursor-pointer">
                        <span className="font-semibold mr-3">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-t border-border bg-card"
        >
          <div className="flex justify-end max-w-4xl mx-auto">
            {currentQuestion < test.questions.length - 1 ? (
              <Button onClick={handleNext} disabled={!answers[currentQuestion]} size="lg" className="px-8">
                Next Question
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length === 0}
                variant="hero"
                size="lg"
                className="px-8"
              >
                Submit Test
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Exit Warning Modal */}
      <AlertDialog open={showExitModal} onOpenChange={setShowExitModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Exit Test Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              This test cannot be retaken. If you exit now, you will be locked out for 15 minutes.
              Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowExitModal(false);
                // Try to re-enter app fullscreen, otherwise rely on F11
                enterFullscreen()
                  .then(() => {
                    hasEnteredFullscreenRef.current = true;
                  })
                  .catch(() => {
                    if (!isFullscreenActive()) {
                      setShowFullscreenPrompt(true);
                      startFullscreenPromptTimer();
                    }
                  });
              }}
            >
              Continue Test
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit} variant="destructive">
              Exit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fullscreen Prompt Modal */}
      <AlertDialog open={showFullscreenPrompt} onOpenChange={() => { }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Fullscreen Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This test must be taken in fullscreen mode. Press{" "}
              <kbd className="bg-muted px-2 py-1 rounded font-mono">F11</kbd> to enter fullscreen
              or click Continue Test to enter app fullscreen. You have:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-destructive">{promptCountdown}</div>
            <div className="text-sm text-muted-foreground">seconds remaining</div>
          </div>
          <AlertDialogFooter className="justify-center">
            <div className="text-xs text-muted-foreground text-center">
              Test will be locked if fullscreen is not enabled in time
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FullScreenTest;