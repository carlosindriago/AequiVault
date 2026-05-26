import { TestBed } from '@angular/core/testing';
import { TranslationStateService } from './translation-state.service';
import { TranslocoService } from '@jsverse/transloco';

describe('TranslationStateService', () => {
  let service: TranslationStateService;
  let translocoServiceSpy: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
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
  });
});
