"use client";

import { use, useState, useMemo, useEffect } from "react";
import { useAuth, useProjectOrg } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProjects";
import { useAssessmentAssignments, useAssessments, useStartAssessment } from "@/hooks/useAssessments";
import { useUser, useUsersByProject } from "@/hooks/useUsers";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, MessageCircle, Mail, MoreHorizontal, FileText, Play } from "lucide-react";
import dynamic from "next/dynamic";

const UserLevelReport = dynamic(() => import("@/components/report/UserLevelReport"), { ssr: false });
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface Assignment {
  id?: string;
  assessmentId?: string;
  assessmentName: string;
  userName?: string;
  userId?: string;
  questionnaire?: {
    id: string;
    title: string;
    slug: string;
  };
  groupName?: string;
  status: string;
  startDate: string;
  endDate: string;
  submittedAt?: string;
  accessCode?: string;
  accessSecret?: string;
  responses?: any;
  hasStarted?: boolean;
}

export default function AssignmentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { user } = useAuth();
  const { orgId: currentOrgId } = useProjectOrg(projectId);
  
  // State for assessment filter
  const [selectedAssessmentScheduleId, setSelectedAssessmentScheduleId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  
  const { data: projectData, isLoading: projectLoading } = useProject(projectId, currentOrgId || undefined);
  const { data: assessmentSchedules } = useAssessments(projectId, currentOrgId || "");
  
  // Get all unique assessment schedules for the first dropdown
  const assessmentScheduleOptions = useMemo(() => {
    if (!assessmentSchedules) return [];
    
    const options = assessmentSchedules.map(schedule => ({
      id: schedule.id,
      title: schedule.title
    }));
    
    // Set the first assessment schedule as default if not already set
    if (options.length > 0 && selectedAssessmentScheduleId === null) {
      setSelectedAssessmentScheduleId(options[0].id);
    }
    
    return options;
  }, [assessmentSchedules, selectedAssessmentScheduleId]);

  // Get assessment instances for the selected schedule for the second dropdown
  const assessmentInstanceOptions = useMemo(() => {
    if (!assessmentSchedules || !selectedAssessmentScheduleId) return [];
    
    const selectedSchedule = assessmentSchedules.find(schedule => schedule.id === selectedAssessmentScheduleId);
    if (!selectedSchedule || !selectedSchedule.assessmentInstances) return [];
    
    const options = selectedSchedule.assessmentInstances.map(instance => ({
      id: instance.id,
      startDate: instance.startDate,
      title: new Date(instance.startDate).toLocaleDateString()
    }));
    
    return options;
  }, [assessmentSchedules, selectedAssessmentScheduleId]);

  // Auto-select first instance when schedule changes
  useEffect(() => {
    if (assessmentInstanceOptions.length > 0 && selectedAssessmentId === null) {
      setSelectedAssessmentId(assessmentInstanceOptions[0].id);
    }
  }, [assessmentInstanceOptions, selectedAssessmentId]);

  const { data: assignments, isLoading: assignmentsLoading, refetch } = useAssessmentAssignments(
    currentOrgId || "", 
    projectId,
    selectedAssessmentId ? { assessmentId: selectedAssessmentId } : undefined
  );
  const { data: projectUsers } = useUsersByProject(currentOrgId || "", projectId);
  const startAssessmentMutation = useStartAssessment();

  const projectName = projectData?.name || (projectLoading ? "Loading..." : "Unknown Project");

  // State for dialogs
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [currentResponses, setCurrentResponses] = useState<any[]>([]);
  const [currentAssessmentTitle, setCurrentAssessmentTitle] = useState<string>("");
  const [currentTotalScore, setCurrentTotalScore] = useState<number | null>(null);

  // UserLevelReport states
  const [showUserLevelReport, setShowUserLevelReport] = useState(false);
  const [userLevelReportResponses, setUserLevelReportResponses] = useState<any[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>("");

  // WhatsApp notification states
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [assignmentForWhatsApp, setAssignmentForWhatsApp] = useState<Assignment | null>(null);
  const [selectedProjectUserIdForWhatsApp, setSelectedProjectUserIdForWhatsApp] = useState<string | null>(null);

  // Fetch specific user details when needed for WhatsApp contacts
  const { data: selectedUserData, isLoading: isSelectedUserLoading } = useUser(
    currentOrgId || "",
    projectId,
    selectedProjectUserIdForWhatsApp || ""
  );

  const getStatusText = (status: string, assignment: Assignment) => {
    const today = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);
    
    if (status === "COMPLETED") {
      return "Completed";
    }
    
    if (today < startDate) {
      return "Not Started";
    }
    
    if (today > endDate) {
      return "Expired";
    }
    
    return "In Progress";
  };

  const handleStartAssessment = async (assessmentId: string, userId: string, assessmentName: string) => {
    if (!currentOrgId) {
      toast.error("Organization context required");
      return null;
    }

    try {
      const result = await startAssessmentMutation.mutateAsync({
        orgId: currentOrgId,
        projectId,
        assessmentInstanceId: assessmentId, // Use assessmentId from response as assessmentInstanceId for API
        userId
      });

      toast.success("Assessment started successfully");
      
      // Refresh assignments
      refetch();
      
      return result.assignment;
    } catch (error) {
      // Error handled by mutation
      return null;
    }
  };

  const sendWhatsAppMessage = (phoneNumber: string) => {
    if (!phoneNumber) {
      toast.error("No phone number provided.");
      return;
    }
    if (!assignmentForWhatsApp) {
      toast.error("No assignment context found.");
      return;
    }
  
    // Create the message with assignment details
    const accessUrl = assignmentForWhatsApp.accessCode && assignmentForWhatsApp.accessSecret 
      ? `${window.location.origin}/q?code=${assignmentForWhatsApp.accessCode}&key=${assignmentForWhatsApp.accessSecret}`
      : `${window.location.origin}/q`;

    const message = `Hi ${assignmentForWhatsApp.userName || 'there'},

You have a pending assessment: *${assignmentForWhatsApp.assessmentName || 'Assessment'}*

Please complete it at your earliest convenience using this link:
${accessUrl}

${assignmentForWhatsApp.startDate ? `Start Date: ${new Date(assignmentForWhatsApp.startDate).toLocaleDateString()}` : ''}
${assignmentForWhatsApp.endDate ? `End Date: ${new Date(assignmentForWhatsApp.endDate).toLocaleDateString()}` : ''}

Thank you!`;
  
    // Format phone number and open WhatsApp
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Cleanup
    setIsWhatsAppDialogOpen(false);
    setAssignmentForWhatsApp(null);
    setSelectedProjectUserIdForWhatsApp(null);
  };

  const handleWhatsAppNotification = async (assignment: Assignment) => {
    // Find the projectUser to get the projectUserId for the useUser hook
    const projectUser = projectUsers?.find(u => u.orgUser?.user?.id === assignment.userId);
    
    if (!projectUser || !projectUser.id) {
      toast.error("Could not find project user details to send notification.");
      return;
    }

    let assignmentToSend = assignment;

    // If no access codes exist, start the assessment first
    if (!assignment.accessCode || !assignment.accessSecret) {
      if (!assignment.assessmentId) {
        toast.error("Cannot start assessment - assessment ID missing.");
        return;
      }

      const startedAssignment = await handleStartAssessment(
        assignment.assessmentId, 
        assignment.userId!, 
        assignment.assessmentName
      );

      if (startedAssignment) {
        assignmentToSend = {
          ...assignment,
          accessCode: startedAssignment.accessCode,
          accessSecret: startedAssignment.accessSecret
        };
      } else {
        toast.error("Failed to start assessment. Cannot send WhatsApp notification.");
        return;
      }
    }
    
    setAssignmentForWhatsApp(assignmentToSend);
    setSelectedProjectUserIdForWhatsApp(projectUser.id); // Trigger the useUser fetch
    setIsWhatsAppDialogOpen(true); // Open the dialog
  };

  const handleEmailNotification = (assignment: Assignment) => {
    toast.info("Email notifications will be implemented soon.");
  };

  // Columns for Assignments
  const columns: ColumnDef<Assignment>[] = [
    {
      accessorKey: "userName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.userName || 'Unknown User'}</div>
      ),
    },
    {
      accessorKey: "assessmentName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Assessment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.assessmentName}</div>
          <div className="text-sm text-muted-foreground">{row.original.questionnaire?.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: "groupName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Group
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.groupName || 'N/A'}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{getStatusText(row.original.status, row.original)}</span>
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
    },
    {
      accessorKey: "submittedAt",
      header: "Submitted",
      cell: ({ row }) => 
        row.original.submittedAt 
          ? new Date(row.original.submittedAt).toLocaleDateString()
          : "Not submitted",
    },
    {
      accessorKey: "accessCode",
      header: "Access Code",
      cell: ({ row }) => (
        <span className="text-xs">{row.original.accessCode || 'N/A'}</span>
      ),
    },
    {
      accessorKey: "accessSecret",
      header: "Access Secret",
      cell: ({ row }) => (
        <span className="text-xs">{row.original.accessSecret || 'N/A'}</span>
      ),
    },
    {
      header: "Responses",
      cell: ({ row }) => {
        const assignment = row.original;
        const responses = row.original.responses;
        
        // If the user hasn't started the assessment, show disabled button
        if (!assignment.hasStarted || assignment.status === "NOT_STARTED") {
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="opacity-50 p-0 h-8 w-8"
                title="No responses yet"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                className="p-0 h-8 w-8 opacity-50"
                title="No report available"
                disabled
              >
                <FileText className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          );
        }
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const responsesArray = Array.isArray(assignment.responses) ? assignment.responses : [];
                
                // Find and set total score from the special "Final Score" object
                const finalScoreResponse = responsesArray.find((r: any) => r.question === "Final Score");
                if (finalScoreResponse && finalScoreResponse.response && typeof finalScoreResponse.response.score !== 'undefined') {
                  setCurrentTotalScore(parseInt(finalScoreResponse.response.score));
                } else {
                  setCurrentTotalScore(null);
                }

                setCurrentResponses(responsesArray);
                setCurrentAssessmentTitle(assignment.assessmentName || "Assessment");
                setIsResponseDialogOpen(true);
              }}
              title="View Responses"
              className="p-0 h-8 w-8"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {/* report icon */}
            <Button
              variant="ghost"
              className="p-0 h-8 w-8"
              title="View Report"
              onClick={() => {
                const responsesArray = Array.isArray(responses) ? responses : [];
                setUserLevelReportResponses(responsesArray);
                setCurrentAssessmentTitle(assignment.questionnaire?.slug || "");
                // Set the current user name from the assignment
                setCurrentUserName(assignment.userName || "Unknown User");
                setShowUserLevelReport(true);
              }}
            >
              <FileText className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const assignment = row.original;
        const hasStarted = assignment.accessCode && assignment.accessSecret;
        const isAvailable = new Date() >= new Date(assignment.startDate) && new Date() <= new Date(assignment.endDate);
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!hasStarted && (
                <DropdownMenuItem 
                  onClick={() => assignment.assessmentId && assignment.userId && 
                    handleStartAssessment(assignment.assessmentId, assignment.userId, assignment.assessmentName)}
                  disabled={!isAvailable || !assignment.assessmentId || !assignment.userId || startAssessmentMutation.isPending}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {startAssessmentMutation.isPending ? "Starting..." : "Start Assessment"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleWhatsAppNotification(assignment)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Send WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleEmailNotification(assignment)}
                disabled
                className="opacity-50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }
  ];

  if (projectLoading) {
    return (
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <div className="h-96 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 mx-auto max-w-[1440px]">
      {/* User Level Report Dialog */}
      {showUserLevelReport && (
        <UserLevelReport
          responses={userLevelReportResponses}
          assessmentName={currentAssessmentTitle}
          userName={currentUserName}
          onClose={() => setShowUserLevelReport(false)}
        />
      )}

      <div className="h-10"></div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{projectName} - All Assignments</h1>
        </div>
      </div>

      {/* Assessment Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="assessment-schedule-filter" className="text-sm font-medium">Assessment:</label>
          <Select 
            value={selectedAssessmentScheduleId || ""} 
            onValueChange={(value) => {
              setSelectedAssessmentScheduleId(value || null);
              setSelectedAssessmentId(null); // Reset instance selection when schedule changes
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select assessment..." />
            </SelectTrigger>
            <SelectContent>
              {assessmentScheduleOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="assessment-instance-filter" className="text-sm font-medium">Start Date:</label>
          <Select 
            value={selectedAssessmentId || ""} 
            onValueChange={(value) => setSelectedAssessmentId(value || null)}
            disabled={!selectedAssessmentScheduleId}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select date..." />
            </SelectTrigger>
            <SelectContent>
              {assessmentInstanceOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Direct table without card wrapper */}
      {!selectedAssessmentId ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          <p>Please select an assessment to view assignments.</p>
        </div>
      ) : assignmentsLoading ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          <p>Loading assignments...</p>
        </div>
      ) : !assignments || assignments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          <p>No assignments found for the selected assessment.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={assignments as Assignment[]} />
      )}

      {/* WhatsApp Send Options Dialog */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={(isOpen) => {
        setIsWhatsAppDialogOpen(isOpen);
        if (!isOpen) {
          setAssignmentForWhatsApp(null);
          setSelectedProjectUserIdForWhatsApp(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send WhatsApp Notification</DialogTitle>
            <DialogDescription>
              Choose a recipient for the assignment details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isSelectedUserLoading ? (
              <p>Loading user details...</p>
            ) : !selectedUserData ? (
              <p>Could not load user details.</p>
            ) : (
              <div className="space-y-3">
                {/* Student's Number */}
                {selectedUserData.mobile ? (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => sendWhatsAppMessage(selectedUserData.mobile!)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Send to Student: {selectedUserData.name}</span>
                      <span className="text-gray-600">{selectedUserData.mobile}</span>
                    </div>
                  </Button>
                ) : (
                  <div className="p-3 border rounded-md text-sm text-gray-500">
                    Student's phone number is not available.
                  </div>
                )}
                
                {/* Alternate Contacts */}
                {selectedUserData.alternateContacts && selectedUserData.alternateContacts.length > 0 ? (
                  selectedUserData.alternateContacts.map((altContact: { 
                    id: string; 
                    relationship?: string; 
                    contact: { 
                      name: string; 
                      extras?: { 
                        mobile?: string 
                      } 
                    } 
                  }) => (
                    <Button 
                      key={altContact.id} 
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => sendWhatsAppMessage(altContact.contact.extras?.mobile || "")}
                      disabled={!altContact.contact.extras?.mobile}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Send to {altContact.relationship || 'Parent'}: {altContact.contact.name}</span>
                        <span className="text-gray-600">{altContact.contact.extras?.mobile || 'No phone number'}</span>
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="p-3 border rounded-md text-sm text-gray-500">
                    No alternate contacts found for this user.
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsWhatsAppDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assessment Responses - {currentAssessmentTitle}</DialogTitle>
            {currentTotalScore !== null && (
              <p className="text-lg font-semibold mt-2">Total score = {currentTotalScore}</p>
            )}
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto p-4">
            {currentResponses.length > 0 ? (
              currentResponses
                .filter((item: any) => item.question !== "Final Score") // Filter out the score object
                .map((item: any, index: number) => (
                  <div key={index} className="border-b pb-2">
                    <p className="font-medium text-sm text-gray-700 mb-1">Q: {item.question}</p>
                    <p className="text-sm">A: {item.response}</p>
                  </div>
                ))
            ) : (
              <p>No Responses</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}