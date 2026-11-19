import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-learn2step-logo',
  standalone: true,
  template: '<img src="assets/learn2step-logo.svg" [attr.width]="width" [attr.height]="height" [class]="className" alt="Learn2Step Logo" role="img" aria-label="Learn2Step Logo" />',
  styles: [':host { display: inline-block; line-height: 0; } img { display: block; max-width: 100%; height: auto; object-fit: contain; }'],
})
export class Learn2StepLogoComponent {
  @Input() width: number | string = 260;
  @Input() height: number | string = 150;
  @Input() className = '';
}
