export const wellbeingQuestions = [
  {
    id: 1,
    text: "This is a sample super-user question. How are you feeling?",
    type: "radio",
    options: ["Great", "Good", "Okay", "Bad"],
    scoreType: "S",
    section: "Wellbeing",
    optional: false,
  },
  {
    id: 2,
    text: "This is another sample question.",
    type: "short-answer",
    section: "Feedback",
    optional: true,
  },
  {
    id: 3,
    text: "This is a dropdown question.",
    type: "dropdown",
    options: ["Option 1", "Option 2", "Option 3"],
    section: "Feedback",
    optional: false,
  },
];
