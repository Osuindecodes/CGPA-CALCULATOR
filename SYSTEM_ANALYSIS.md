# System Analysis — CGPA Calculator

---

## 1. Introduction

The CGPA Calculator is a client-side web application designed to help university students compute their Grade Point Average (GPA) per semester and their Cumulative Grade Point Average (CGPA) across two semesters. The system eliminates the need for manual calculation, reduces human error, and provides instant academic performance feedback with export capabilities.

---

## 2. Objectives

- Allow students to input courses with their credit units and grades for Semester 1 and Semester 2.
- Automatically calculate GPA per semester and the overall CGPA.
- Classify the student's academic standing (First Class, Second Class Upper, etc.).
- Persist data across browser sessions without requiring a backend or login.
- Allow students to export their results as PDF or CSV for record-keeping.

---

## 3. Scope

The system covers:
- Course entry and management for two semesters.
- Real-time GPA and CGPA computation.
- Academic classification based on a 5-point grading scale.
- Data export (PDF and CSV).
- Undo/Redo history for course actions.
- Light and dark mode support.

The system does NOT cover:
- Multi-year or multi-level academic tracking (beyond 2 semesters).
- User authentication or cloud data storage.
- Institutional course catalogue integration.

---

## 4. System Architecture

The application is a Single Page Application (SPA) built entirely on the client side. There is no server, database, or API involved. All data lives in the browser.

```
┌─────────────────────────────────────────────┐
│                  Browser                    │
│                                             │
│  ┌──────────────┐    ┌─────────────────┐    │
│  │   React UI   │◄──►│  CGPAContext    │    │
│  │  Components  │    │  (useReducer)   │    │
│  └──────────────┘    └────────┬────────┘    │
│                               │             │
│                       ┌───────▼────────┐    │
│                       │  localStorage  │    │
│                       └────────────────┘    │
└─────────────────────────────────────────────┘
```

### Layers

| Layer | Technology | Responsibility |
|---|---|---|
| UI / View | React 18 + TypeScript | Renders components, handles user interaction |
| State Management | React Context + useReducer | Manages global app state and action dispatch |
| Persistence | Browser localStorage | Saves and restores state across sessions |
| Styling | Tailwind CSS + shadcn/ui | Visual design, theming, responsiveness |
| Export | jsPDF + jspdf-autotable | PDF generation |
| Routing | React Router DOM v6 | Page navigation |
| Build Tool | Vite | Development server and production bundling |

---

## 5. Functional Requirements

### 5.1 Course Management
- The student can add a course by providing: course name, credit units (1–9), and a grade (A–F).
- Each course is assigned to either Semester 1 or Semester 2 via a toggle selector.
- Courses can be individually removed from the list.
- All courses can be cleared at once using the Reset All function.

### 5.2 GPA / CGPA Calculation
- Semester GPA is calculated as:

  ```
  Semester GPA = Sum(Credit Units × Grade Points) / Sum(Credit Units)
  ```

- CGPA is calculated across all courses from both semesters:

  ```
  CGPA = Total Grade Points (all semesters) / Total Credit Units (all semesters)
  ```

- Calculations update in real time as courses are added or removed.

### 5.3 Grading Scale
The system uses a 5-point grading scale standard in Nigerian universities:

| Grade | Grade Points |
|---|---|
| A | 5.0 |
| B | 4.0 |
| C | 3.0 |
| D | 2.0 |
| E | 1.0 |
| F | 0.0 |

### 5.4 Academic Classification
| CGPA Range | Class |
|---|---|
| 4.5 – 5.0 | First Class |
| 3.5 – 4.49 | Second Class Upper |
| 2.5 – 3.49 | Second Class Lower |
| 1.5 – 2.49 | Third Class |
| 0.1 – 1.49 | Pass |
| 0.0 | N/A |

### 5.5 Data Export
- Export as PDF: generates a formatted report with a course table, summary, and CGPA formula.
- Export as CSV: generates a spreadsheet-compatible file with course data and summary rows.

### 5.6 Undo / Redo
- Every add, remove, or reset action is recorded in a history stack.
- The student can undo or redo up to any point in the session history.

### 5.7 Data Persistence
- The full application state (courses, semester, dark mode preference) is saved to localStorage automatically after every action.
- On next visit, the saved state is restored so no data is lost on page refresh.

