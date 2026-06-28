import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
  id,
  className = 'input-adesia pl-10 pr-10',
  leftIcon: LeftIcon,
  ...inputProps
}) => (
  <div className="relative">
    {LeftIcon && (
      <LeftIcon className="input-adornment-icon" />
    )}
    <PasswordInputField id={id} className={className} {...inputProps} />
  </div>
);

export const PasswordInputField = ({
  id,
  className = 'input-adesia pr-10',
  ...inputProps
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={className}
        {...inputProps}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="input-adornment-toggle"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default PasswordInput;
