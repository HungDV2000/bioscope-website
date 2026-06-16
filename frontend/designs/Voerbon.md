# Design System Inspired by Voerbon

## 1. Visual Theme & Atmosphere

Voerbon embodies a warm, mindful wellness aesthetic grounded in natural earth tones and organic imagery. The design system balances serene, contemplative elements with modern digital sophistication. Rich terracotta, burnt orange, and deep burgundy gradients evoke autumn landscapes and natural elements—candles, crystals, and botanical products. The visual language prioritizes spaciousness, elegant typography, and premium product presentation. This is a luxury wellness brand that feels both aspirational and approachable, combining minimalist UI patterns with lush, immersive hero imagery. The overall atmosphere is calm, curated, and deeply intentional.

**Key Characteristics**
- Warm earth-tone color palette dominated by rust, amber, and deep burgundy
- Minimal, refined interface with generous whitespace
- Elegant serif and sans-serif typography pairings
- Immersive hero imagery with subtle gradients
- Premium, handcrafted product positioning
- Accessible navigation with intuitive hierarchies

## 2. Color Palette & Roles

### Primary
- **Deep Navy** (`#20303C`): Primary text, UI structure, body copy, and dominant interface elements. Used extensively throughout navigation and content areas.
- **Electric Violet** (`#3910ED`): Primary call-to-action buttons, key interactive states, and premium accent highlighting.

### Accent Colors
- **Bright Blue** (`#0000EE`): Secondary link text and accent underlines for navigation items.
- **Near-Black** (`#000624`): Deep shadow text, emphasis on critical information, alternative primary text role.

### Interactive
- **Violet CTA** (`#3910ED`): Button backgrounds for primary actions, hover state intensity increases.
- **Blue Link** (`#0000EE`): Hyperlink text color, maintains web accessibility standards.

### Neutral Scale
- **White** (`#FFFFFF`): Primary background, card surfaces, text on dark backgrounds.
- **Black** (`#000000`): Secondary text, borders, icon strokes, alternative text hierarchy.
- **Off-White** (`#F9FAFA`): Subtle background tint for secondary sections, minimal contrast alternative to pure white.
- **Light Gray** (`#F0F1F5`): Background for form inputs, low-contrast UI zones, disabled states.

### Surface & Borders
- **White** (`#FFFFFF`): Card and container backgrounds, primary surface layer.
- **Light Gray** (`#F0F1F5`): Subtle divider lines, input field backgrounds, secondary surface differentiation.

## 3. Typography Rules

### Font Family
- **Primary Font**: Madefor (fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif) — Modern, elegant sans-serif for headings, body, and UI text.
- **Secondary Font**: Arial (fallback: sans-serif) — Utility font for buttons and compact UI labels.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| Display / Hero | Madefor | 56px | 300 | 64px | 0px | Large brand statement text, hero headlines |
| Heading 1 | Madefor | 42px | 400 | 52px | 0px | Primary page title, main section header |
| Heading 2 | Madefor | 32px | 400 | 40px | 0px | Subsection titles, card headers |
| Heading 3 | Madefor | 24px | 500 | 32px | 0px | Category labels, prominent UI text |
| Body | Madefor | 16px | 400 | 24px | 0px | Main content, product descriptions, navigation |
| Button / Small | Madefor | 16px | 500 | 20px | 0px | CTA text, button labels |
| Caption / Small Text | Madefor | 14px | 400 | 20px | 0px | Form labels, metadata, secondary information |
| Code / Monospace | Courier New | 12px | 400 | 16px | 0px | Technical text, pricing displays |

### Principles
- Madefor serves as the primary design font, creating a cohesive, premium brand voice across all interfaces.
- Line heights maintain generous vertical rhythm (1.5x–1.75x of font size) to ensure readability and spaciousness.
- Font weights are restrained: body text uses 400 (regular), headings use 400–500, avoiding visual clutter.
- Letter spacing remains at `0px` except in special branding contexts where optical adjustments are needed.
- All interactive text (buttons, links) use deliberate weight increases (500+) to signal actionability.

## 4. Component Stylings

### Buttons

