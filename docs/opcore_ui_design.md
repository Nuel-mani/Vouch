# OpCore UI Design System: "Lagos Blue"

## Core Philosophy
OpCore's design language, **"Lagos Blue"**, serves two distinct masters:
1.  **The Professional**: Reliable, high-contrast, data-dense interfaces for business management.
2.  **The Modern User**: Friendly, approachable, and "Apple-like" simplicity for complex tax tasks.

## Color Palette
### Primary Colors
-   **Lagos Blue (`#0F172A` - Slate 900)**: The deep, authoritative background color. Used for sidebars, hero sections, and high-level navigation. Represents stability.
-   **Electric Indigo (`#6366F1` - Indigo 500)**: The primary action color. Used for buttons, active states, and call-to-actions. Represents modern tech.

### Functional Colors
-   **Success Green (`#22C55E`)**: "Tax Compliant", "Income", "Paid".
-   **Warning Amber (`#F59E0B`)**: "Approaching Threshold", "Pending".
-   **Error Red (`#EF4444`)**: "Non-Compliant", "Expense", "Overdue".

## Layout Patterns
### 1. The Split-Screen Auth (Hero Pattern)
**Usage:** Login, Register, Onboarding.
-   **Left/Top Panel (Primary Brand)**: Deep Blue background (#0F172A) with a subtle grid overlay. Contains the Value Prop (Testimonial or Benefit List).
-   **Right/Bottom Panel (Action)**: Clean white/light background. Contains the Form.
-   **Mobile behavior**: Stacks vertically. The Brand Panel becomes a condensed header. The Form takes 80% of vertical space.

### 2. The Dashboard Grid
**Usage:** Main App Interfaces.
-   **Sidebar**: Fixed, dark mode (Lagos Blue). Contains navigation.
-   **Top Bar**: White, sticky. Contains "Threshold Monitor" (Personal) or "Global Actions" (Business).
-   **Card Grid**: Content is organized in white, rounded-corner cards (`rounded-2xl`) with subtle shadows (`shadow-sm`).

## Typography
-   **Font Family**: Inter (Google Fonts) or system-ui.
-   **Hierarchy**:
    -   `h1` (Page Titles): Bold, Tight Tracking.
    -   `h2` (Section Headers): Semi-Bold.
    -   `p` (Body): Regular, Slate-600 color for readability.
    -   `label`: Medium weight, Slate-700.

## Components
### Input Fields
-   **Style**: "Floating Label" or Top-aligned labels.
-   **State**: Gray border (`border-slate-200`) default. Indigo ring (`ring-2 ring-indigo-500`) on focus.
-   **Mobile**: 44px min-height for touch targets.

### Buttons
-   **Primary**: Gradient Blue-to-Indigo. Rounded-xl. `w-full` on mobile.
-   **Secondary**: White background, gray border, dark text.
-   **Ghost**: Transparent background, indigo text (for "Back" or "Cancel").

### The "Threshold Monitor"
A unique component for OpCore.
-   **Purpose**: Visualizes tax liability distance.
-   **Design**: A progress bar component sitting at the top of the dashboard.
-   **States**:
    -   **Safe (Blue)**: < 80% of threshold.
    -   **Warning (Amber)**: > 80% of threshold.
    -   **Critical (Red)**: Threshold exceeded.

## Mobile Responsiveness
-   **"Thumb Zone" Navigation**: Primary actions (Save, Next) should be easily reachable at the bottom of the screen.
-   **Hidden Complexity**: On mobile, simple views are default. Complex tables (like Advanced Ledger) use horizontal scrolling or "Card View" alternatives.
