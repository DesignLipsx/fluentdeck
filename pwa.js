// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Handle before install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Update UI to notify the user they can install the PWA
  showInstallPromotion();
});

// Show install button function
function showInstallPromotion() {
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', async () => {
      // Hide the app provided install promotion
      installButton.style.display = 'none';
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      // We've used the prompt, and can't use it again, discard it
      deferredPrompt = null;
    });
  }
}

// Track successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('Fluent Deck was installed successfully!');
  // Hide the install button if it's visible
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.style.display = 'none';
  }
});