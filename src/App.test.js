import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@testing-library/jest-dom';
// // Mock Firebase
// jest.mock('./firebase/firebaseConfig', () => ({
//   initializeApp: jest.fn(),
//   getAnalytics: jest.fn(),
//   getAuth: jest.fn(() => ({})),
//   getFirestore: jest.fn(),
//   getStorage: jest.fn(),
//   signOut: jest.fn(),
// }));

// Mock firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
}));


// Mock AuthContext
jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    logout: jest.fn(),
  }),
}));

test('renders Q&A Forum title', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  expect(screen.getByText('Q&A Forum')).toBeInTheDocument();
});
