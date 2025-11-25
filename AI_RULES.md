# AI Rules for SiLapor Islam Application

This document outlines the technical stack and guidelines for developing the SiLapor Islam application. Adhering to these rules ensures consistency, maintainability, and alignment with the project's architectural vision.

## 🚀 Tech Stack Overview

1.  **Frontend Framework:** React 18 with TypeScript for building dynamic user interfaces.
2.  **Styling:** Tailwind CSS for utility-first styling, ensuring a responsive and modern design.
3.  **Icons:** Lucide React for a consistent and scalable icon set.
4.  **Build Tool:** Vite for a fast development experience and optimized production builds.
5.  **Google API Integration:** Custom `GoogleService` utilizing `googleapis` and `gapi-script` for seamless integration with Google Drive and Google Sheets.
6.  **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) for managing component-level and application-wide state.
7.  **Routing:** React Router for declarative navigation within the application (to be implemented in `src/App.tsx`).
8.  **UI Components:** shadcn/ui for pre-built, accessible, and customizable UI components.
9.  **Client-side Data Persistence:** LocalStorage for simple, temporary data storage.

## 📚 Library Usage Guidelines

*   **React & TypeScript:**
    *   Always use React functional components with TypeScript for type safety.
    *   Leverage React Hooks for state management and side effects.
    *   Prioritize creating small, focused components, ideally under 100 lines of code.
    *   Create a new file for every new component or hook.

*   **Styling (Tailwind CSS):**
    *   All styling MUST be done using Tailwind CSS utility classes.
    *   Avoid inline styles or custom CSS files unless absolutely necessary for complex, non-Tailwind-achievable styles (which should be rare).
    *   Ensure designs are responsive across various screen sizes (desktop, tablet, mobile).

*   **Icons (Lucide React):**
    *   Use icons exclusively from the `lucide-react` library.
    *   Import icons directly from `lucide-react` as needed.

*   **UI Components (shadcn/ui):**
    *   For any new UI elements (buttons, forms, dialogs, cards, etc.), first check if a suitable component exists within the shadcn/ui library.
    *   Import and use shadcn/ui components directly. Do NOT modify the source files of shadcn/ui components; if customization is needed beyond props, create a wrapper component.
    *   If a required component is not available in shadcn/ui, create a custom component using Tailwind CSS.

*   **Routing (React Router):**
    *   Implement application routing using React Router.
    *   Define all main application routes within `src/App.tsx`.
    *   Ensure smooth navigation between different views (Dashboard, Create Report, Reports List, Analytics).

*   **Google API Integration (`src/services/googleService.ts`):**
    *   All interactions with Google Drive and Google Sheets must go through the `googleService` singleton instance defined in `src/services/googleService.ts`.
    *   Do not directly use `gapi` or `googleapis` in components; abstract these calls into `googleService`.
    *   Ensure proper error handling and user feedback for Google API operations.

*   **Client-side Storage (LocalStorage):**
    *   Use `localStorage` for persisting non-sensitive application data that needs to survive browser sessions (e.g., user preferences, draft reports).
    *   For sensitive data or complex state, consider server-side solutions (e.g., Supabase, if integrated).

*   **Code Structure:**
    *   `src/pages/`: For top-level views/pages of the application.
    *   `src/components/`: For reusable UI components.
    *   `src/services/`: For API integrations and business logic.
    *   `src/config/`: For application configurations (e.g., `googleConfig.ts`).
    *   Directory names MUST be all lower-case. File names may use mixed-case (e.g., `MyComponent.tsx`).

*   **General Principles:**
    *   **Simplicity & Elegance:** Avoid over-engineering. Implement features with the minimum necessary complexity.
    *   **Completeness:** All implemented features must be fully functional; no partial implementations or `TODO` comments for core functionality.
    *   **Responsiveness:** All new UI should be responsive by default.
    *   **Error Handling:** Allow errors to bubble up for central handling unless specific user-facing error messages are required.