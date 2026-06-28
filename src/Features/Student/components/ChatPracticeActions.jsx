import { ClipboardList, Layers, Play } from 'lucide-react';
import { isValidChatPractice } from '../../../shared/utils/chatPractice.utils';

const ChatPracticeActions = ({
  practice,
  sessionId,
  onTryQuiz,
  onTryFlashcards,
  disabled = false,
}) => {
  const activeSessionId = sessionId || practice?.chatSessionId;

  if (!isValidChatPractice(practice, activeSessionId)) return null;

  const isQuiz = practice.type === 'quiz';
  const Icon = isQuiz ? ClipboardList : Layers;
  const label = isQuiz ? 'Try quiz' : 'Try flashcards';

  const handleTry = () => {
    if (disabled) return;
    if (isQuiz) {
      onTryQuiz?.(practice);
    } else {
      onTryFlashcards?.(practice);
    }
  };

  return (
    <div className="chat-practice-card mt-3 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 p-3">
      <div className="flex items-start gap-3">
        <div className="chat-practice-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {practice.title || (isQuiz ? 'Quiz from this chat' : 'Flashcards from this chat')}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isQuiz
              ? `${practice.questions.length} question${practice.questions.length === 1 ? '' : 's'} from this conversation.`
              : `${practice.cards.length} card${practice.cards.length === 1 ? '' : 's'} from this conversation.`}
          </p>
          <button
            type="button"
            onClick={handleTry}
            disabled={disabled}
            className="chat-practice-try-btn mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPracticeActions;
