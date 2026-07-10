const OLLAMA_HOST = "http://10.68.0.210:11434";
// "auto" = use whatever Gemma model the user has pulled (detected via /api/tags).
// Or pin an exact tag to skip detection, e.g. "gemma3", "gemma3:4b", "gemma2:2b".
// Note: photo diagnosis needs a vision-capable Gemma (e.g. gemma3).
const OLLAMA_MODEL = "auto";
