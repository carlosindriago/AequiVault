import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsContainerComponent } from './settings-container.component';
import { TranslationStateService } from '../../../core/services/translation-state.service';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { By } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

describe('SettingsContainerComponent', () => {
  let component: SettingsContainerComponent;
  let fixture: ComponentFixture<SettingsContainerComponent>;
  let translationStateService: TranslationStateService;
  let doc: Document;

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
        TranslationStateService
      ]
    }).compileComponents();

    translationStateService = TestBed.inject(TranslationStateService);
    doc = TestBed.inject(DOCUMENT);

    fixture = TestBed.createComponent(SettingsContainerComponent);
    component = fixture.componentInstance;
    component.tenantId = '212f7927-ed0d-495c-b39b-94364d5e2f9b';
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
});
