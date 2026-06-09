/**
 * Badge/label for lesson or practice item source (self-learn vs school org).
 */
const StudentSourceLabel = ({
  isPersonal,
  organizationName,
  isSchoolStudent,
  className = '',
}) => {
  if (isPersonal) {
    return (
      <span className={`text-xs font-medium text-primary ${className}`.trim()}>
        Self-learn
      </span>
    );
  }

  if (isSchoolStudent && organizationName) {
    return (
      <span className={`text-xs font-medium text-muted-foreground ${className}`.trim()}>
        {organizationName}
      </span>
    );
  }

  return null;
};

export default StudentSourceLabel;
