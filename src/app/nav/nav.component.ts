import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  @Output() searchEvent = new EventEmitter<string>(); // Event emitter for search
  isSearchVisible = false;
  isMobile = window.innerWidth <= 768;
  searchQuery = '';
  isProfileMenuOpen = false;
  profileImage: string | null = null; // Set this based on your user service

  constructor(private eRef: ElementRef,  private router: Router, private authService: AuthService) {}

  toggleSearchVisibility() {
    if (this.isMobile) {
      this.isSearchVisible = !this.isSearchVisible;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768; // Update isMobile on resize
    if (!this.isMobile) {
      this.isSearchVisible = false; // Hide search bar on desktop view
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen = false;
    }
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  navigateToProfile() {
    this.router.navigate(['/user-profile']);
  }

 
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  // Emit search event
  onSearch() {
    this.searchEvent.emit(this.searchQuery);
  }
}
