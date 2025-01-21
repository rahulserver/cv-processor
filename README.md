# CV Processor

An AI-powered CV/Resume processor that extracts and structures information from PDF resumes. Built with Next.js, OpenAI, and TypeScript.

## Features

- PDF resume upload and processing
- AI-powered information extraction
- Structured output of:
  - Personal information
  - Career objective
  - Skills categorization
  - Work experience
  - PII (Personally Identifiable Information) detection
- PDF download of processed results
- Interactive CV editor
- Real-time processing status

## Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- OpenAI API key

## Environment Setup

### Development
Create a `.env.local` file in the root directory:

```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
```

### Production (Vercel)
Environment variables for production should be configured in the Vercel project settings:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `OPENAI_API_KEY`: Your OpenAI API key

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |

Note: Never commit your `.env.local` file to version control. It's already included in `.gitignore`.

## Installation

```bash
# Install dependencies
npm install
# Note: do NOT USE yarn for this project. Stick to npm
```

## Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Testing

The project uses Jest for testing. Tests are located in `__tests__` directories next to the files they test.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/         # React components
├── lib/               # Utility functions and business logic
│   ├── agents/        # AI processing logic
│   ├── pdf/           # PDF handling utilities
│   └── types/         # TypeScript type definitions
└── styles/            # Global styles
```

## Key Technologies

- [Next.js](https://nextjs.org/) - React framework
- [OpenAI API](https://openai.com/) - AI processing
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF processing
- [TipTap](https://tiptap.dev/) - Rich text editor
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Jest](https://jestjs.io/) - Testing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.

## Support

For support, please open an issue in the repository.
