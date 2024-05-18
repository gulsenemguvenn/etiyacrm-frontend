import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-confirm-exit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './confirm-exit.component.html',
  styleUrl: './confirm-exit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmExitComponent {
  @Input() message: string;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('confirmModal') confirmModalRef: ElementRef;
  showModal: boolean = true;

  private modalInstance: any;

  openModal() {
    this.showModal = true;

  }
  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

}
