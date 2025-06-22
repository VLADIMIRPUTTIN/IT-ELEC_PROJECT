import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pwa-install-prompt',
  templateUrl: './pwa-install-prompt.component.html',
  styleUrls: ['./pwa-install-prompt.component.scss']
})
export class PwaInstallPromptComponent implements OnInit {
  deferredPrompt: any;
  showButton = false;

  constructor() { }

  ngOnInit(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      // Update UI to show the install button
      this.showButton = true;
    });

    window.addEventListener('appinstalled', () => {
      // Hide the button when app is installed
      this.showButton = false;
      console.log('PWA was installed');
    });
  }

  installPwa(): void {
    if (!this.deferredPrompt) {
      return;
    }
    // Hide the button
    this.showButton = false;
    // Show the install prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      this.deferredPrompt = null;
    });
  }
  
  // New method to dismiss the prompt
  dismissPrompt(): void {
    this.showButton = false;
    console.log('User dismissed the install prompt manually');
    // Optionally set a flag in localStorage to not show it again for some time
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  }
}