---

## 6. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Performance | All calculations are synchronous and O(n) — instant for typical course loads |
| Usability | Fully responsive layout; works on mobile, tablet, and desktop |
| Accessibility | ARIA labels, aria-invalid attributes, and keyboard-navigable form controls |
| Reliability | Error boundary components prevent a single component crash from breaking the whole app |
| Offline Support | Fully functional without internet after first load (no external API calls) |
| Theming | Light and dark mode with persistent preference |

---

## 7. Component Breakdown

### Header
- Fixed to the top of the viewport on scroll.
- Contains: app title, Undo/Redo controls, Export CSV button, Reset All button, and dark mode toggle.
- Applies a frosted glass blur effect when the user scrolls down.

### CourseForm
- Input form for adding a new course.
- Semester 1 / Semester 2 toggle at the top determines which semester the course is added to.
- Validates all fields before submission (name required, credit units 1–9, grade required).
- Resets fields after a successful submission.

### CourseList
- Displays all added courses grouped into two sections: Semester 1 and Semester 2.
- Each section shows a live GPA badge when at least one course exists.
- Each course card shows the course name, credit units, grade, and a delete button.

### CGPASummary
- Displays Semester 1 GPA and Semester 2 GPA side by side.
- Shows total credit units and total grade points across all semesters.
- Displays the final CGPA prominently with the academic classification label.
- Contains the Export as PDF button.

### CGPAContext (State Layer)
- Central store for all application data.
- Uses useReducer for predictable state transitions.
- Exposes: addCourse, removeCourse, updateCourse, resetAll, undo, redo, setActiveSemester, calculateCGPA, calculateSemesterGPA.
- Automatically persists state to localStorage on every dispatch.

---

## 8. Data Model

### Course Object
```typescript
interface Course {
  id: string;          // Unique identifier (timestamp-based)
  name: string;        // Course title (max 50 characters)
  creditUnits: number; // Integer between 1 and 9
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  semester: 1 | 2;     // Which semester the course belongs to
}
```

### Application State
```typescript
interface CGPAState {
  courses: Course[];          // All courses across both semesters
  history: Array<Course[]>;   // Undo/Redo history stack
  historyIndex: number;       // Current position in history
  darkMode: boolean;          // UI theme preference
  activeSemester: 1 | 2;      // Currently selected semester in the form
}
```

---

## 9. Data Flow

```
User fills CourseForm
        │
        ▼
validateForm() runs
        │
   ┌────┴────┐
  Fail      Pass
   │         │
Show       dispatch ADD_COURSE
errors          │
                ▼
         cgpaReducer updates state
                │
                ▼
         localStorage updated
                │
                ▼
    React re-renders CourseList
    and CGPASummary with new data
```

---

## 10. Technology Stack Summary

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.5 | Type safety |
| Vite | 5.4 | Build tool and dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| shadcn/ui | — | Pre-built accessible UI components |
| Radix UI | Various | Headless accessible primitives |
| React Router DOM | 6.26 | Client-side routing |
| jsPDF | 2.5 | PDF generation |
| jspdf-autotable | 3.5 | Table rendering in PDF |
| Lucide React | 0.462 | Icon library |
| React Hook Form | 7.53 | (Available, not yet used in core flow) |
| Zod | 3.23 | (Available for schema validation) |

---

## 11. Limitations and Future Improvements

| Limitation | Suggested Improvement |
|---|---|
| Only 2 semesters supported | Extend to support multiple academic sessions/years |
| No user accounts | Add authentication and cloud sync (e.g., Supabase) |
| No course editing | Add inline edit functionality for existing courses |
| PDF uses hardcoded purple color | Update PDF theme to match the app's teal color scheme |
| No data backup warning | Warn users that clearing browser data will erase their records |
| CSV does not include semester column | Add semester column to CSV export |

---

## 12. Conclusion

The CGPA Calculator is a lightweight, fully client-side academic tool built with modern web technologies. It provides students with an intuitive interface to manage their courses across two semesters, compute accurate GPA and CGPA values, and export professional reports. The use of React Context with useReducer ensures a clean and maintainable state architecture, while localStorage persistence guarantees data is not lost between sessions. The system is well-suited for students following a 5-point grading scale, particularly within the Nigerian university system.
