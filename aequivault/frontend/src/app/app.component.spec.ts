import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AccountService } from './core/services/account.service';
import { JournalService } from './core/services/journal.service';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let journalServiceSpy: jasmine.SpyObj<JournalService>;

  beforeEach(async () => {
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['getAccounts']);
    journalServiceSpy = jasmine.createSpyObj('JournalService', ['createEntry']);

    accountServiceSpy.getAccounts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: JournalService, useValue: journalServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'AequiVault' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('AequiVault');
  });

  it('should render container component title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('AequiVault');
  });
});
