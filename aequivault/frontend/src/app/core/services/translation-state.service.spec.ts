import { TestBed } from '@angular/core/testing';
import { TranslationStateService } from './translation-state.service';
import { TranslocoService } from '@jsverse/transloco';

describe('TranslationStateService', () => {
  let service: TranslationStateService;
  let translocoServiceSpy: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    localStorage.removeItem('aequivault_lang');
    translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['getActiveLang', 'setActiveLang']);
    translocoServiceSpy.getActiveLang.and.returnValue('en');

    TestBed.configureTestingModule({
      providers: [
        TranslationStateService,
        { provide: TranslocoService, useValue: translocoServiceSpy }
      ]
    });
    service = TestBed.inject(TranslationStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize activeLanguage with value from TranslocoService', () => {
    expect(service.activeLanguage()).toBe('en');
    expect(translocoServiceSpy.getActiveLang).toHaveBeenCalled();
  });

  it('should update signal and call transloco setActiveLang on setLanguage', () => {
    service.setLanguage('es');
    expect(service.activeLanguage()).toBe('es');
    expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
    expect(localStorage.getItem('aequivault_lang')).toBe('es');
  });

  it('should initialize with saved language from localStorage if present', () => {
    localStorage.setItem('aequivault_lang', 'es');
    const testService = new TranslationStateService(translocoServiceSpy);
    expect(testService.activeLanguage()).toBe('es');
    expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
  });
});
