import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-filter-chip',
  template: `<button type="button" [class.active]="active()" [attr.aria-pressed]="active()" (click)="selected.emit(label())">{{ label() }}</button>`,
  styleUrl: './filter-chip.component.scss',
})
export class FilterChipComponent {
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly selected = output<string>();
}
