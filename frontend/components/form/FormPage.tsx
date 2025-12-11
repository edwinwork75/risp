"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, ArrowRight, Save, History } from "lucide-react";
import FormHeader from "@/components/form/FormHeader";
import IntroPage from "@/components/form/IntroPage";
import FormFooter from "@/components/form/FormFooter";
import MultipleChoice from "@/components/form/QuestionTypes/MultipleChoice";
import NumberInput from "@/components/form/QuestionTypes/NumberInput";
import ShortAnswer from "@/components/form/QuestionTypes/ShortAnswer";
import RadioQuestion from "@/components/form/QuestionTypes/RadioQuestion";
import Dropdown from "@/components/form/QuestionTypes/Dropdown";
import DateQuestion from "@/components/form/QuestionTypes/DateQuestion";
import CheckMethod from "@/components/form/QuestionTypes/CheckMethod";
import DualResponseDate from "@/components/form/QuestionTypes/DualResponseDate";
import SignaturesSection from "@/components/form/SignaturesSection";
import ExcelChecklistLayout from "@/components/form/ExcelChecklistLayout";
import QuestionHistoryDrawer from "@/components/form/QuestionHistoryDrawer";
import { mcApiService } from "@/lib/mcApiService";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { calculateSectionScores, getSectionStatsAndRecommendation } from "@/components/report/reportUtils";
import { Card, CardContent } from "@/components/ui/card";
import FormSidebar from "@/components/form/FormSidebar";
import DesktopSidebar from "@/components/form/DesktopSidebar";
import { cn } from "@/lib/utils";
import { Arrow } from "@radix-ui/react-popover";
import { exportToExcel } from "@/lib/excelUtils";

