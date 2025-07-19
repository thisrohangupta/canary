# Canary - Harness AI Assistant

An intelligent chat interface powered by Google's Gemini 2.0 Flash, designed specifically for Harness platform configuration and management. Generate, configure, and deploy Harness resources with natural language conversations.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by Gemini 2.0](https://img.shields.io/badge/Powered%20by-Gemini%202.0-blue?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## ✨ Features

- **🤖 Gemini 2.0 Integration** - Latest AI model with web search capabilities
- **🚀 Harness-Focused** - Specialized in DevOps pipeline and infrastructure configuration
- **📁 Project Organization** - Organize conversations by projects with persistent storage
- **💻 YAML Generation** - Generate production-ready Harness configurations
- **🔗 Direct Deploy** - One-click deploy to Harness platform via API integration
- **🎯 Smart Detection** - Automatically detects pipeline, service, connector, environment, and infrastructure YAML
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🛡️ Error Handling** - Graceful handling of rate limits and API errors
- **💡 Thinking Process** - See AI's reasoning with expandable thought streams

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **AI Model**: Google Gemini 2.0 Flash Experimental
- **Storage**: Local browser storage with export capabilities
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn** or **pnpm**
- **Google Gemini API Key** (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/canary.git
cd canary
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Required: Google Gemini API key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Harness deployment integration (for deploy to Harness feature)
NEXT_PUBLIC_HARNESS_API_KEY=your_harness_api_key_here
NEXT_PUBLIC_HARNESS_ACCOUNT_ID=your_harness_account_id
NEXT_PUBLIC_HARNESS_ORG_ID=your_harness_org_id
NEXT_PUBLIC_HARNESS_PROJECT_ID=your_harness_project_id
```

**Get your API key:**
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create a new API key
3. Copy the key to your `.env.local` file

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

### Local Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Optimize for Production

The app includes several optimizations:
- **Static Generation** for landing pages
- **Dynamic Rendering** for chat routes
- **Code Splitting** for optimal loading
- **Image Optimization** with Next.js Image component

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/canary)

1. **One-Click Deploy**: Click the deploy button above
2. **Add Environment Variables**: Set `NEXT_PUBLIC_GEMINI_API_KEY` in Vercel dashboard
3. **Deploy**: Your app will be live in minutes

**Manual Vercel Deployment:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variable
vercel env add NEXT_PUBLIC_GEMINI_API_KEY
```

### Deploy to Netlify

1. **Connect Repository**: Link your GitHub repo to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **Environment Variables**: Add `NEXT_PUBLIC_GEMINI_API_KEY`

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway new
railway up
```

### Deploy with Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t canary .
docker run -p 3000:3000 -e NEXT_PUBLIC_GEMINI_API_KEY=your_key canary
```

## 📖 Usage Guide

### Basic Chat

1. **Start Conversation**: Type your Harness-related question
2. **View Response**: AI generates detailed explanations and configurations
3. **Copy YAML**: Use the copy button to grab generated configurations
4. **Deploy**: Click "Deploy to Harness" to open the platform

### Project Management

1. **Create Project**: Click "New Project" in the sidebar
2. **Organize Chats**: Group related conversations by project
3. **Switch Contexts**: Jump between projects seamlessly
4. **Persistent Storage**: All data saved locally in your browser

### YAML Configuration

1. **Generate**: Ask for specific Harness resources (pipelines, services, etc.)
2. **Review**: Check the generated YAML in the right panel
3. **Export**: Download configurations for later use
4. **Deploy**: Direct integration with Harness platform

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NEXT_PUBLIC_HARNESS_API_KEY` | Harness API key for deployment | No |
| `NEXT_PUBLIC_HARNESS_ACCOUNT_ID` | Harness account identifier | No |
| `NEXT_PUBLIC_HARNESS_ORG_ID` | Harness organization identifier | No |
| `NEXT_PUBLIC_HARNESS_PROJECT_ID` | Harness project identifier | No |

### Rate Limits

- **Free Tier**: 50 requests per day
- **Paid Plans**: Higher limits available
- **Error Handling**: Graceful degradation with helpful messages

## 🔧 Development

### Project Structure

```
canary/
├── app/                    # Next.js App Router
│   ├── chat/[chatId]/     # Individual chat pages
│   ├── project/[id]/      # Project management
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── chat-interface.tsx # Main chat component
│   └── harness-response-card.tsx # YAML display
├── lib/                  # Utilities and services
│   ├── gemini.ts        # Gemini API integration
│   ├── chat-storage.ts  # Local storage management
│   └── utils.ts         # Helper functions
└── public/              # Static assets
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Adding New Features

1. **Components**: Add to `/components` directory
2. **Pages**: Use App Router in `/app` directory
3. **API Integration**: Extend `/lib/gemini.ts`
4. **Styling**: Use Tailwind classes with Radix UI

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Dependency Conflicts**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**API Key Issues**
- Verify key is set in `.env.local`
- Check key has proper permissions
- Ensure file is not committed to git

**Rate Limit Errors**
- Upgrade to paid Gemini plan
- Implement request queuing
- Cache responses locally

### Performance Optimization

- **Enable ISR**: For frequently accessed content
- **Implement Caching**: For API responses
- **Optimize Images**: Use Next.js Image component
- **Bundle Analysis**: Run `npm run analyze`

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Test across different screen sizes
- Ensure API key security

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini Team** for the powerful AI model
- **Harness** for the DevOps platform inspiration
- **Vercel** for excellent hosting and Next.js framework
- **Radix UI** for accessible component primitives

## 🔗 Links

- **Live Demo**: [Your deployed app URL]
- **Harness Platform**: [app.harness.io](https://app.harness.io)
- **Gemini API**: [ai.google.dev](https://ai.google.dev)
- **Next.js Docs**: [nextjs.org](https://nextjs.org)

---

**Built with ❤️ for the DevOps community**