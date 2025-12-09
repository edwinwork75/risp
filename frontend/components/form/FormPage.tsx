"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import FormHeader from "@/components/form/FormHeader";
import IntroPage from "@/components/form/IntroPage";
import FormFooter from "@/components/form/FormFooter";
import MultipleChoice from "@/components/form/QuestionTypes/MultipleChoice";
import NumberInput from "@/components/form/QuestionTypes/NumberInput";
import ShortAnswer from "@/components/form/QuestionTypes/ShortAnswer";
import RadioQuestion from "@/components/form/QuestionTypes/RadioQuestion";
import Dropdown from "@/components/form/QuestionTypes/Dropdown";
import { mcApiService } from "@/lib/mcApiService";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { calculateSectionScores, getSectionStatsAndRecommendation } from "@/components/report/reportUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssessmentState {
  answers: Record<number, { value: string; comment?: string }>;
  showIntro: boolean;
  timestamp: number;
}

interface ResponseItem {
  question: string;
  response: string | object;
  score: number;
  section: string | null;
}

export default function FormPage() {
  const [answers, setAnswers] = useState<Record<number, { value: string; comment?: string }>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedState, setSavedState] = useState<AssessmentState | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams?.get("userId") || "";
  const assignmentId = searchParams?.get("id") || "";
  const organisationId = searchParams?.get("organisationId") || "";
  const slug = searchParams?.get("slug") || "";

  const getStorageKey = () => `assessment_${userId}_${assignmentId}_${slug}`;

  const saveToLocalStorage = (state: Partial<AssessmentState>) => {
    try {
      const currentState: AssessmentState = {
        answers,
        showIntro,
        timestamp: Date.now(),
        ...state
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(currentState));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const loadFromLocalStorage = (): AssessmentState | null => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const state = JSON.parse(saved) as AssessmentState;
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (state.timestamp > sevenDaysAgo) {
          return state;
        } else {
          localStorage.removeItem(getStorageKey());
        }
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
    return null;
  };

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  const resumeFromSavedState = () => {
    if (savedState) {
      setAnswers(savedState.answers);
      setShowIntro(savedState.showIntro);
      setShowResumeDialog(false);
      setSavedState(null);
    }
  };

  const startFreshAssessment = () => {
    clearLocalStorage();
    setShowResumeDialog(false);
    setSavedState(null);
    setAnswers({});
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { wellbeingQuestions } = await import(`@/lib/[slug]/${slug}`);
        setQuestions(wellbeingQuestions);
        
        const saved = loadFromLocalStorage();
        if (saved && Object.keys(saved.answers).length > 0) {
          setSavedState(saved);
          setShowResumeDialog(true);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    };

    if (slug) {
      fetchQuestions();
    }
  }, [slug]);

  useEffect(() => {
    if (questions.length > 0 && !showIntro) {
      saveToLocalStorage({ answers, showIntro });
    }
  }, [answers, showIntro, questions.length]);

  const handleSubmit = async () => {
    const missingRequired = questions.some(q => {
      if (q.optional) return false;
      const answerData = answers[q.id];
      return !answerData || !answerData.value || answerData.value.trim() === "";
    });

    if (missingRequired) {
      alert("Please answer all required questions before submitting.");
      return;
    }

    const submittedAt = new Date().toISOString();
    let finalScore = 0;

    const responses: ResponseItem[] = Object.entries(answers).map(([questionId, answerData]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      const answer = answerData.value;
      const comment = answerData.comment;
      const optionIndex = question?.options?.indexOf(answer) ?? -1;
      let score = 0;

      if (optionIndex >= 0) {
        score = question?.scoreType === "S" 
          ? optionIndex + 1 
          : 5 - optionIndex;
        finalScore += score;
      }

      return {
        question: question?.text || "Unknown question",
        response: comment ? { value: answer, comment } : answer,
        score,
        section: question.section
      };
    });

    const sectionScores = calculateSectionScores(responses);

    const sectionReports = sectionScores.map((s) => {
      const { mean, sd, recommendation } = getSectionStatsAndRecommendation(slug, s.section, s.score);
      const normativeScore = mean && sd ? Math.round((mean - sd) * 100) / 100 : undefined;
      return {
        section: s.section,
        score: s.score,
        normativeScore,
        recommendation,
      };
    });

    responses.push({
      question: "Final Score",
      response: sectionReports,
      score: finalScore,
      section: null
    });

    console.log("Responses being sent:", responses);

    try {
      await mcApiService.patch(
        `/organisations/${organisationId}/assessment-assignments/${assignmentId}/response`,
        {
          userId,
          submittedBy: userId,
          submittedAt,
          status: "COMPLETED",
          responses,
          report: {}
        }
      );

      clearLocalStorage();
      router.push(`./thank-you?finalScore=${finalScore}`);
    } catch (error) {
      console.error("Error submitting responses:", error);
    }
  };

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], value }
    }));
  };

  const handleCommentChange = (questionId: number, comment: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], comment }
    }));
  };

  const handleStartAssessment = () => {
    setShowIntro(false);
  };
  
  const renderQuestionsBySection = () => {
    const sections: { [key: string]: any[] } = {};
    questions.forEach(q => {
      const sectionName = q.section || "General";
      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      sections[sectionName].push(q);
    });

    return Object.entries(sections).map(([sectionName, sectionQuestions]) => (
      <Card key={sectionName} className="mb-8">
        <CardHeader>
          <CardTitle>{sectionName}</CardTitle>
        </CardHeader>
        <CardContent>
          {sectionQuestions.map((question, index) => (
            <div key={question.id} className="mb-6 pb-6 border-b last:border-b-0">
              {renderQuestion(question, index)}
            </div>
          ))}
        </CardContent>
      </Card>
    ));
  };

  const renderQuestion = (question: any, index: number) => {
    const answer = answers[question.id];
    
    switch (question.type) {
      case "multiple-choice":
        return (
          <MultipleChoice
            question={`${index + 1}. ${question.text}`}
            options={question.options || []}
            onChange={(val) => handleAnswer(question.id, val)}
            onCommentChange={(comment) => handleCommentChange(question.id, comment)}
            value={answer?.value}
            comment={answer?.comment}
          />
        );
      case "number":
        return (
          <NumberInput
            question={`${index + 1}. ${question.text}`}
            onChange={(val) => handleAnswer(question.id, val)}
            onCommentChange={(comment) => handleCommentChange(question.id, comment)}
            value={answer?.value}
            comment={answer?.comment}
          />
        );
      case "short-answer":
        return (
          <ShortAnswer
            question={`${index + 1}. ${question.text}`}
            onChange={(val) => handleAnswer(question.id, val)}
            onCommentChange={(comment) => handleCommentChange(question.id, comment)}
            value={answer?.value}
            comment={answer?.comment}
          />
        );
      case "radio":
        return (
          <RadioQuestion
            question={`${index + 1}. ${question.text}`}
            options={question.options || []}
            onChange={(val) => handleAnswer(question.id, val)}
            onCommentChange={(comment) => handleCommentChange(question.id, comment)}
            value={answer?.value}
            comment={answer?.comment}
          />
        );
      case "dropdown":
        return (
          <Dropdown
            question={`${index + 1}. ${question.text}`}
            options={question.options || []}
            onChange={(val) => handleAnswer(question.id, val)}
            onCommentChange={(comment) => handleCommentChange(question.id, comment)}
            value={answer?.value}
            comment={answer?.comment}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <FormHeader showProgress={false} />

      <main className="flex-1 flex flex-col">
        <div className="container max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col">
          {showIntro ? (
            <div className="flex-1 flex items-center justify-center">
              <IntroPage onStart={handleStartAssessment} />
            </div>
          ) : (
            <>
              {renderQuestionsBySection()}
              <div className="mt-8 flex justify-end items-center">
                <Button
                  onClick={() => setShowSubmitConfirmation(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  Submit
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <FormFooter />

      {showResumeDialog && (
        <Dialog open={showResumeDialog} onOpenChange={() => { }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resume Assessment</DialogTitle>
              <DialogDescription>
                We found a previous session of this assessment. Would you like to continue where you left off or start fresh?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={resumeFromSavedState}>Resume</Button>
              <Button variant="outline" onClick={startFreshAssessment}>Start Fresh</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showSubmitConfirmation && (
        <Dialog open={showSubmitConfirmation} onOpenChange={(isOpen) => setShowSubmitConfirmation(isOpen)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit your responses?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleSubmit}>Submit</Button>
              <Button variant="outline" onClick={() => setShowSubmitConfirmation(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}