**Primary Button (CTA)**
- Background: `#3910ED`
- Text Color: `#FFFFFF`
- Font: Madefor, 16px, weight 500
- Padding: `12px 24px`
- Border Radius: `81px`
- Border: `0px none`
- Box Shadow: `none`
- Height: `42px`
- Hover State: Background `#2A0ABD`, slight opacity increase to 0.95
- Active State: Background `#1F0880`, box-shadow `0px 4px 12px rgba(57, 16, 237, 0.3)`

**Secondary Button (Outline)**
- Background: `#FFFFFF`
- Text Color: `#3910ED`
- Font: Madefor, 16px, weight 400
- Padding: `12px 24px`
- Border Radius: `81px`
- Border: `2px solid #3910ED`
- Box Shadow: `none`
- Height: `42px`
- Hover State: Background `#F0F1F5`, Border `2px solid #2A0ABD`

**Ghost Button (Text-Only)**
- Background: `transparent`
- Text Color: `#3910ED`
- Font: Madefor, 16px, weight 400
- Padding: `8px 12px`
- Border Radius: `4px`
- Border: `0px none`
- Box Shadow: `none`
- Hover State: Background `rgba(57, 16, 237, 0.08)`, Text Color `#2A0ABD`

### Cards & Containers

**Standard Card**
- Background: `#FFFFFF`
- Border: `1px solid #F0F1F5`
- Border Radius: `8px`
- Padding: `28px`
- Box Shadow: `0px 2px 8px rgba(32, 48, 60, 0.08)`
- Hover State: Box Shadow `0px 4px 16px rgba(32, 48, 60, 0.12)`

**Product Card**
- Background: `#FFFFFF`
- Border: `1px solid #F0F1F5`
- Border Radius: `8px`
- Padding: `16px`
- Box Shadow: `none`
- Image Container: Border Radius `6px`, overflow hidden
- Hover State: Transform scale(1.02), Box Shadow `0px 8px 24px rgba(32, 48, 60, 0.15)`

**Hero Section Container**
- Background: Linear gradient overlay on image, from `rgba(32, 48, 60, 0.3)` to `rgba(139, 69, 19, 0.4)`
- Padding: `64px 32px`
- Min Height: `600px`
- Text Color: `#FFFFFF`

### Inputs & Forms

**Text Input**
- Background: `#F0F1F5`
- Border: `1px solid #E0E1E5`
- Border Radius: `4px`
- Padding: `12px 16px`
- Font: Madefor, 16px, weight 400
- Text Color: `#20303C`
- Placeholder Color: `rgba(32, 48, 60, 0.5)`
- Focus State: Border `2px solid #3910ED`, Box Shadow `0px 0px 0px 3px rgba(57, 16, 237, 0.1)`

**Search Input**
- Background: `#FFFFFF`
- Border: `2px solid #E0E1E5`
- Border Radius: `24px`
- Padding: `10px 16px`
- Font: Madefor, 14px, weight 400
- Text Color: `#20303C`
- Icon Color: `#20303C`
- Focus State: Border `2px solid #3910ED`

**Form Label**
- Font: Madefor, 14px, weight 500
- Text Color: `#20303C`
- Margin Bottom: `8px`

### Navigation

**Top Navigation Bar**
- Background: `#FFFFFF`
- Border Bottom: `1px solid #F0F1F5`
- Padding: `16px 32px`
- Height: `70px`
- Alignment: Flex, space-between

**Navigation Link**
- Font: Madefor, 16px, weight 400
- Text Color: `#20303C`
- Padding: `8px 16px`
- Hover State: Text Color `#3910ED`, Background `rgba(57, 16, 237, 0.08)`
- Active State: Text Color `#3910ED`, Border Bottom `2px solid #3910ED`

**Mobile Menu Toggle**
- Background: `transparent`
- Border: `0px none`
- Icon Color: `#20303C`
- Padding: `8px`
- Height: `40px`, Width: `40px`
- Hover State: Background `rgba(32, 48, 60, 0.08)`

### Badges

**Status Badge (Success)**
- Background: `#E8F5E9`
- Text Color: `#2E7D32`
- Font: Madefor, 12px, weight 500
- Padding: `4px 12px`
- Border Radius: `12px`

**Status Badge (Sale)**
- Background: `#FFF3E0`
- Text Color: `#E65100`
- Font: Madefor, 12px, weight 600
- Padding: `6px 12px`
- Border Radius: `4px`

## 5. Layout Principles

