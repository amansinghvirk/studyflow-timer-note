# StudyFlow - Smart Study Timer with Rich Notes

StudyFlow is a comprehensive study application that combines focused timer sessions with rich note-taking capabilities, streak tracking, and detailed analytics to help you maximize your learning potential.

## 🌟 Key Features

### ⏱️ Smart Study Timer
- **Configurable Sessions**: Customizable study durations (default 25 minutes)
- **Break Management**: Automatic break timers with configurable short (5 min) and long breaks (15 min)
- **Topic Organization**: Tag sessions with main topics and subtopics for better organization
- **Distraction-Free Mode**: Minimalist interface during active sessions
- **Audio Notifications**: Sound alerts for session completion

### 📝 Rich Note-Taking
- **WYSIWYG Editor**: Full-featured rich text editor with formatting options
- **Multi-format Export**: Download notes as Markdown, HTML, or PDF
- **Session Integration**: Notes automatically linked to study sessions
- **Edit & Delete**: Modify or remove notes after sessions
- **Local Storage**: Secure local file saving with directory navigation

### 🤖 AI-Powered Study Enhancement
- **Google AI Integration**: Powered by Google's Gemini models via Langchain
- **Note Enhancement**: AI-powered suggestions to improve note clarity and structure
- **Smart Summaries**: Generate concise summaries of study sessions
- **Quiz Generation**: Create practice questions from your notes
- **Concept Explanations**: Get simplified explanations for difficult topics
- **Progress Analysis**: AI insights into study patterns and effectiveness
- **Customizable Models**: Choose from Gemini Pro, Flash, or other available models
- **Flexible Prompts**: Built-in prompt library with different analysis types

### 🔥 Streak Tracking & Gamification
- **Daily Streaks**: Track consecutive study days
- **Achievement System**: Unlock rewards for milestones
- **Weekly Goals**: Set and monitor weekly study targets
- **Progress Visualization**: Visual streak indicators and progress bars

### 📊 Analytics Dashboard
- **Study Statistics**: Comprehensive metrics including total hours, session counts
- **Topic Analysis**: Performance breakdown by subject areas
- **Trend Visualization**: Daily, weekly, and monthly study patterns
- **Time Projections**: Calculate potential study hours over 150-500 day periods
- **Visual Charts**: Interactive graphs and charts for trend analysis

