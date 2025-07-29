# StudyFlow - Smart Study Timer with Rich Notes

StudyFlow is a productivity app that combines focused study sessions with powerful note-taking, helping students and professionals maximize their learning efficiency through timed sessions and organized knowledge capture.

**Experience Qualities**:
1. **Focused** - Minimal distractions during study sessions with clean, purposeful interface
2. **Intuitive** - Natural flow from timer setup to note-taking without cognitive overhead
3. **Empowering** - Rich tools for capturing and organizing thoughts without overwhelming complexity

**Complexity Level**: Light Application (multiple features with basic state)
- Combines timer functionality with rich text editing and session management, requiring coordinated state management across multiple features while remaining focused on core study workflow.

## Essential Features

### Configurable Study Timer
- **Functionality**: Adjustable session duration with visual countdown and audio notifications
- **Purpose**: Enforces focused study periods using proven time management techniques
- **Trigger**: User sets duration in settings and starts new session
- **Progression**: Settings → Topic selection → Timer countdown → Automatic transition to notes
- **Success criteria**: Timer runs accurately, provides clear visual feedback, and transitions smoothly

### Topic & Subtopic Tagging
- **Functionality**: Categorize each study session with hierarchical tags
- **Purpose**: Organizes sessions for review and tracks learning across subjects
- **Trigger**: Required step before starting any timed session
- **Progression**: Select/create topic → Select/create subtopic → Confirm and start timer
- **Success criteria**: Tags are persistent, searchable, and properly associated with sessions

### Rich Text Note Editor
- **Functionality**: Full-featured editor with formatting, colors, links, images, and stickers
- **Purpose**: Captures learning effectively with visual and textual elements
- **Trigger**: Automatically available when timer starts or session begins
- **Progression**: Timer starts → Editor appears → User takes notes → Auto-save throughout → Manual save option
- **Success criteria**: All formatting persists, media uploads work, real-time saving functions

### Session Management & Storage
- **Functionality**: Save, retrieve, and organize all study sessions with metadata
- **Purpose**: Builds searchable knowledge base of learning sessions
- **Trigger**: Automatic saving during sessions, manual save, session end
- **Progression**: Notes taken → Auto-save to storage → Session complete → Added to history
- **Success criteria**: No data loss, fast retrieval, proper metadata association

### External Database Configuration
- **Functionality**: Option to connect external storage for session backup/sync
- **Purpose**: Ensures data portability and backup beyond local storage
- **Trigger**: User accesses advanced settings and configures connection
- **Progression**: Settings → Database config → Test connection → Enable sync → Confirm setup
- **Success criteria**: Successful connection test, data sync verification, fallback to local storage

## Edge Case Handling

- **Timer Interruption**: Save current notes and offer resume/restart options
- **Network Failure**: Graceful fallback to local storage with sync when reconnected
- **Large Note Content**: Efficient handling of images and long text without performance issues
- **Duplicate Topics**: Smart merging suggestions when similar tags are created
- **Session Abandonment**: Auto-save protects work, with recovery options on return

## Design Direction

The design should feel calm and scholarly - like a premium digital notebook meets a professional timer, with warm academic tones that promote focus and reduce digital fatigue while maintaining the clean efficiency of modern productivity tools.

## Color Selection

Analogous color scheme using warm earth tones that promote concentration and reduce eye strain during long study sessions.

- **Primary Color**: Deep Forest Green (oklch(0.45 0.15 150)) - Communicates growth, knowledge, and calm focus
- **Secondary Colors**: Warm Sage (oklch(0.65 0.08 140)) for secondary actions and Cream (oklch(0.92 0.02 85)) for backgrounds
- **Accent Color**: Amber Gold (oklch(0.75 0.15 75)) for highlights, timers, and call-to-action elements
- **Foreground/Background Pairings**: 
  - Background (Cream #F5F5F0): Charcoal Gray (oklch(0.25 0.02 180)) - Ratio 8.2:1 ✓
  - Card (White #FFFFFF): Deep Forest (oklch(0.45 0.15 150)) - Ratio 5.1:1 ✓
  - Primary (Deep Forest): Cream (oklch(0.92 0.02 85)) - Ratio 5.1:1 ✓
  - Accent (Amber Gold): Deep Forest (oklch(0.45 0.15 150)) - Ratio 4.8:1 ✓

## Font Selection

Typography should feel academic yet modern - like quality textbooks meet digital efficiency, using clean serif for readability during long study sessions and sans-serif for interface elements.

- **Typographic Hierarchy**:
  - H1 (App Title): Playfair Display Bold/32px/tight letter spacing
  - H2 (Session Titles): Playfair Display Semibold/24px/normal spacing  
  - H3 (Topic Headers): Inter Semibold/18px/wide letter spacing
  - Body Text (Notes): Crimson Text Regular/16px/relaxed line height
  - UI Elements: Inter Medium/14px/normal spacing
  - Timer Display: Inter Bold/48px/tight spacing

## Animations

Subtle and purposeful animations that support the study workflow - timer transitions should feel motivating, note interactions should be responsive, with gentle micro-interactions that don't break concentration.

- **Purposeful Meaning**: Breathing animation for active timer, smooth transitions between study phases, satisfying completion animations that reinforce accomplishment
- **Hierarchy of Movement**: Timer gets primary animation focus, note tools have subtle hover states, navigation transitions are quick and unobtrusive

## Component Selection

- **Components**: 
  - Timer: Custom circular progress with `Progress` component base
  - Settings: `Dialog` with `Tabs` for organization
  - Topic Selection: `Select` with `Command` for searchable options
  - Rich Editor: Custom component using `Textarea` foundation with toolbar
  - Session History: `Card` components in `ScrollArea` with `Badge` tags
  - Navigation: `Tabs` for main sections, `Button` variants for actions

- **Customizations**: 
  - Custom timer wheel with progress indication
  - Rich text toolbar with color picker and formatting options
  - Sticker/emoji picker overlay
  - File upload zone for images

- **States**:
  - Timer: idle/running/paused/complete with visual and color changes
  - Editor: focused/typing/saving with subtle feedback
  - Buttons: Standard shadcn states plus custom timer-specific variants

- **Icon Selection**: 
  - Play/Pause/Stop for timer controls
  - Clock for duration settings
  - BookOpen for study topics
  - PencilSimple for note-taking
  - Tag for categorization
  - Floppy disk for save actions

- **Spacing**: Consistent 4/8/16/24px spacing scale with generous padding around timer and comfortable note-taking area

- **Mobile**: 
  - Stacked timer and controls on mobile
  - Simplified toolbar for rich editor on small screens
  - Full-screen note mode for distraction-free mobile studying
  - Touch-optimized timer controls and topic selection