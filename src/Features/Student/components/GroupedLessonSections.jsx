import { useState } from 'react';
import { ChevronDown, FolderOpen, GraduationCap, Layers } from 'lucide-react';
import { Collapse } from '@mantine/core';
import { GlassCard } from '../../../shared/components/GlassCard';

const SectionHeader = ({ icon: Icon, title, count, open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 px-3 py-3.5 text-left transition hover:border-primary/30 hover:bg-primary/5 sm:px-4"
  >
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-display font-semibold leading-snug text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {count}
          {' lesson'}
          {count !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
    <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${open ? 'rotate-180' : ''}`} />
  </button>
);

const GroupedLessonSections = ({
  school = [],
  grouped = [],
  ungrouped = [],
  renderGridLesson,
  renderListLesson,
  renderLesson,
  defaultOpenAll = true,
  emptyMessage = 'No lessons in this section.',
}) => {
  const gridRenderer = renderGridLesson ?? renderLesson;
  const listRenderer = renderListLesson ?? renderLesson;

  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    if (school.length) initial.school = defaultOpenAll;
    grouped.forEach((g) => { initial[g.id] = defaultOpenAll; });
    if (ungrouped.length) initial.ungrouped = defaultOpenAll;
    return initial;
  });

  const toggle = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderGrid = (lessons) => (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.length ? lessons.map((lesson) => (
        <div key={lesson.id} className="min-w-0">
          {gridRenderer(lesson)}
        </div>
      )) : (
        <p className="col-span-full py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </div>
  );

  const renderList = (lessons) => (
    <ul className="mt-3 divide-y divide-border/40 overflow-hidden rounded-xl border border-border/50 bg-card/40">
      {lessons.length ? lessons.map((lesson) => (
        <li key={lesson.id} className="min-w-0">{listRenderer(lesson)}</li>
      )) : (
        <li className="px-4 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</li>
      )}
    </ul>
  );

  const hasContent = school.length || grouped.length || ungrouped.length;
  if (!hasContent) return null;

  return (
    <div className="min-w-0 space-y-4">
      {school.length > 0 && (
        <GlassCard className="min-w-0 p-3 sm:p-4">
          <SectionHeader
            icon={GraduationCap}
            title="School lessons"
            count={school.length}
            open={openSections.school !== false}
            onToggle={() => toggle('school')}
          />
          <Collapse in={openSections.school !== false}>
            {renderGrid(school)}
          </Collapse>
        </GlassCard>
      )}

      {grouped.map((group) => (
        <GlassCard key={group.id} className="min-w-0 p-3 sm:p-4">
          <SectionHeader
            icon={FolderOpen}
            title={group.title}
            count={group.lessons?.length ?? group.lessonCount ?? 0}
            open={openSections[group.id] !== false}
            onToggle={() => toggle(group.id)}
          />
          <Collapse in={openSections[group.id] !== false}>
            {renderList(group.lessons ?? [])}
          </Collapse>
        </GlassCard>
      ))}

      {ungrouped.length > 0 && (
        <GlassCard className="min-w-0 p-3 sm:p-4">
          <SectionHeader
            icon={Layers}
            title="Ungrouped self-learn"
            count={ungrouped.length}
            open={openSections.ungrouped !== false}
            onToggle={() => toggle('ungrouped')}
          />
          <Collapse in={openSections.ungrouped !== false}>
            {renderGrid(ungrouped)}
          </Collapse>
        </GlassCard>
      )}
    </div>
  );
};

export default GroupedLessonSections;
