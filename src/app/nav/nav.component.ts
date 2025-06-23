<<<<<<< HEAD
import { Component, ElementRef, EventEmitter, HostListener, Output, OnInit, OnDestroy } from '@angular/core';
=======
import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
<<<<<<< HEAD
export class NavComponent implements OnInit, OnDestroy {
=======
export class NavComponent {
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
  @Output() searchEvent = new EventEmitter<string>(); // Event emitter for search
  isSearchVisible = false;
  isMobile = window.innerWidth <= 768;
  searchQuery = '';
  isProfileMenuOpen = false;
<<<<<<< HEAD
  profileImage: string | null = null; 
  
  // Add new property to track if profile image has been loaded
  private profileImageLoaded = false;

  constructor(private eRef: ElementRef, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Only update profile image if it hasn't been loaded yet
    if (!this.profileImageLoaded) {
      this.updateProfileImage();
    }
    
    // Listen for profile updates but with a check to prevent unnecessary uploads
    window.addEventListener('profileUpdated', this.handleProfileUpdate.bind(this));
  }

  ngOnDestroy() {
    // Remove event listener
    window.removeEventListener('profileUpdated', this.handleProfileUpdate.bind(this));
  }

  // New method to handle profile updates with a check
  handleProfileUpdate() {
    // Check if we really need to update by comparing with stored profile hash
    const currentProfileHash = localStorage.getItem('profileImageHash');
    const newProfileHash = this.authService.getProfileImageHash();
    
    if (currentProfileHash !== newProfileHash) {
      this.updateProfileImage();
      // Store the new hash
      if (newProfileHash) {
        localStorage.setItem('profileImageHash', newProfileHash);
      }
    } else {
      console.log('Profile image unchanged, skipping update');
    }
  }

  updateProfileImage() {
    this.profileImage = this.authService.getProfileImage();
    // Mark as loaded to prevent multiple loads
    this.profileImageLoaded = true;
    console.log('Profile image updated:', this.profileImage);
  }

  // Returns the appropriate image URL based on the profile image source
  getProfileImageUrl(): string {
    if (!this.profileImage) {
      return 'assets/pfp-default/profile-icon.jpg';
    }
    
    // Check if it's an absolute URL (like from Google)
    if (this.profileImage.startsWith('http')) {
      return this.profileImage;
    }
    
    // Check if it's a local asset
    if (this.profileImage.startsWith('assets/')) {
      return this.profileImage;
    }
    
    // Get just the filename, as profile.foodhubrecipe.shop already points to uploads/profiles
    let imagePath = this.profileImage;
    
    // If the path includes uploads/profiles, extract just the filename
    if (imagePath.includes('uploads/profiles/')) {
      // Extract just the filename part
      imagePath = imagePath.split('uploads/profiles/')[1];
    }
    
    // Return the complete URL - the subdomain already points to the profiles directory
    return 'https://profile.foodhubrecipe.shop/' + imagePath;
  }
=======
  profileImage: string | null = null; // Set this based on your user service

  constructor(private eRef: ElementRef,  private router: Router, private authService: AuthService) {}
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016

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

<<<<<<< HEAD
=======
 
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
<<<<<<< HEAD
  
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
  // Emit search event
  onSearch() {
    this.searchEvent.emit(this.searchQuery);
  }
}