### Spacing System
- **Base Unit**: `8px`
- **Scale**: 8px, 16px, 24px, 32px, 48px, 64px, 96px
- **Common Usage**:
  - `16px`: Padding in cards, space between form elements
  - `24px`: Padding in standard containers
  - `28px`: Premium card padding
  - `32px`: Section gaps, container padding
  - `48px`: Major section spacing
  - `64px`: Hero section and full-width padding

### Grid & Container
- **Max Width**: `1440px`
- **Breakpoint Container**: 100% width up to max width, centered with auto margin
- **Column Strategy**: 12-column grid for desktop layouts
- **Section Patterns**: Alternating left-right content stacks, full-width hero sections, centered content blocks with 3–4 column product grids
- **Padding**: 32px on desktop, 24px on tablet, 16px on mobile

### Whitespace Philosophy
Voerbon embraces generous whitespace as a luxury design principle. Empty space around content signals quality and intentionality. Section separations use consistent 48–64px vertical gaps. Cards and containers maintain 16–28px internal padding. Navigation and footer use aligned padding with content areas. This approach prevents visual overwhelm and reinforces the brand's calm, mindful aesthetic.

### Border Radius Scale
- `0px`: Default for body text and content blocks
- `4px`: Input fields, subtle card corners, small badges
- `6px`: Product image containers, secondary cards
- `8px`: Primary card containers, modal windows
- `24px`: Button secondary states, pill-shaped UI elements
- `81px`: Fully rounded pill buttons (CTA primary style)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base (0) | No shadow | Content area backgrounds, flat text |
| Elevation 1 | `0px 2px 8px rgba(32, 48, 60, 0.08)` | Standard cards, container edges, subtle depth |
| Elevation 2 | `0px 4px 16px rgba(32, 48, 60, 0.12)` | Hovered cards, active states, moderate lift |
| Elevation 3 | `0px 8px 24px rgba(32, 48, 60, 0.15)` | Product cards on hover, dropdown menus, floating content |
| Elevation 4 | `0px 12px 32px rgba(32, 48, 60, 0.18)` | Modals, overlays, critical floating elements |

**Shadow Philosophy**: Voerbon uses minimal shadows that reinforce hierarchy without visual heaviness. Shadows are warm-toned (using the `#20303C` navy base) and maintain opacity ranges of 0.08–0.18 to integrate seamlessly with the neutral palette. Elevation increases subtly with interaction—hover states trigger a one-level shadow increase to signal interactivity. Modals and overlays use deeper shadows to establish modal context, but never extend beyond Elevation 4.

## 7. Do's and Don'ts

### Do
- Use `#3910ED` for all primary call-to-action buttons to maintain brand consistency.
- Apply generous whitespace (48–64px) between major content sections.
- Maintain Madefor as the primary font family across all UI surfaces.
- Implement border radius consistently: `4px` for inputs, `8px` for cards, `81px` for pill buttons.
- Use the full neutral scale; light gray backgrounds (`#F0F1F5`) signal secondary or disabled states.
- Stack responsive navigation into a hamburger menu below `768px`.
- Ensure all interactive elements have distinct hover states with opacity or color shifts.
- Test link contrast: blue (`#0000EE`) meets WCAG AA on white and light backgrounds.

### Don't
- Mix serif and decorative fonts with the core Madefor/Arial pair—maintain typographic discipline.
- Apply shadows deeper than Elevation 4 or use colored shadows outside the `#20303C` base.
- Use borders thicker than `2px` except for focus states.
- Reduce padding below `16px` on cards or containers—preserve the premium spaciousness.
- Deploy the violet accent (`#3910ED`) on more than 15% of a page—reserve it for actionable elements.
- Justify large blocks of body text; stick to left-align or center align for readability.
- Forget to disable interactive elements visually—use opacity `0.5` and cursor `not-allowed` for disabled states.
- Place critical information in light text on images without a semi-transparent overlay backdrop.

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Mobile | 320px – 767px | Single column layout, 16px padding, hamburger navigation, full-width cards, font sizes reduce 2–4px |
| Tablet | 768px – 1023px | Two-column grid, 24px padding, navigation condenses to icon+label, product grids 2 columns |
| Desktop | 1024px – 1440px | Full multi-column layout, 32px padding, navigation fully expanded, product grids 3–4 columns, hero 600px+ height |
| Large Desktop | 1440px+ | Max-width container `1440px` centered, padding remains 32px, layouts stable |

