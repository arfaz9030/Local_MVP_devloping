# CrickHero Frontend Theme & Design Token Rules (System Prompt)

## Theme-First Development

Whenever generating any React Native frontend code for CrickHero, always use the project's centralized design tokens.

Never hardcode UI values when an existing design token should be used.

---

## Folder Structure

Assume the project contains:

```
src/
 ├── theme/
 │    ├── colors.ts
 │    ├── typography.ts
 │    ├── spacing.ts
 │    ├── radius.ts
 │    └── elevation.ts (future)
```

Import only the files required by the current screen.

Example:

```ts
import { COLORS } from '@/src/theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '@/src/theme/typography';
import { SPACING } from '@/src/theme/spacing';
import { RADIUS } from '@/src/theme/radius';
```

Use the project's configured import alias if available.

---

# Colors

Never write:

```ts
backgroundColor: '#FFFFFF'
```

Instead use

```ts
backgroundColor: COLORS.background
```

Never generate hardcoded:

* background colors
* text colors
* border colors
* button colors
* placeholder colors
* error colors

Always use COLORS.

If a required color does not exist:

1. Reuse an existing semantic color if appropriate.
2. Otherwise recommend adding one to colors.ts.
3. Never invent duplicate colors.

---

# Typography

Never hardcode:

```ts
fontSize: 16
fontWeight: '700'
```

Instead use

```ts
fontSize: FONT_SIZE.md
fontWeight: FONT_WEIGHT.bold
```

Prefer semantic names over numeric values.

---

# Spacing

Never hardcode repeated spacing values.

Instead use

```ts
padding: SPACING.md
marginTop: SPACING.lg
paddingHorizontal: SPACING.lg
```

Only introduce a new spacing token if an uncommon value is genuinely required across the project.

---

# Border Radius

Never hardcode repeated radius values.

Use

```ts
borderRadius: RADIUS.sm
borderRadius: RADIUS.md
borderRadius: RADIUS.lg
```

---

# Elevation

If elevation or shadows are required, use centralized elevation tokens.

Never duplicate shadow styles across screens.

---

# Styling Rules

Always use:

```ts
StyleSheet.create()
```

Avoid inline styles unless React Native requires them.

---

# Reusable Components

Before creating a reusable component ask internally:

Has this UI pattern appeared at least three times?

If NO

Keep it inside the screen.

If YES

Extract it into

```
src/components/
```

Do not create reusable components prematurely.

---

# Screen Responsibilities

Screens should:

* Compose UI
* Handle navigation
* Call hooks
* Call services

Screens must NOT:

* Call fetch directly
* Contain business logic
* Duplicate validation logic

---

# Theme Consistency

Every generated screen should visually match existing screens.

Maintain consistent:

* spacing
* typography
* button styling
* border radius
* card styling
* loading states
* validation styling

Never introduce a new visual style unless explicitly requested.

---

# Production Rules

Generate code that:

* Compiles without TypeScript errors.
* Works with Expo Router.
* Uses React Native Paper when appropriate.
* Uses strict TypeScript.
* Preserves existing project architecture.
* Makes the smallest safe change necessary.
* Does not rewrite unrelated files.

---

# Official Documentation Rule

Whenever generating, explaining, or reviewing frontend code:

If there is any uncertainty regarding:

* JavaScript
* TypeScript
* React
* React Native
* Expo
* Expo Router
* React Native Paper

Base the explanation and generated code on the latest official documentation and APIs rather than model memory or assumptions.

If the project's documented standards differ from a library example, follow the project's standards unless explicitly instructed otherwise.

Do not invent APIs, props, hooks, navigation patterns, or component behavior.

---

# AI Output Strategy

When asked to modify an existing screen:

1. Preserve existing functionality.
2. Preserve navigation.
3. Preserve validation.
4. Preserve API calls.
5. Apply centralized design tokens.
6. Explain only the modified sections.
7. Avoid unnecessary refactoring.

The goal is to improve maintainability while minimizing risk during active MVP development.
