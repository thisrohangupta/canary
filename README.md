# Canary - AI-Powered Harness Assistant

> **Demo Project**: Intelligent chat interface for Harness platform operations, powered by Google Gemini 2.0 AI

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by Gemini 2.0](https://img.shields.io/badge/Powered%20by-Gemini%202.0-blue?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## 🎯 What This Demo Shows

Canary demonstrates how AI can revolutionize DevOps workflows by providing:

1. **Intelligent Chat Interface** - Natural language interactions with AI specialized in Harness platform
2. **YAML File Processing** - Upload and analyze Harness configurations with instant feedback
3. **Smart Detection** - Automatically identifies pipeline, service, connector, and infrastructure configs
4. **One-Click Deployment** - Direct integration with Harness API for instant resource creation
5. **Project Organization** - Organize conversations by team or project for better collaboration
6. **Real-Time Context** - AI maintains conversation history and project context for relevant responses

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AI Service    │    │   Harness API   │
│                 │    │                 │    │                 │
│ • Next.js 15    │───▶│ • Gemini 2.0    │    │ • Deploy Configs │
│ • TypeScript    │    │ • Context Aware │    │ • Manage Resources│
│ • Tailwind CSS  │    │ • File Analysis │    │ • Real-time Ops │
│ • Radix UI      │    │ • Web Search    │    │ • API Integration│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Browser Storage │
                    │                 │
                    │ • Chat History  │
                    │ • Projects      │
                    │ • User Prefs    │
                    └─────────────────┘
```

## ✨ Key Features Demonstrated

### 🤖 AI-Powered Assistance
- **Specialized Knowledge**: Trained specifically for Harness platform operations
- **Context Awareness**: Remembers conversation history and project context
- **File Analysis**: Processes uploaded YAML files and provides detailed feedback
- **Web Search Integration**: Enhanced responses with real-time information

### 📁 Smart File Handling
- **YAML Upload**: Drag & drop or click to upload `.yaml`/`.yml` files
- **Content Analysis**: AI analyzes file structure and suggests improvements
- **Multi-file Support**: Handle multiple configuration files simultaneously
- **Syntax Validation**: Real-time validation of Harness YAML syntax

### 🚀 Harness Integration
- **Resource Detection**: Automatically identifies different Harness resource types
- **Deploy Buttons**: One-click deployment to your Harness account
- **API Integration**: Direct connection to Harness platform APIs
- **Configuration Management**: Create and manage pipelines, services, environments

### 📊 Project Organization
- **Team Workspaces**: Organize conversations by project or team
- **Context Sharing**: AI leverages insights across project conversations
- **Persistent Storage**: All data saved locally in browser
- **Export Capabilities**: Download configurations and chat history

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 15 + TypeScript | Modern React framework with type safety |
| **UI Components** | Radix UI + Tailwind CSS | Accessible, customizable design system |
| **AI Engine** | Google Gemini 2.0 Flash | Advanced language model with reasoning |
| **API Integration** | Harness Platform APIs | Direct deployment and resource management |
| **Storage** | Browser LocalStorage | Client-side persistence and privacy |
| **Build Tool** | Next.js + Vercel | Optimized builds and serverless deployment |

## 🚀 Quick Demo Setup

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key ([Get one here](https://ai.google.dev/))
- Harness account with API access (optional for deploy features)

### 1. Clone and Install
```bash
git clone <repository-url>
cd canary
npm install
```

### 2. Environment Configuration
Create `.env.local` file:
```env
# Required: Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Harness Deployment Integration
NEXT_PUBLIC_HARNESS_API_KEY=your_harness_api_key
NEXT_PUBLIC_HARNESS_ACCOUNT_ID=your_account_id
NEXT_PUBLIC_HARNESS_ORG_ID=your_org_id
NEXT_PUBLIC_HARNESS_PROJECT_ID=your_project_id
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## 🎯 Demo Flow

### Basic Chat Demo
1. **Start Conversation**: Ask about Harness pipelines or configurations
2. **See AI Response**: Watch real-time thinking process and detailed responses
3. **Context Building**: Ask follow-up questions to see conversation memory
4. **Web Search**: Ask about latest Harness features to see web integration

### File Upload Demo
1. **Upload YAML**: Drag a Harness configuration file to chat
2. **AI Analysis**: See detailed analysis of the configuration
3. **Suggestions**: Get improvement recommendations and best practices
4. **Validation**: Identify syntax errors or missing components

### Deployment Demo (Requires Harness Account)
1. **Generate Config**: Ask AI to create a sample pipeline
2. **Deploy Button**: Click "Deploy to Harness" when it appears
3. **Configuration**: Fill in deployment details
4. **Live Deployment**: Watch as resource is created in Harness

### Project Organization Demo
1. **Create Project**: Click "New Project" in sidebar
2. **Team Context**: Start multiple chats within the project
3. **Context Sharing**: See how AI remembers project discussions
4. **Organization**: Navigate between different project workspaces

## 📚 Code Structure (For Engineers)

### Core Components

**`/components/chat-interface.tsx`** - Main chat UI
- Handles user input and AI responses
- Manages file uploads and processing
- Integrates with all major features

**`/lib/gemini.ts`** - AI Service Integration
- Secure API route for Gemini AI calls
- Context management and conversation history
- Error handling and rate limiting

**`/lib/harness-api.ts`** - Harness Platform Integration
- API client for Harness operations
- Resource deployment and management
- Authentication and security

**`/lib/yaml-detector.ts`** - Smart Configuration Detection
- Identifies Harness resource types in YAML
- Validates configuration syntax
- Provides deployment suggestions

**`/components/harness-deploy-button.tsx`** - Deployment UI
- Modal interface for deployment configuration
- Form validation and error handling
- Live deployment status updates

### Data Flow

1. **User Input** → Chat Interface → AI Service
2. **AI Processing** → Context Analysis → Response Generation
3. **YAML Detection** → Resource Identification → Deploy Button Creation
4. **Deployment** → Harness API → Resource Creation

### Security Features

- **Server-side API calls**: All sensitive operations happen on server
- **Environment variables**: API keys never exposed to client
- **Input validation**: All user inputs sanitized and validated
- **Error handling**: Graceful degradation for all failure modes

## 🎨 UI/UX Design Highlights

### Clean, Professional Interface
- **Untitled UI Design System**: Modern, accessible components
- **Light Theme**: Optimized for readability and professional appearance
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Smooth animations and live feedback

### Intelligent User Experience
- **Context Indicators**: Visual badges show AI capabilities being used
- **Thinking Process**: Transparent AI reasoning process
- **Smart Suggestions**: Contextual help and recommendations
- **Error Recovery**: Clear error messages with actionable solutions

## 🔧 Customization Points

### Adding New AI Capabilities
1. Extend the system prompt in `/app/api/gemini/route.ts`
2. Add new response types in the chat interface
3. Create specialized UI components for new features

### Integrating Other Platforms
1. Create new API clients in `/lib/`
2. Add detection logic for new configuration types
3. Build deployment UI components

### Extending Project Features
1. Enhance project metadata in storage schema
2. Add team collaboration features
3. Implement sharing and export capabilities

## 📋 Demo Talking Points

### For Technical Audiences
- **Modern Architecture**: Next.js 15, TypeScript, and serverless deployment
- **AI Integration**: Advanced prompt engineering and context management
- **API Design**: RESTful integration with error handling and security
- **Performance**: Optimized builds, lazy loading, and efficient state management

### For Business Audiences
- **Productivity Gains**: Instant DevOps assistance and configuration generation
- **Error Reduction**: AI validation prevents common configuration mistakes
- **Team Collaboration**: Shared project workspaces and knowledge retention
- **Cost Efficiency**: Faster deployment cycles and reduced manual work

### For DevOps Teams
- **Practical Utility**: Real solutions for daily Harness operations
- **Learning Tool**: AI explains best practices and configuration options
- **Automation Bridge**: Connects manual work with automated deployments
- **Knowledge Sharing**: Captures and shares team expertise

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```
Add environment variables in Vercel dashboard.

### Docker
```bash
docker build -t canary .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key canary
```

### Traditional Hosting
```bash
npm run build
npm start
```

## 🔮 Future Enhancements

- **Multi-platform Support**: Jenkins, GitLab CI, AWS CodePipeline
- **Advanced Analytics**: Usage tracking and optimization suggestions  
- **Team Features**: Real-time collaboration and shared workspaces
- **Enterprise Integration**: SSO, audit logs, and compliance features
- **Mobile App**: Native iOS/Android applications
- **Voice Interface**: Speech-to-text for hands-free operations

## 🤝 Contributing

This is a demo project showcasing AI integration possibilities. For production use:

1. **Security Review**: Implement proper authentication and authorization
2. **Scale Testing**: Load test AI service integration and API limits
3. **Error Handling**: Enhance error recovery and user feedback
4. **Monitoring**: Add observability and performance tracking

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Built with ❤️ to demonstrate the future of AI-powered DevOps**