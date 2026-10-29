# User Rules and Operating Standards

## System Guidelines

1. **Offline-First Resilience**:
   - The application must remain fully functional offline.
   - When no internet connection or API keys are available, the Zero-Cost Heuristic Engine and Local Ollama instance (`http://localhost:11434`) must take over workflow synthesis and repair.
   - Local state persists in browser IndexedDB and `localStorage`.

2. **Human-Natural Communication**:
   - Write with natural human variation, concrete meaning, and plain verbs.
   - Do not use corporate filler, buzzwords, or marketing praise without facts.
   - Do not add conversational chatbot residue such as "Certainly!", "I hope this helps", or "Let's dive in".
   - Start directly with the subject and state facts plainly.

3. **Data Integrity and Access Control**:
   - All server API endpoints must enforce session or JWT validation.
   - Never expose API keys or passwords in client logs.
   - Workflows and graph memories must strictly isolate records by `user_id`.

4. **Zero Cloud Lock-in**:
   - All workflows can be exported and imported as standard n8n JSON format.
   - Graph memory is exportable as standard `graph.json` and interactive `graph.html`.
