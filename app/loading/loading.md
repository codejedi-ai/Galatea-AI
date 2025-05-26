/* Loading-specific styles */

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--background);
  color: var(--foreground);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
