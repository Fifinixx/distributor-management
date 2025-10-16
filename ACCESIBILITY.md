# Accessibility Implementation (WCAG 2.1 AA)

This document outlines how accessibility principles were applied in the **Distributor Management System** project.

---

### 1. 1.3.1 Info and Relationships
- Used semantic HTML tags such as `<header>`, `<main>`, `<section>`, and `<nav>` to provide clear structure to assistive technologies.

### 2. 1.4.3 Contrast (Minimum)
- Implemented dark/light mode using **ShadCN UI**’s theming system.
- Ensured text and background contrast ratios meet WCAG AA guidelines.

### 3. 2.1.1 Keyboard
- All interactive components (buttons, dropdowns, modals) are keyboard accessible by default through Radix UI primitives.
- Users can navigate the interface entirely using the `Tab` and `Enter` keys.

### 4. 2.4.3 Focus Order
- Used built-in focus management from ShadCN/Radix UI for dialogs and drawers.
- Focus is automatically set on active components when opening modals or changing views.

### 5. 3.3.2 Labels or Instructions
- All form inputs include accessible `<Label>` elements provided by ShadCN UI components.

### 6. 4.1.2 Name, Role, Value
- Leveraged Radix UI components that include proper ARIA attributes (`role="dialog"`, `aria-expanded`, etc.), ensuring compatibility with screen readers.

### 7. 1.4.11 Non-text Contrast
- The dark mode design respects the user’s system `prefers-color-scheme`.
- Sufficient non-text contrast for borders, focus outlines, and icons.

---

**Tools & Frameworks:**
- React
- React Router
- Tailwind CSS
- ShadCN UI (Radix primitives for accessible components)
- NodeJS
- ExpressJS
- Mongoose
- MongoDB

