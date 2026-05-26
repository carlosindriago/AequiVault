import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JournalEntryContainerComponent } from './features/journal/journal-entry-container/journal-entry-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JournalEntryContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AequiVault';
}