interface AssessmentState {
  answers: Record<number, { value: string | object; comment?: string }>;
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
  const [answers, setAnswers] = useState<Record<number, { value: string | object; comment?: string }>>({});
  const [files, setFiles] = useState<Record<string | number, File[]>>({});
  const [fileObjectUrls, setFileObjectUrls] = useState<Record<string | number, { name: string, url: string }[]>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedState, setSavedState] = useState<AssessmentState | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistoryQuestion, setSelectedHistoryQuestion] = useState<{ id: number, text: string } | null>(null);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const topOfFormRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams?.get("userId") || "";
  const assignmentId = searchParams?.get("id") || "";
  const organisationId = searchParams?.get("organisationId") || "";
  const slug = searchParams?.get("slug") || "";

  const getStorageKey = () => `assessment_${userId}_${assignmentId}_${slug}`;

  const sections = useMemo(() => {
    const sectionsMap: { [key: string]: any[] } = {};
    questions.forEach(q => {
      const sectionName = q.section || "General";
      if (!sectionsMap[sectionName]) {
        sectionsMap[sectionName] = [];
      }
      sectionsMap[sectionName].push(q);
    });
    return Object.entries(sectionsMap);
  }, [questions]);

  const sidebarSections = useMemo(() => {
    return sections
      .map(([name, questions]) => ({
        name,
        questionCount: questions.length
      }));
  }, [sections]);

  const handleSectionClick = (page: number) => {
    setCurrentPage(page);
  };

  // Scroll to top on page change
  useEffect(() => {
    if (!showIntro) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, showIntro]);

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
    setFiles({});
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
    const newUrls: Record<string | number, { name: string, url: string }[]> = {};
    for (const questionId in files) {
      if (files[questionId]) {
        newUrls[questionId] = files[questionId].map(file => ({
          name: file.name,
          url: URL.createObjectURL(file)
        }));
      }
    }
    setFileObjectUrls(newUrls);

    return () => {
      for (const questionId in newUrls) {
        if (newUrls[questionId]) {
          newUrls[questionId].forEach(file => URL.revokeObjectURL(file.url));
        }
      }
    };
  }, [files]);

  useEffect(() => {
    if (questions.length > 0 && !showIntro) {
      saveToLocalStorage({ answers, showIntro });
    }
  }, [answers, showIntro, questions.length]);

  const handleSubmit = async () => {
    const missingRequired = questions.some(q => {
      if (q.optional) return false;
      const answerData = answers[q.id];
      if (q.type === 'dual-response-date') {
        const value = answerData?.value as { main_contractor?: { response: string }, sub_contractor?: { response: string } } | undefined;
        return !value?.main_contractor?.response || !value?.sub_contractor?.response;
      }
      return !answerData || !answerData.value || (typeof answerData.value === 'string' && answerData.value.trim() === "");
    });

    if (missingRequired) {
      alert("Please answer all required questions before submitting.");
      return;
    }

    setIsUploading(true);

    try {
      const uploadedFileUrls: Record<string | number, string[]> = {};
      for (const key in files) {
        const fileList = files[key];
        if (fileList && fileList.length > 0) {
          uploadedFileUrls[key] = [];
          for (const file of fileList) {
            const formData = new FormData();
            formData.append("file", file);
            // This is an assumed endpoint. In a real project, replace with the actual one.
            const response = await mcApiService.post(`/files/upload`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            uploadedFileUrls[key].push(response.data.url);
          }
        }
      }

      const submittedAt = new Date().toISOString();
      let finalScore = 0;

      const responses: ResponseItem[] = Object.entries(answers).map(([questionId, answerData]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        let answer = answerData.value;
        const comment = answerData.comment;
        const attachments = uploadedFileUrls[parseInt(questionId)];

        if (question?.type === 'dual-response-date' && typeof answer === 'object' && answer !== null) {
          const answerCopy = JSON.parse(JSON.stringify(answer));
          const mainFiles = uploadedFileUrls[`${questionId}_main`];
          const subFiles = uploadedFileUrls[`${questionId}_sub`];

          if (mainFiles && answerCopy.main_contractor) {
            answerCopy.main_contractor.files = mainFiles;
          }
          if (subFiles && answerCopy.sub_contractor) {
            answerCopy.sub_contractor.files = subFiles;
          }
          answer = answerCopy;
        }

        let score = 0;
        if (question?.type !== 'dual-response-date' && typeof answer === 'string') {
          const optionIndex = question?.options?.indexOf(answer) ?? -1;
          if (optionIndex >= 0) {
            score = question?.scoreType === "S"
              ? optionIndex + 1
              : 5 - optionIndex;
            finalScore += score;
          }
        }

        const responsePayload: any = { value: answer };
        if (comment) responsePayload.comment = comment;
        if (attachments && attachments.length > 0) responsePayload.attachments = attachments;

        return {
          question: question?.text || "Unknown question",
          response: (comment || (attachments && attachments.length > 0)) ? responsePayload : answer,
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
      setFiles({});
      router.push(`./thank-you?finalScore=${finalScore}`);

    } catch (error) {
      console.error("Error submitting responses:", error);
      alert("There was an error submitting your assessment. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnswer = (questionId: number, value: string | object) => {
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

  const handleFilesChange = (questionId: string | number, files: File[]) => {
    setFiles(prev => ({
      ...prev,
      [questionId]: files
    }));
  };

  const handleStartAssessment = () => {
    setShowIntro(false);
  };

  const handleNextPage = () => {
    if (currentPage < sections.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getGlobalQuestionIndex = () => {
    let index = 0;
    for (let i = 0; i < currentPage; i++) {
      if (sections[i][0] === 'Project Information') {
        index += sections[i][1].length;
      }
    }
    return index;
  };

  const handleHistoryClick = (question: any) => {
    setSelectedHistoryQuestion({ id: question.id, text: question.text });
    setHistoryOpen(true);
  };

  const handleExport = () => {
    exportToExcel(questions, answers, `Assessment_${slug || 'export'}.xlsx`);
  };

  const renderCurrentSection = (globalIndex: number) => {
    if (sections.length === 0) return null;

    const [sectionName, sectionQuestions] = sections[currentPage];

    if (sectionName === "Signatures") {
      return (
        <SignaturesSection
          questions={sectionQuestions}
          answers={answers}
          onAnswer={handleAnswer}
        />
      );
    }

    // Card View Rendering
    return (
      <div className="space-y-6">
        {sectionName !== "General" && (
          <div className="p-6 bg-white rounded-lg border-t-8 border-primary shadow-sm">
            <h2 className="text-3xl font-semibold text-gray-800">{sectionName}</h2>
          </div>
        )}
        {sectionQuestions.map((question, index) => {
          const questionPrefix =
            sectionName === 'Project Information'
              ? `${globalIndex + index + 1}.`
              : `${String.fromCharCode(97 + index)}.`;

          return (
            <Card key={question.id} className="overflow-hidden shadow-sm relative group">
              <CardContent className="p-6">
                {/* Floating History Button for Card View */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground bg-secondary/20 hover:bg-secondary/50 rounded-full"
                  onClick={() => handleHistoryClick(question)}
                  title="View History"
                >
                  <History className="h-4 w-4" />
                </Button>
                {renderQuestion(question, questionPrefix)}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderQuestion = (question: any, prefix: string) => {
    const answer = answers[question.id];
    const questionFiles = files[question.id];
    const questionFileUrls = fileObjectUrls[question.id];
    const isRequired = !question.optional;

    const commonProps: any = {
      question: `${prefix} ${question.text}`,
      value: answer?.value,
      files: questionFiles,
      fileUrls: questionFileUrls,
      onFilesChange: (files: File[]) => handleFilesChange(question.id, files),
      required: isRequired,
    };

    switch (question.type) {
      case "multiple-choice":
        return <MultipleChoice {...commonProps} options={question.options || []} onChange={(val) => handleAnswer(question.id, val)} />;
      case "number":
        return <NumberInput {...commonProps} onChange={(val) => handleAnswer(question.id, val)} />;
      case "short-answer":
        return <ShortAnswer {...commonProps} onChange={(val) => handleAnswer(question.id, val)} />;
      case "radio":
        return <RadioQuestion {...commonProps} options={question.options || []} onChange={(val) => handleAnswer(question.id, val)} />;
      case "dropdown":
        return <Dropdown {...commonProps} options={question.options || []} onChange={(val) => handleAnswer(question.id, val)} />;
      case "date":
        return <DateQuestion {...commonProps} onChange={(val) => handleAnswer(question.id, val)} />;
      case "check-method":
        return <CheckMethod {...commonProps} options={question.options || []} onChange={(val) => handleAnswer(question.id, val)} />;
      case "dual-response-date":
        return (
          <DualResponseDate
            {...commonProps}
            files={{ main: files[`${question.id}_main`] || [], sub: files[`${question.id}_sub`] || [] }}
            fileUrls={{ main: fileObjectUrls[`${question.id}_main`] || [], sub: fileObjectUrls[`${question.id}_sub`] || [] }}
            onMainFilesChange={(files: File[]) => handleFilesChange(`${question.id}_main`, files)}
            onSubFilesChange={(files: File[]) => handleFilesChange(`${question.id}_sub`, files)}
            onChange={(val) => handleAnswer(question.id, val)}
          />
        );
      default:
        return null;
    }
  };

  // Determine current section properties
  const currentSectionName = sections.length > 0 ? sections[currentPage][0] : "";
  const effectiveViewMode = (currentSectionName === "Project Information" || currentSectionName === "Signatures") ? "card" : viewMode;

  // Calculate progress
  const progress = sections.length > 0 ? ((currentPage + 1) / sections.length) * 100 : 0;

  // Prepare data for rendering
  const globalQuestionIndex = sections.length > 0 ? getGlobalQuestionIndex() : 0;
  const currentSectionQuestions = sections.length > 0 ? sections[currentPage][1] : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-background">
      <FormHeader
        showProgress={!showIntro}
        progress={progress}
        showViewToggle={!showIntro && currentSectionName !== "Project Information" && currentSectionName !== "Signatures"}
        viewMode={effectiveViewMode}
        onViewModeChange={setViewMode}
        onMenuClick={!showIntro ? () => setSectionsOpen(true) : undefined}
        onExportClick={!showIntro ? handleExport : undefined}
      />

      <FormSidebar
        sections={sidebarSections}
        currentPage={currentPage}
        onSectionClick={handleSectionClick}
        open={sectionsOpen}
        onOpenChange={setSectionsOpen}
      />

      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1 flex gap-6 lg:justify-center">
          {!showIntro && (
            <DesktopSidebar
              sections={sidebarSections}
              currentPage={currentPage}
              onSectionClick={handleSectionClick}
            />
          )}

          <div className={cn("flex-1 flex flex-col min-w-0 transition-all", !showIntro && "max-w-4xl")}>
            {showIntro ? (
              <div className="flex-1 flex items-center justify-center">
                <IntroPage onStart={handleStartAssessment} />
              </div>
            ) : (
              <>
                {/* Toggle removed from here, moved to Header */}

                <div ref={topOfFormRef} className="space-y-8">
                  {effectiveViewMode === 'card' ? renderCurrentSection(globalQuestionIndex) : (
                    <ExcelChecklistLayout
                      questions={currentSectionQuestions}
                      answers={answers}
                      files={files}
                      fileUrls={fileObjectUrls}
                      onAnswer={handleAnswer}
                      onCommentChange={handleCommentChange}
                      onFilesChange={handleFilesChange}
                      globalStartIndex={globalQuestionIndex}
                    />
                  )}
                </div>

                <div className="mt-8 flex justify-between items-center">
                  {currentPage > 0 && (
                    <Button onClick={handlePrevPage} variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  <div />
                  <div className="flex gap-2">
                    <Button onClick={() => saveToLocalStorage({ answers, showIntro })} variant="outline">
                      Save
                      <Save className="h-4 w-4 ml-2" />
                    </Button>
                    {currentPage < sections.length - 1 ? (
                      <Button onClick={handleNextPage}>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowSubmitConfirmation(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                        disabled={isUploading}
                      >
                        {isUploading ? "Submitting..." : "Submit"}
                        {!isUploading && <Send className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <FormFooter />

      {/* Individual Question History Drawer */}
      {selectedHistoryQuestion && (
        <QuestionHistoryDrawer
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          questionText={selectedHistoryQuestion.text}
        />
      )}

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
