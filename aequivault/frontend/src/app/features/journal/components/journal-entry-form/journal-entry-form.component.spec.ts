import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { JournalEntryFormComponent } from './journal-entry-form.component';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('JournalEntryFormComponent', () => {
  let component: JournalEntryFormComponent;
  let fixture: ComponentFixture<JournalEntryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        JournalEntryFormComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en',
          },
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalEntryFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should bind inputs to HTML fields', fakeAsync(() => {
    component.date = '2026-05-25';
    component.description = 'Test Description';
    component.status = 'POSTED';
    component.entryNumber = 'JE-2026-0001';
    component.currency = 'ARS';
    
    fixture.detectChanges();
    tick(); // Resolve ngModel async updates

    const dateInput = fixture.debugElement.query(By.css('#date')).nativeElement;
    const descTextarea = fixture.debugElement.query(By.css('#description')).nativeElement;
    const statusSelect = fixture.debugElement.query(By.css('#status')).nativeElement;
    const entryNumberInput = fixture.debugElement.query(By.css('#entryNumber')).nativeElement;
    const currencySelect = fixture.debugElement.query(By.css('#currency')).nativeElement;

    expect(dateInput.value).toBe('2026-05-25');
    expect(descTextarea.value).toBe('Test Description');
    expect(statusSelect.value).toBe('POSTED');
    expect(entryNumberInput.value).toBe('JE-2026-0001');
    expect(currencySelect.value).toBe('ARS');
  }));

  it('should hide entryNumber field when status is DRAFT', () => {
    component.status = 'DRAFT';
    fixture.detectChanges();

    const entryNumberGroup = fixture.debugElement.query(By.css('#entryNumber')).parent?.nativeElement;
    expect(entryNumberGroup.style.visibility).toBe('hidden');
  });

  it('should show entryNumber field when status is POSTED', () => {
    component.status = 'POSTED';
    fixture.detectChanges();

    const entryNumberGroup = fixture.debugElement.query(By.css('#entryNumber')).parent?.nativeElement;
    expect(entryNumberGroup.style.visibility).toBe('visible');
  });

  it('should emit changes when fields are modified', () => {
    spyOn(component.dateChange, 'emit');
    spyOn(component.descriptionChange, 'emit');
    spyOn(component.statusChange, 'emit');
    spyOn(component.entryNumberChange, 'emit');
    spyOn(component.currencyChange, 'emit');

    fixture.detectChanges();

    const dateInput = fixture.debugElement.query(By.css('#date'));
    dateInput.triggerEventHandler('ngModelChange', '2026-06-01');
    expect(component.dateChange.emit).toHaveBeenCalledWith('2026-06-01');

    const descTextarea = fixture.debugElement.query(By.css('#description'));
    descTextarea.triggerEventHandler('ngModelChange', 'New Description');
    expect(component.descriptionChange.emit).toHaveBeenCalledWith('New Description');

    const statusSelect = fixture.debugElement.query(By.css('#status'));
    statusSelect.triggerEventHandler('ngModelChange', 'POSTED');
    expect(component.statusChange.emit).toHaveBeenCalledWith('POSTED');

    const entryNumberInput = fixture.debugElement.query(By.css('#entryNumber'));
    entryNumberInput.triggerEventHandler('ngModelChange', 'JE-2026-0005');
    expect(component.entryNumberChange.emit).toHaveBeenCalledWith('JE-2026-0005');

    const currencySelect = fixture.debugElement.query(By.css('#currency'));
    currencySelect.triggerEventHandler('ngModelChange', 'EUR');
    expect(component.currencyChange.emit).toHaveBeenCalledWith('EUR');
  });
});
