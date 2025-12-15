import React from 'react';
import GamingButton from './GamingButton';

interface AccessDeniedProps {
  title?: string;
  description?: string;
  backText?: string;
  onBack?: () => void;
  className?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = 'Access Denied',
  description = 'You do not have clearance to access this area.',
  backText = 'Return to Base',
  onBack,
  className = ''
}) => {
  return (
    <section className={`py-20 min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <h1 className="text-4xl font-exo font-bold text-red-500 mb-4">{title}</h1>
        <p className="text-gray-400 mb-8">{description}</p>
        <GamingButton onClick={onBack} variant="primary">{backText}</GamingButton>
      </div>
    </section>
  );
};

export default AccessDenied;
