import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsContainerComponent } from './settings-container.component';
import { TranslationStateService } from '../../../core/services/translation-state.service';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { By } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RbacService } from '../../../core/services/rbac.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('SettingsContainerComponent', () => {
  let component: SettingsContainerComponent;
  let fixture: ComponentFixture<SettingsContainerComponent>;
  let translationStateService: TranslationStateService;
  let doc: Document;

  const mockAuthService = {
    currentUser: signal({ email: 'super@omega.com', tenantId: '212f7927-ed0d-495c-b39b-94364d5e2f9b' }),
    isAuthenticated: signal(true),
    getToken: () => 'fake-token'
  };

  const mockRbacService = {
    users: signal([
      { id: '1', email: 'user1@test.com', status: 'ACTIVE', roles: [{ id: '10', name: 'ACCOUNTANT', description: 'Acc' }] }
    ]),
    roles: signal([
      { id: '10', name: 'ACCOUNTANT', description: 'Acc', permissions: [{ id: '100', name: 'JOURNAL_READ', description: 'Read' }] }
    ]),
    permissions: signal([
      { id: '100', name: 'JOURNAL_READ', description: 'Read' },
      { id: '101', name: 'JOURNAL_WRITE', description: 'Write' }
    ]),
    loadPermissions: () => of([]),
    loadRoles: () => of([]),
    loadUsers: () => of([]),
    createRole: () => of({ id: '12', name: 'NEW_ROLE', description: '', permissions: [] }),
    updateRole: () => of({ id: '10', name: 'ACCOUNTANT', description: 'Updated', permissions: [] }),
    createUser: () => of({ id: '3', email: 'new@test.com', status: 'ACTIVE', roles: [] }),
    deactivateUser: () => of(undefined),
    reactivateUser: () => of(undefined)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SettingsContainerComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en',
          },
        })
      ],
      providers: [
        TranslationStateService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: RbacService, useValue: mockRbacService }
      ]
    }).compileComponents();

    translationStateService = TestBed.inject(TranslationStateService);
    doc = TestBed.inject(DOCUMENT);

    fixture = TestBed.createComponent(SettingsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the correct tenant details', () => {
    const infoValues = fixture.debugElement.queryAll(By.css('.info-value'));
    expect(infoValues[0].nativeElement.textContent.trim()).toBe('212f7927-ed0d-495c-b39b-94364d5e2f9b');
  });

  it('should trigger language change', () => {
    spyOn(translationStateService, 'setLanguage').and.callThrough();
    component.onLanguageChange('es');
    expect(translationStateService.setLanguage).toHaveBeenCalledWith('es');
    expect(translationStateService.activeLanguage()).toBe('es');
  });

  it('should toggle dark/light theme classes on body using Renderer2 and DOCUMENT', () => {
    // Mock the body property getter after component mounting to isolate DOM changes
    const mockBody = document.createElement('div');
    spyOnProperty(doc, 'body', 'get').and.returnValue(mockBody as any);

    // Initially component is in dark mode (isDarkMode = true)
    expect(component.isDarkMode()).toBeTrue();
    
    // Toggle theme to light mode (isDarkMode = false)
    component.toggleTheme();
    expect(component.isDarkMode()).toBeFalse();
    expect(mockBody.classList.contains('light-theme')).toBeTrue();
    expect(mockBody.classList.contains('dark-theme')).toBeFalse();

    // Toggle theme back to dark mode (isDarkMode = true)
    component.toggleTheme();
    expect(component.isDarkMode()).toBeTrue();
    expect(mockBody.classList.contains('dark-theme')).toBeTrue();
    expect(mockBody.classList.contains('light-theme')).toBeFalse();
  });

  it('should render roles in the left panel', () => {
    component.setTab('roles');
    fixture.detectChanges();

    const roleRows = fixture.debugElement.queryAll(By.css('.role-item-row'));
    expect(roleRows.length).toBe(1);
    expect(roleRows[0].nativeElement.textContent).toContain('ACCOUNTANT');
  });

  it('should render permissions checklist', () => {
    component.setTab('roles');
    fixture.detectChanges();

    const checkRows = fixture.debugElement.queryAll(By.css('.checkbox-row'));
    expect(checkRows.length).toBe(2);
    expect(checkRows[0].nativeElement.textContent).toContain('JOURNAL_READ');
    expect(checkRows[1].nativeElement.textContent).toContain('JOURNAL_WRITE');
  });
});