### Touch Targets
- Minimum interactive element size: `44px × 44px` (buttons, menu items, form controls).
- Buttons: `40–50px` height on mobile, `42px` on desktop.
- Navigation menu items: `48px` tap target spacing, 16px horizontal padding.
- Form inputs: `44px` minimum height on mobile for comfortable input.
- Icon buttons: `32px` icon inside `44px` container for thumb-friendly access.

### Collapsing Strategy
- **Hero Section**: Desktop full-width 600px height with large display text (56px). Tablet 400px height, text 42px, side padding `24px`. Mobile 300px height, text 28px, side padding `16px`.
- **Navigation**: Desktop horizontal navigation bar showing all links. Tablet shows abbreviated labels with icons. Mobile collapses to hamburger icon (`40px × 40px`) triggering vertical fullscreen menu overlay.
- **Product Grid**: Desktop 4 columns, tablet 2 columns, mobile 1 column. Card padding remains consistent (`16px`), images scale responsively.
- **Typography**: Heading 1 remains `42px` on desktop/tablet, reduces to `32px` on mobile. Body text stays `16px` desktop, `14px` on mobile. Maintains line height ratio (1.5x).
- **Spacing**: Section gaps `64px` on desktop, `48px` on tablet, `32px` on mobile. Card padding `28px` → `24px` → `16px` across breakpoints.

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA Button**: Electric Violet (`#3910ED`)
- **Background**: White (`#FFFFFF`)
- **Heading Text**: Deep Navy (`#20303C`)
- **Body Text**: Deep Navy (`#20303C`)
- **Link Text**: Bright Blue (`#0000EE`)
- **Secondary Background**: Off-White (`#F9FAFA`) or Light Gray (`#F0F1F5`)
- **Disabled/Subtle Elements**: Black (`#000000`) at reduced opacity (0.5)
- **Borders/Dividers**: Light Gray (`#F0F1F5`)

### Iteration Guide

1. **Color Application**: Deep Navy (`#20303C`) dominates text and UI structure. Reserve Electric Violet (`#3910ED`) exclusively for primary CTAs and hover states. All neutral backgrounds use the white/light gray pair.

2. **Typography Stack**: Madefor is the universal UI font; Arial is a fallback for button labels only. Line heights strictly follow the hierarchy table (16px body → `24px` line-height, 42px heading → `52px` line-height). No font sizes between table values without design review.

3. **Spacing Discipline**: Base unit is `8px`. All spacing and padding must be multiples of 8 (16px, 24px, 28px, 32px, etc.). Section gaps minimum `48px`. Card padding minimum `16px` internal.

4. **Border Radius Consistency**: Inputs and small elements use `4px`. Standard cards use `8px`. Pill buttons use `81px`. No custom radius values—stick to the scale.

5. **Shadow Hierarchy**: Elevation 1 (`0px 2px 8px rgba(32, 48, 60, 0.08)`) is the default card shadow. On hover, escalate to Elevation 2 or 3. Modals never exceed Elevation 4. All shadow color uses the navy base, never pure black.

6. **Responsive Breakpoints**: Desktop 1024px+, Tablet 768–1023px, Mobile 320–767px. Navigation transforms to hamburger below 768px. Product grids: 3–4 columns desktop, 2 tablet, 1 mobile. Hero height scales: 600px → 400px → 300px.

7. **Interaction Design**: Buttons show hover state with background color shift or opacity increase. Links underline on hover. All focus states include a `3px rgba(57, 16, 237, 0.1)` outline. Disabled states reduce opacity to 0.5 and set cursor `not-allowed`.

8. **Component Variants**: Primary button is violet pill (`#3910ED`, 81px radius). Secondary is outlined white (`#FFFFFF` background, violet border). Ghost is transparent text. Form inputs use light gray background (`#F0F1F5`) with navy text. Search inputs use white background with rounded corners (`24px` radius).

9. **Accessibility Baseline**: All text meets WCAG AA contrast ratios. Blue link text (`#0000EE`) provides sufficient contrast on white/light backgrounds. Focus states are always visible (outline or background change). Touch targets minimum `44px`. Do not rely on color alone for status communication—pair with icons or text labels.