import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthInitializer } from './components/route'
import './index.css'
import App from './App.tsx'

// Import debug utilities (only in development)
if (process.env.NODE_ENV === 'development') {
  import('./utils/debugAuth');
  import('./utils/authPersistenceTest');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthInitializer>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthInitializer>
    </Provider>
  </StrictMode>,
)
