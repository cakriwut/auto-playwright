# Auto Playwright

Auto Playwright is a TypeScript library that enables AI-powered Playwright test automation using OpenAI's API. It allows writing Playwright tests with natural language prompts instead of explicit selectors and actions.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Build
- Install dependencies: `npm ci` -- takes 4-8 seconds. Always run this first.
- Build the project: `npm run build` -- takes 4-5 seconds. NEVER CANCEL. Set timeout to 60+ minutes as a precaution.
- Format code: `npm run format` -- takes under 1 second, runs Prettier on source files
- Lint code: `npm run lint` -- runs Prettier check + Knip analysis. Takes 2-3 seconds. NEVER CANCEL.
  - **Important**: Knip detects unused files and will fail if new files are added but not imported/used
  - **Important**: Prettier formatting is checked; run `npm run format` first if lint fails due to formatting

### Development Server
- Start test server: `npm run start` -- starts Hono server on port 3000. Server runs indefinitely until stopped.
- Test server endpoint: `curl http://127.0.0.1:3000/` to verify server is running
- The server serves test pages for manual validation and automated testing

### Testing and Validation
- **CRITICAL LIMITATION**: Playwright browser installation may fail in some environments due to download issues
- **BROWSER WORKAROUND**: If `npx playwright install` fails, document this limitation but proceed with other validation
- Install browser dependencies first: `npx playwright install-deps` -- takes 2-5 minutes. NEVER CANCEL.
- Run tests: `npm test` -- takes 30-60 seconds when browsers are available. NEVER CANCEL. Set timeout to 120+ minutes.
- **MANUAL VALIDATION REQUIRED**: Always test server functionality manually using curl commands when browser tests fail

### Required Environment Variables
- `OPENAI_API_KEY`: Required for AI functionality. Tests may fail without this unless using mock options.
- `AUTO_PLAYWRIGHT_DEBUG=true`: Optional, enables debug output for AI function calls

## Validation Scenarios

### Always Test These Scenarios After Making Changes
1. **Build and Lint Validation**:
   ```bash
   npm ci
   npm run build
   npm run format  # Run before lint to fix formatting
   npm run lint
   ```

2. **Server Functionality**:
   ```bash
   npm run start &
   sleep 2
   curl -I http://127.0.0.1:3000/
   curl -s http://127.0.0.1:3000/tests/pages/default.html | grep "Hello, Rayrun!"
   ```

3. **Library Import Test** (manual verification):
   ```bash
   node -e "const { auto } = require('./dist/index.js'); console.log('Import successful:', typeof auto)"
   ```

4. **TypeScript Compilation Test**:
   ```bash
   npx tsc --noEmit
   ```

### Manual Testing Scenarios
When browser installation fails, always manually verify:
- Server starts without errors
- Test pages are accessible
- Library builds and exports correctly
- TypeScript compilation succeeds
- Linting passes

## Common Commands and Timing

### Build Commands
- `npm ci`: 4-8 seconds
- `npm run build`: 4-5 seconds -- NEVER CANCEL, set 60+ minute timeout
- `npm run lint`: 2-3 seconds -- NEVER CANCEL, set 30+ minute timeout
- `npm run format`: Under 1 second
- `npm run test`: 30-60 seconds (when browsers work) -- NEVER CANCEL, set 120+ minute timeout

### Development Commands
- `npm run start`: Starts immediately, runs until stopped
- `npx playwright install-deps`: 2-5 minutes -- NEVER CANCEL
- `npx playwright install`: May fail due to download issues - document if it fails

### Important Linting Behavior
- **Prettier Integration**: Linting includes formatting checks; always run `npm run format` before `npm run lint` 
- **Unused File Detection**: Knip will fail if files are added but not imported/used anywhere
- **Quick Fix Workflow**: If lint fails, try `npm run format && npm run lint`

## Key Project Information

### Directory Structure
```
src/                 # TypeScript source code
├── auto.ts          # Main auto() function
├── completeTask.ts  # OpenAI API integration
├── createActions.ts # Playwright action definitions (1395 lines)
├── types.ts         # TypeScript type definitions
└── index.ts         # Main library export

tests/               # Test files and test server
├── auto.spec.ts     # Integration tests for auto() function
├── actions.spec.ts  # Unit tests for individual actions
├── bin/startServer.ts # Test server implementation
└── pages/           # HTML test pages

dist/                # Compiled JavaScript output
```

### Dependencies and Stack
- **Core**: TypeScript, Playwright, OpenAI SDK
- **Server**: Hono framework for test server
- **Build**: TypeScript compiler, Prettier formatter, Knip linter
- **Testing**: Playwright Test framework
- **Security**: Known vulnerabilities exist (4 total: 1 critical, 2 moderate, 1 low)

### GitHub Workflows
- **Branch workflow** (`.github/workflows/branch.yaml`): Runs on PRs, executes lint and build
- **Release workflow** (`.github/workflows/release.yaml`): Runs on main branch, executes lint, build, and semantic-release
- Both workflows use Node.js 21 and run: `npm ci`, `npm run lint`, `npm run build`

## Known Issues and Limitations
- **Browser Installation**: Playwright browser downloads may fail due to CDN issues in certain environments
- **OpenAI Dependency**: Full functionality requires valid OpenAI API key
- **Security Vulnerabilities**: 4 known vulnerabilities in dependencies (run `npm audit` for details)
- **Test Execution**: Browser-based tests cannot run if browser installation fails

## Working Around Limitations
- **When browsers fail to install**: Focus on library compilation, linting, and server testing
- **Without OpenAI API key**: Tests will fail, but library builds and basic functionality can be verified
- **For manual validation**: Always run server and verify endpoints respond correctly
- **Security vulnerabilities**: Run `npm audit fix` to address non-breaking issues

## Files Frequently Modified
- `src/auto.ts`: Main library API
- `src/createActions.ts`: Playwright action definitions (largest file)
- `src/types.ts`: TypeScript interfaces
- `tests/auto.spec.ts`: Integration tests
- `README.md`: Documentation and usage examples

## Example Usage Patterns
The library enables natural language Playwright automation:
```typescript
import { auto } from "auto-playwright";

// Query data
const headerText = await auto("get the header text", { page, test });

// Perform actions  
await auto('Click the "Submit" button', { page, test });

// Assert conditions
const isVisible = await auto("Is the success message visible?", { page, test });
```

Always run validation steps after making changes to ensure the library builds correctly and server functionality works as expected.