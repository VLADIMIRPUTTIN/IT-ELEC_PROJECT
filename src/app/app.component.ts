import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None // This will make styles global
})
export class AppComponent implements AfterViewInit {
  title = 'food-hub';

  ngAfterViewInit() {
    const scrollableElement = document.querySelector('.scrollable') as HTMLElement;

    // Show scrollbar when scrolling
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', () => {
        scrollableElement.classList.add('show-scrollbar');

        // Remove the class after a short delay to hide the scrollbar
        clearTimeout((scrollableElement as any).scrollTimeout);
        (scrollableElement as any).scrollTimeout = setTimeout(() => {
          scrollableElement.classList.remove('show-scrollbar');
        }, 100); // Adjust delay as needed
      });
    }
  }
}
