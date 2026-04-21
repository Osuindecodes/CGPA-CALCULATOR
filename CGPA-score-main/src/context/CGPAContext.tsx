
import React, { createContext, useContext, useEffect, useReducer } from 'react';

// Define the types
export interface Course {
  id: string;
  name: string;
  creditUnits: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

interface CGPAState {
  courses: Course[];
  history: Array<Course[]>;
  historyIndex: number;
  darkMode: boolean;
}

type Action = 
  | { type: 'ADD_COURSE'; course: Course }
  | { type: 'REMOVE_COURSE'; id: string }
  | { type: 'UPDATE_COURSE'; course: Course }
  | { type: 'RESET_ALL' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'LOAD_STATE'; state: CGPAState };

// Initial state
const initialState: CGPAState = {
  courses: [],
  history: [[]],
  historyIndex: 0,
  darkMode: false,
};

// Grade points mapping
export const gradePoints = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 0,
};

// Reducer function
const cgpaReducer = (state: CGPAState, action: Action): CGPAState => {
  let newState: CGPAState;

  switch (action.type) {
    case 'ADD_COURSE':
      const newCourses = [...state.courses, action.course];
      newState = {
        ...state,
        courses: newCourses,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          newCourses,
        ],
        historyIndex: state.historyIndex + 1,
      };
      break;
    
    case 'REMOVE_COURSE':
      const filteredCourses = state.courses.filter(course => course.id !== action.id);
      newState = {
        ...state,
        courses: filteredCourses,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          filteredCourses,
        ],
        historyIndex: state.historyIndex + 1,
      };
      break;
    
    case 'UPDATE_COURSE':
      const updatedCourses = state.courses.map(course => 
        course.id === action.course.id ? action.course : course
      );
      newState = {
        ...state,
        courses: updatedCourses,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          updatedCourses,
        ],
        historyIndex: state.historyIndex + 1,
      };
      break;
    
    case 'RESET_ALL':
      newState = {
        ...state,
        courses: [],
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          [],
        ],
        historyIndex: state.historyIndex + 1,
      };
      break;
    
    case 'UNDO':
      if (state.historyIndex > 0) {
        newState = {
          ...state,
          historyIndex: state.historyIndex - 1,
          courses: state.history[state.historyIndex - 1],
        };
      } else {
        newState = state;
      }
      break;
    
    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        newState = {
          ...state,
          historyIndex: state.historyIndex + 1,
          courses: state.history[state.historyIndex + 1],
        };
      } else {
        newState = state;
      }
      break;
    
    case 'TOGGLE_DARK_MODE':
      newState = {
        ...state,
        darkMode: !state.darkMode,
      };
      break;
    
    case 'LOAD_STATE':
      newState = action.state;
      break;
    
    default:
      newState = state;
  }

  // Save to localStorage
  localStorage.setItem('cgpaState', JSON.stringify(newState));
  return newState;
};

// Create the context
interface CGPAContextType {
  state: CGPAState;
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
  updateCourse: (course: Course) => void;
  resetAll: () => void;
  undo: () => void;
  redo: () => void;
  toggleDarkMode: () => void;
  calculateCGPA: () => { totalCredits: number; totalPoints: number; cgpa: number };
  canUndo: boolean;
  canRedo: boolean;
}

const CGPAContext = createContext<CGPAContextType | undefined>(undefined);

// Provider component
export const CGPAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cgpaReducer, initialState);

  useEffect(() => {
    // Load from localStorage on component mount
    try {
      const savedState = localStorage.getItem('cgpaState');
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', state: JSON.parse(savedState) });
      }

      // Set dark mode based on saved preference or system preference
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }, []);

  // Update dark mode class when state.darkMode changes
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Calculate CGPA
  const calculateCGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    state.courses.forEach(course => {
      totalCredits += course.creditUnits;
      totalPoints += course.creditUnits * gradePoints[course.grade];
    });

    const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    return {
      totalCredits,
      totalPoints,
      cgpa: parseFloat(cgpa.toFixed(2)),
    };
  };

  const value = {
    state,
    addCourse: (course: Course) => dispatch({ type: 'ADD_COURSE', course }),
    removeCourse: (id: string) => dispatch({ type: 'REMOVE_COURSE', id }),
    updateCourse: (course: Course) => dispatch({ type: 'UPDATE_COURSE', course }),
    resetAll: () => dispatch({ type: 'RESET_ALL' }),
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    toggleDarkMode: () => dispatch({ type: 'TOGGLE_DARK_MODE' }),
    calculateCGPA,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  };

  return (
    <CGPAContext.Provider value={value}>
      {children}
    </CGPAContext.Provider>
  );
};

// Custom hook to use the CGPA context
export const useCGPA = () => {
  const context = useContext(CGPAContext);
  if (context === undefined) {
    throw new Error('useCGPA must be used within a CGPAProvider');
  }
  return context;
};