### 📱 Mobile-Responsive Design
- **Adaptive Interface**: Optimized for desktop and mobile devices
- **Touch-Friendly**: Large tap targets and mobile-optimized controls
- **Burger Menu**: Clean navigation on smaller screens
- **Progressive Layout**: Content adapts to screen size

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── sonner.tsx
│   │   └── ...
│   ├── AIInsights.tsx          # AI-powered note analysis
│   ├── Dashboard.tsx          # Analytics and statistics
│   ├── MobileNavigation.tsx   # Mobile burger menu
│   ├── PageTitle.tsx          # Page headers
│   ├── PromptLibrary.tsx      # AI prompt management
│   ├── RichTextEditor.tsx     # Note-taking editor
│   ├── SessionHistory.tsx     # Study session history
│   ├── SessionNotes.tsx       # Notes management
│   ├── Settings.tsx           # App configuration
│   ├── StreakTracker.tsx      # Progress tracking
│   ├── StudyInsights.tsx      # AI study analytics
│   └── StudyTimer.tsx         # Main timer component
├── lib/
│   ├── ai.ts                  # Google AI integration
│   └── utils.ts              # Utility functions
├── prompts/
│   └── index.ts              # AI prompt templates
├── assets/
│   ├── images/               # Image assets
│   ├── video/                # Video assets
│   ├── audio/                # Audio files
│   └── documents/            # Document assets
├── App.tsx                   # Main application component
├── index.css                 # Global styles and theme
└── main.tsx                  # Application entry point
```

## 🚀 Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Shadcn/ui v4
- **Icons**: Phosphor Icons
- **Notifications**: Sonner
- **Rich Text**: Custom WYSIWYG editor
- **Charts**: Built-in chart components
- **Storage**: Local browser storage with useKV hook
- **AI Integration**: Langchain with Google Generative AI
- **AI Models**: Google Gemini (Pro, Flash, Pro Vision)

## 💾 Data Persistence

The application uses a persistent key-value storage system that maintains data across browser sessions:

- **Study Sessions**: Complete session history with notes
- **User Settings**: Timer preferences and configurations
- **Topics & Subtopics**: Custom study subject organization
- **Streak Data**: Progress tracking and achievement data
- **Achievements**: Unlocked rewards and milestones
- **AI Settings**: API keys and model configurations

## 🤖 AI Setup and Configuration

### Getting Started with AI Features

1. **Get a Google AI API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Generate a new API key

2. **Configure AI Settings**:
   - Go to Settings → AI tab
   - Enable AI features
   - Enter your API key
   - Choose your preferred model (Gemini Flash recommended for speed)
   - Adjust creativity level and response length as needed

3. **Test Your Setup**:
   - Click "Test AI Connection" to verify your configuration
   - If successful, you'll see AI Insights buttons in your notes

### Available AI Models

- **Gemini 1.5 Pro**: Most capable model for complex analysis
- **Gemini 1.5 Flash**: Fast and efficient for most tasks
- **Gemini Pro**: Balanced performance and speed

### AI Prompt Library

The app includes 5 built-in prompt types:

- **Enhancement**: Improve note clarity and structure
- **Summary**: Generate concise session summaries
- **Quiz**: Create practice questions from notes
- **Explanation**: Simplify difficult concepts
- **Analysis**: Analyze study patterns and progress

### Privacy and Security

- API keys are stored securely in local browser storage
- No study data is sent to external servers except for AI processing
- All AI requests are processed through Google's secure APIs
- You can disable AI features at any time in settings

## 📈 Analytics Features

### Study Metrics
- Total study time across all sessions
- Session count and completion rate
- Average session duration (overall and by topic)
- Daily, weekly, and monthly trends

### Topic Analysis
- Performance breakdown by major topics
- Subtopic distribution and focus areas
- Time allocation across different subjects

### Time Projections
- Calculate potential study hours over various time periods
- Project outcomes based on current study habits
- Goal setting and achievement tracking

### Visual Charts
- Interactive line charts for trend analysis
- Bar charts for topic comparison
- Progress indicators for streak tracking
- Responsive charts that adapt to screen size

## ⚙️ Configuration Options

### Timer Settings
- Default session duration (1-120 minutes)
- Break duration (1-60 minutes)
- Long break duration (1-120 minutes)
- Sessions until long break (2-10 sessions)
- Auto-start breaks toggle
- Audio notifications toggle

### Study Organization
- Custom topic creation and management
- Subtopic organization under main topics
- Session tagging and categorization

### AI Configuration
- Enable/disable AI features
- API key management
- Model selection (Gemini Pro, Flash, etc.)
- Creativity level adjustment (temperature)
- Response length limits
- Connection testing

### Interface Preferences
- Distraction-free mode toggle
- Mobile-optimized navigation
- Theme customization options

## 🎯 Achievement System

### Session-Based Achievements
- **Getting Started**: Complete first study session
- **Dedicated Learner**: Complete 10 study sessions
- **Study Master**: Complete 50 study sessions

### Streak-Based Achievements
- **Building Momentum**: Study 3 days in a row
- **Week Warrior**: Study 7 days in a row
- **Unstoppable**: Study 30 days in a row

### Duration-Based Achievements
- **Century Club**: Study for 100 hours total

### Topic-Based Achievements
- **Renaissance Mind**: Study 5 different topics

## 📱 Mobile Optimization

- **Responsive Design**: Adapts to all screen sizes
- **Touch Interfaces**: Optimized for mobile interaction
- **Burger Menu**: Clean navigation on smaller screens
- **Mobile-First**: Progressive enhancement from mobile base
- **Performance**: Optimized for mobile performance

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🎨 Design Philosophy

StudyFlow follows modern design principles focusing on:

- **Minimalist Interface**: Clean, distraction-free design
- **Purposeful Typography**: Clear hierarchy with Poppins and Merriweather fonts
- **Cohesive Color Palette**: Warm, study-friendly color scheme
- **Responsive Layout**: Mobile-first responsive design
- **Accessibility**: WCAG AA compliant contrast ratios
- **Micro-interactions**: Subtle animations for better UX

## 🔮 Future Enhancements

- **Cloud Sync**: Cross-device synchronization
- **Collaborative Sessions**: Study groups and shared sessions
- **Advanced Analytics**: ML-powered study insights
- **Integration**: Calendar and task management integration
- **Themes**: Additional color schemes and customization
- **Export Options**: More file formats and sharing options

## 🤝 Contributing

This project is built with modern web technologies and follows established patterns for maintainability and extensibility. The codebase is organized with clear separation of concerns and comprehensive TypeScript types.

## 📄 License

This project is open source and available under the MIT License.