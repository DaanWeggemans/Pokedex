import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';

@Directive({
  selector: 'img[fallback]',
})
export class ImgFallback {
  @Input({ required: true }) fallback!: string;
  reference = inject(ElementRef);

  @HostListener('error')
  onError() {
    const element: HTMLImageElement = this.reference.nativeElement;
    element.onerror = null; 
    element.classList.add("img-failed");
    element.src = this.fallback;
  }
}
