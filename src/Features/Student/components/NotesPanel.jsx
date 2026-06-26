import NotesWorkspace from './NotesWorkspace';

/** Notes tab on lesson detail — scoped to current lesson by default */
const NotesPanel = ({ lessonId, className = '' }) => (
  <div className={`min-w-0 ${className}`.trim()}>
    <NotesWorkspace defaultLessonId={lessonId} embedded />
  </div>
);

export default NotesPanel;
