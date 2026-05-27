import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AccountService } from './core/services/account.service';
import { JournalService } from './core/services/journal.service';
import { DashboardService } from './core/services/dashboard.service';
import { TranslationStateService } from './core/services/translation-state.service';
import { JournalEntryStateService } from './core/services/journal-entry-state.service';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let journalServiceSpy: jasmine.SpyObj<JournalService>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  beforeEach(async () => {
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['getAccounts']);
    journalServiceSpy = jasmine.createSpyObj('JournalService', ['createEntry']);
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getDashboard']);

    accountServiceSpy.getAccounts.and.returnValue(of([]));
    dashboardServiceSpy.getDashboard.and.returnValue(of({
      totalAssets: 0,
      totalLiabilities: 0,
      netEquity: 0,
      liquidityTrend: []
    }));

    const mockTranslationService = {
      activeLanguage: () => 'en',
      setLanguage: jasmine.createSpy('setLanguage')
    };

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en' }
        })
      ],
      providers: [
        JournalEntryStateService,
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: JournalService, useValue: journalServiceSpy },
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: TranslationStateService, useValue: mockTranslationService }
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
