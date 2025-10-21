import React from 'react';
import page_not_found from '../../assets/images/page-not-found.svg';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="gradient relative">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-white font-bold text-4xl md:text-5xl text-center">
            Oups ! Page Non Trouvée
          </h1>
        </div>
        <svg className="wave-top w-full" viewBox="0 0 1440 116" xmlns="http://www.w3.org/2000/svg">
          <path className="wave" style={{ fill: 'var(--muted)' }} d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,116L1360,116C1280,116,1120,116,960,116C800,116,640,116,480,116C320,116,160,116,80,116L0,116Z" />
        </svg>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6" style={{ background: 'var(--muted)' }}>
        <div className="max-w-xl w-full text-center">
          <div className="mb-30">
            <div className="rounded-full mx-auto relative flex items-center justify-center">
              <div className="page-not-found relative">
                <img
                  src={page_not_found}
                  alt="not found logo"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
