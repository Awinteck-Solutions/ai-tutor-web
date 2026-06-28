/** Practice embedded on a chat message — inline JSON, session-scoped. */
export function isValidChatPractice(practice, sessionId) {
  const activeSessionId = sessionId || practice?.chatSessionId;
  if (!practice || !activeSessionId) return false;
  if (!practice.chatSessionId || practice.chatSessionId !== activeSessionId) return false;
  if (practice.source !== 'chat') return false;
  if (practice.status !== 'ready') return false;
  if (practice.type === 'quiz') {
    return Array.isArray(practice.questions) && practice.questions.length > 0;
  }
  if (practice.type === 'flashcards') {
    return Array.isArray(practice.cards) && practice.cards.length > 0;
  }
  return false;
}
