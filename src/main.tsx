import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { StartupErrorBoundary } from './components/StartupErrorBoundary';
import './services/apiRouting';
import { FirebaseProvider } from './firebase/FirebaseContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StartupErrorBoundary>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </StartupErrorBoundary>
  </StrictMode>,
);
