import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { JournalEntryStateService } from '../../../core/services/journal-entry-state.service';
import { AccountService } from '../../../core/services/account.service';
import { JournalService } from '../../../core/services/journal.service';
import { LedgerAccountDto } from '../../../core/models/ledger-account.model';
import { JournalEntryRequest } from '../../../core/models/journal-entry.model';
import { JournalLineTableComponent } from '../components/journal-line-table/journal-line-table.component';
import { JournalEntrySummaryComponent } from '../components/journal-entry-summary/journal-entry-summary.component';
import { JournalEntryFormComponent } from '../components/journal-entry-form/journal-entry-form.component';
import { CoaManagerComponent } from '../coa-manager/coa-manager.component';
import { ReportContainerComponent } from '../report-container/report-container.component';
import { DashboardContainerComponent } from '../dashboard-container/dashboard-container.component';
import { LedgerContainerComponent } from '../ledger-container/ledger-container.component';
import { SettingsContainerComponent } from '../settings-container/settings-container.component';
import { TranslationStateService } from '../../../core/services/translation-state.service';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-journal-entry-container',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JournalLineTableComponent,
    JournalEntrySummaryComponent,
    JournalEntryFormComponent,
    CoaManagerComponent,
    ReportContainerComponent,
    DashboardContainerComponent,
    LedgerContainerComponent,
    SettingsContainerComponent,
    TranslocoDirective,
    TranslocoPipe
  ],
  template: `
    <div class="app-layout" *transloco="let t">
      <!-- Left Sidebar Navigation -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <svg class="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#c084fc" />
                <stop offset="50%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#34d399" />
              </linearGradient>
            </defs>
            <path d="M50 15 L18 85 H36 L50 50 L64 85 H82 Z" fill="url(#logo-grad)" />
            <path d="M50 50 L40 72 H60 Z" fill="#0b0f19" opacity="0.9" />
            <circle cx="50" cy="50" r="3" fill="#34d399" />
          </svg>
          <h1 class="brand-name">AequiVault</h1>
        </div>

        <nav class="sidebar-menu">
          <button 
            type="button" 
            class="menu-btn" 
            [class.active]="activeTab() === 'dashboard'"
            (click)="activeTab.set('dashboard')">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            {{ t('sidebar.dashboard') }}
          </button>
          
          <button 
            type="button" 
            class="menu-btn" 
            [class.active]="activeTab() === 'ledger'"
            (click)="activeTab.set('ledger')">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            {{ t('sidebar.ledger') }}
          </button>

          <button 
            type="button" 
            class="menu-btn" 
            [class.active]="activeTab() === 'entry'"
            (click)="activeTab.set('entry')">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            {{ t('sidebar.journals') }}
          </button>

          <button 
            type="button" 
            class="menu-btn" 
            [class.active]="activeTab() === 'coa'"
            (click)="activeTab.set('coa')">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            {{ t('sidebar.coa') }}
          </button>

          <button 
            type="button" 
            class="menu-btn" 
            [class.active]="activeTab() === 'reports'"
            (click)="activeTab.set('reports')">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            {{ t('sidebar.reports') }}
          </button>

          <button 
            type="button" 
            class="menu-btn" 
            [class.active]="activeTab() === 'settings'"
            (click)="activeTab.set('settings')">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            {{ t('sidebar.settings') }}
          </button>
        </nav>
      </aside>

      <!-- Right Main Workspace Panel -->
      <main class="main-content">
        <header class="top-header">
          <div class="header-title-section">
            <h2 class="page-title">
              @if (activeTab() === 'entry') {
                {{ t('header.new_entry') }}
              } @else if (activeTab() === 'ledger') {
                {{ t('sidebar.ledger') }}
              } @else if (activeTab() === 'coa') {
                {{ t('sidebar.coa') }}
              } @else if (activeTab() === 'reports') {
                {{ t('sidebar.reports') }}
              } @else if (activeTab() === 'dashboard') {
                {{ t('sidebar.dashboard') }}
              } @else if (activeTab() === 'settings') {
                {{ t('sidebar.settings') }}
              }
            </h2>
            <span class="entry-sublabel">{{ state.entryNumber() || 'JE-2024-03-15' }}</span>
          </div>

          <div class="header-actions">
            <!-- Language Selector Dropdown -->
            <div class="lang-selector-container">
              <select 
                [ngModel]="translationState.activeLanguage()" 
                (ngModelChange)="onLanguageChange($event)"
                class="lang-select">
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
            </div>

            <!-- Notification Bell Icon with Badge -->
            <div class="notification-container">
              <button type="button" class="notification-btn" (click)="toggleNotificationMenu()">
                <svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                @if (unreadCount() > 0) {
                  <span class="notification-badge">{{ unreadCount() }}</span>
                }
              </button>

              @if (isNotificationMenuOpen()) {
                <div class="notification-dropdown glass-panel">
                  <div class="dropdown-header">
                    <h4>{{ t('notifications.title') }}</h4>
                  </div>
                  <div class="dropdown-body">
                    @if (notifications().length > 0) {
                      <div class="notification-list">
                        @for (notif of notifications(); track notif.id) {
                          <div class="notification-item">
                            <div class="notification-item-content">
                              <h5>{{ notif.title }}</h5>
                              <p>{{ notif.message }}</p>
                              <span class="notification-time">{{ formatTime(notif.createdAt) }}</span>
                            </div>
                            <button class="btn-read" (click)="markAsRead(notif.id, $event)" title="Mark as read">
                              ✓
                            </button>
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="no-notifications">{{ t('notifications.empty') }}</p>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- User Profile drop info -->
            <div class="user-profile" (click)="toggleProfileMenu()">
              <div class="avatar-container">
                <svg class="avatar-svg" viewBox="0 0 32 32">
                  <defs>
                    <linearGradient id="avatar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#a78bfa" />
                      <stop offset="100%" stop-color="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <circle cx="16" cy="16" r="16" fill="url(#avatar-grad)" />
                  <path d="M16 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-8 16c0-4.4 3.6-8 8-8s8 3.6 8 8v1h-16v-1z" fill="#ffffff" opacity="0.95"/>
                </svg>
              </div>
              <div class="user-info">
                <span class="user-name">{{ userName() }}</span>
                <span class="user-org">{{ tenantName() }}</span>
              </div>
              <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>

              <!-- Profile Dropdown -->
              @if (isProfileMenuOpen()) {
                <div class="profile-dropdown glass-panel">
                  <button type="button" class="dropdown-item logout-item" (click)="onLogout($event)">
                    <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout / Cerrar Sesión
                  </button>
                </div>
              }
            </div>
          </div>
        </header>



        <!-- Notification Banner -->
        @if (notification(); as notif) {
          <div class="notification-banner" [ngClass]="notif.type === 'success' ? 'notif-success' : 'notif-error'">
            <div class="notif-header">
              <strong>{{ notif.title }}</strong>
              <button (click)="clearNotification()" class="btn-close-notif">✕</button>
            </div>
            <p class="notif-detail">{{ notif.detail }}</p>
            @if (notif.errors) {
              <ul class="notif-errors-list">
                @for (err of notif.errors; track err) {
                  <li>• {{ err }}</li>
                }
              </ul>
            }
          </div>
        }

        <!-- Workspace content -->
        <div class="workspace-content">
          @if (activeTab() === 'entry') {
            <div class="entry-workspace animate-workspace">
              <!-- Collapsible Options Panel for Form Details (keeps standard Angular inputs testable) -->
              <details class="metadata-details">
                <summary class="metadata-summary">
                  <span>🛠️ {{ t('journal.options_title') }}</span>
                </summary>
                <div class="metadata-content">
                  <app-journal-entry-form
                    [date]="state.date()"
                    [description]="state.description()"
                    [entryNumber]="state.entryNumber()"
                    [status]="state.status()"
                    [currency]="state.currency()"
                    (dateChange)="state.date.set($event)"
                    (descriptionChange)="state.description.set($event)"
                    (entryNumberChange)="state.entryNumber.set($event)"
                    (statusChange)="state.status.set($event)"
                    (currencyChange)="state.currency.set($event)">
                    
                    <div style="display:none;"></div>
                  </app-journal-entry-form>
                </div>
              </details>

              <!-- Central Premium Glass Card -->
              <div class="journal-card glass-panel">
                <div class="card-header">
                  <span class="date-label">{{ t('journal.transaction_date') }}</span>
                  <div class="date-picker-wrapper">
                    <span class="formatted-date">{{ displayDate() }}</span>
                    <input 
                      type="date" 
                      class="date-native-input"
                      [ngModel]="state.date()"
                      (ngModelChange)="state.date.set($event)" />
                  </div>
                </div>

                <!-- Concept/Description text area or input field styled elegantly -->
                <div class="concept-input-container">
                  <input 
                    type="text" 
                    class="concept-input" 
                    [placeholder]="t('journal.description_placeholder')"
                    [ngModel]="state.description()" 
                    (ngModelChange)="state.description.set($event)" />
                </div>

                <!-- Core Ledger Lines Table component -->
                <app-journal-line-table
                  [lines]="state.lines()"
                  [accounts]="accounts()"
                  [description]="state.description()"
                  (addLine)="state.addLine()"
                  (removeLine)="state.removeLine($event)"
                  (updateLine)="state.updateLine($event.id, $event.field, $event.value)">
                </app-journal-line-table>

                <!-- Totals & Status indicators footer inside the Card -->
                <div class="card-footer">
                  <div class="summary-line">
                    <span class="totals-label">{{ t('journal.totals') }}</span>
                    <div class="totals-values">
                      <span class="total-val debit-total">{{ state.debitSum() | currency: state.currency() }}</span>
                      <span class="total-val credit-total">{{ state.creditSum() | currency: state.currency() }}</span>
                    </div>
                  </div>

                  <div class="status-pill-container">
                    <div class="status-pill" [class.balanced]="state.isBalanced()">
                      <span class="status-icon">
                        @if (state.isBalanced()) {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        } @else {
                          ⚠️
                        }
                      </span>
                      <span class="status-text">
                        {{ t('journal.status_label') }}: {{ state.isBalanced() ? t('journal.status_balanced_short') : t('journal.status_unbalanced_short') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Main Submission and Reset Buttons -->
              <div class="submit-bar">
                <button 
                  type="button" 
                  (click)="resetForm()" 
                  class="btn btn-secondary">
                  {{ t('journal.reset_form') }}
                </button>
                <button 
                  type="button" 
                  [disabled]="!state.canSubmit() || isLoading()" 
                  (click)="submitEntry()" 
                  class="btn btn-primary">
                  @if (isLoading()) {
                    {{ t('journal.processing') }}
                  } @else {
                    {{ t('journal.post_entry') }}
                  }
                </button>
              </div>
            </div>
          }

          @if (activeTab() === 'dashboard') {
            <div class="dashboard-workspace animate-workspace">
              <app-dashboard-container 
                [tenantId]="activeTenantId()">
              </app-dashboard-container>
            </div>
          }

          @if (activeTab() === 'coa') {
            <div class="coa-workspace animate-workspace">
              <app-coa-manager 
                [tenantId]="activeTenantId()" 
                (catalogChanged)="fetchAccounts()">
              </app-coa-manager>
            </div>
          }

          @if (activeTab() === 'reports') {
            <div class="reports-workspace animate-workspace">
              <app-report-container 
                [tenantId]="activeTenantId()">
              </app-report-container>
            </div>
          }

          @if (activeTab() === 'ledger') {
            <div class="ledger-workspace animate-workspace">
              <app-ledger-container 
                [tenantId]="activeTenantId()">
              </app-ledger-container>
            </div>
          }

          @if (activeTab() === 'settings') {
            <div class="settings-workspace animate-workspace">
              <app-settings-container>
              </app-settings-container>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      width: 100vw;
      height: 100vh;
      background-color: #0b0f19;
      overflow: hidden;
      font-family: var(--font-family);
    }

    /* Left Sidebar */
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 260px;
      flex-shrink: 0;
      background: #090c15;
      border-right: 1.5px solid rgba(255, 255, 255, 0.05);
      padding: 2rem 0.75rem;
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1.25rem;
      margin-bottom: 3rem;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
    }
    h1.brand-name {
      color: #ffffff;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      background: none;
      -webkit-text-fill-color: initial;
      margin: 0;
    }
    .sidebar-menu {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .menu-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1.5px solid transparent;
      background: transparent;
      color: #64748b;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition-smooth);
      text-align: left;
      width: 100%;
    }
    .menu-btn:hover {
      background: rgba(255, 255, 255, 0.03);
      color: #f8fafc;
    }
    .menu-btn.active {
      background: linear-gradient(135deg, rgba(167, 139, 250, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%);
      border: 1.5px solid rgba(167, 139, 250, 0.35);
      color: #ffffff;
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.15);
    }
    .menu-icon {
      width: 18px;
      height: 18px;
      stroke-width: 2px;
      color: #64748b;
      transition: color 0.2s;
    }
    .menu-btn.active .menu-icon {
      color: #c084fc;
    }
    .menu-btn:hover .menu-icon {
      color: #f8fafc;
    }

    /* Main Right Content Panel */
    .main-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 2.5rem 3rem;
      overflow-y: auto;
      min-width: 0;
      position: relative;
    }
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2.5rem;
    }
    .header-title-section .page-title {
      font-size: 2rem;
      font-weight: 600;
      color: #f8fafc;
      margin: 0;
      background: none;
      -webkit-text-fill-color: initial;
    }
    .entry-sublabel {
      font-size: 0.9rem;
      color: #64748b;
      display: block;
      margin-top: 0.25rem;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .lang-selector-container {
      display: flex;
      align-items: center;
    }
    .lang-select {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 0.35rem 0.65rem;
      font-size: 0.85rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .lang-select:focus, .lang-select:hover {
      border-color: var(--color-primary);
      background: rgba(15, 23, 42, 0.6);
    }
    .lang-select option {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
    .notification-container {
      position: relative;
    }
    .notification-btn {
      position: relative;
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: var(--transition-smooth);
    }
    .notification-btn:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.04);
    }
    .bell-icon {
      width: 20px;
      height: 20px;
    }
    .notification-badge {
      position: absolute;
      top: 0px;
      right: 0px;
      min-width: 16px;
      height: 16px;
      background-color: #ef4444;
      border-radius: 9999px;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
    }
    .notification-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 320px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .dropdown-header h4 {
      margin: 0;
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 600;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.5rem;
      text-align: left;
    }
    .notification-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .notification-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.6rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: var(--transition-smooth);
    }
    .notification-item:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.08);
    }
    .notification-item-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex-grow: 1;
      text-align: left;
    }
    .notification-item-content h5 {
      margin: 0;
      color: #f8fafc;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .notification-item-content p {
      margin: 0;
      color: #94a3b8;
      font-size: 0.75rem;
      line-height: 1.3;
    }
    .notification-time {
      font-size: 0.65rem;
      color: #64748b;
    }
    .btn-read {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      cursor: pointer;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: var(--transition-smooth);
      flex-shrink: 0;
    }
    .btn-read:hover {
      background: rgba(99, 102, 241, 0.3);
      color: #ffffff;
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
    }
    .no-notifications {
      margin: 0;
      padding: 1.5rem 0;
      color: #64748b;
      font-size: 0.85rem;
      text-align: center;
    }
    .user-profile {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(15, 23, 42, 0.4);
      padding: 0.4rem 0.85rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .user-profile:hover {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(15, 23, 42, 0.6);
    }
    .profile-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 200px;
      background: rgba(9, 12, 21, 0.95);
      border: 1.5px solid var(--border-glass);
      border-radius: 10px;
      padding: 0.5rem;
      box-shadow: var(--shadow-premium);
      z-index: 100;
      animation: fadeIn 0.2s ease-out;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.6rem 0.85rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: var(--transition-smooth);
      text-align: left;
    }
    .dropdown-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
    }
    .logout-item:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
    }
    .logout-icon {
      width: 16px;
      height: 16px;
    }
    .avatar-container {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
    }
    .avatar-svg {
      width: 100%;
      height: 100%;
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      color: #f8fafc;
      font-size: 0.85rem;
      font-weight: 500;
      line-height: 1.2;
    }
    .user-org {
      color: #64748b;
      font-size: 0.75rem;
      line-height: 1.2;
    }
    .chevron-icon {
      width: 16px;
      height: 16px;
      color: #64748b;
    }



    /* Core Journal Card */
    .journal-card {
      padding: 2.5rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
      margin-bottom: 2rem;
      transition: var(--transition-smooth);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.5rem;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
    }
    .date-label {
      font-size: 1.05rem;
      font-weight: 500;
      color: #94a3b8;
    }
    .date-picker-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      background: rgba(15, 23, 42, 0.6);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 0.5rem 1.25rem;
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .date-picker-wrapper:hover {
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(15, 23, 42, 0.8);
    }
    .formatted-date {
      font-size: 0.95rem;
      font-weight: 500;
      color: #ffffff;
    }
    .date-native-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    /* Concept area */
    .concept-input-container {
      margin-top: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
    }
    .concept-input {
      width: 100%;
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 1.05rem;
      font-weight: 400;
      outline: none;
      padding: 0.25rem 0.5rem;
      font-family: var(--font-family);
    }
    .concept-input::placeholder {
      color: #64748b;
    }

    /* Card Footer and Totals */
    .card-footer {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1.5px solid rgba(255, 255, 255, 0.08);
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .totals-label {
      font-size: 1.05rem;
      font-weight: 600;
      color: #ffffff;
    }
    .totals-values {
      display: flex;
      /* Align values to debit/credit inputs in table, 140px width + 40px action column spacer */
      padding-right: 40px;
      gap: 0;
    }
    .total-val {
      font-size: 1.05rem;
      font-weight: 600;
      width: 140px;
      text-align: right;
    }
    .debit-total {
      color: #ffffff;
    }
    .credit-total {
      color: #ffffff;
    }

    /* Status Pill (emerald color pill bottom right) */
    .status-pill-container {
      display: flex;
      justify-content: flex-end;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.25rem;
      border-radius: 24px;
      font-size: 0.95rem;
      font-weight: 600;
      transition: var(--transition-smooth);
    }
    .status-pill.balanced {
      background: rgba(16, 185, 129, 0.1);
      border: 1.5px solid #10b981;
      color: #34d399;
    }
    .status-pill.balanced .status-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
    }
    .status-pill.balanced .status-icon svg {
      width: 14px;
      height: 14px;
      stroke-width: 3px;
    }
    .status-pill:not(.balanced) {
      background: rgba(239, 68, 68, 0.1);
      border: 1.5px solid #ef4444;
      color: #fca5a5;
    }

    /* Metadata details collapsible block */
    .metadata-details {
      margin-bottom: 1.5rem;
      background: rgba(15, 23, 42, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      overflow: hidden;
      transition: var(--transition-smooth);
    }
    .metadata-summary {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #94a3b8;
      cursor: pointer;
      user-select: none;
      transition: var(--transition-smooth);
    }
    .metadata-summary:hover {
      background: rgba(255, 255, 255, 0.02);
      color: #f8fafc;
    }
    .metadata-content {
      padding: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .submit-bar {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    /* Notifications Banner */
    .notification-banner {
      padding: 1rem 1.25rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      border-left: 4px solid;
      font-size: 0.9rem;
      box-shadow: var(--shadow-premium);
      animation: fadeIn 0.3s ease-out;
    }
    .notif-success {
      background-color: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-left-color: #10b981;
      color: #a7f3d0;
    }
    .notif-error {
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-left-color: #ef4444;
      color: #fca5a5;
    }
    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }
    .btn-close-notif {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1rem;
    }
    .notif-detail {
      line-height: 1.4;
    }
    .notif-errors-list {
      margin-top: 0.5rem;
      padding-left: 1.25rem;
      list-style-type: disc;
    }

    .animate-workspace {
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class JournalEntryContainerComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Signals
  activeTenantId = signal<string>(this.authService.currentUser()?.tenantId || '');
  accounts = signal<LedgerAccountDto[]>([]);
  isLoading = signal<boolean>(false);
  activeTab = signal<'dashboard' | 'ledger' | 'entry' | 'coa' | 'reports' | 'settings'>('dashboard');
  isProfileMenuOpen = signal<boolean>(false);
  isNotificationMenuOpen = signal<boolean>(false);

  notifications = this.notificationService.unreadNotifications;
  unreadCount = computed(() => this.notifications().length);

  userName = computed(() => {
    const email = this.authService.currentUser()?.email || '';
    if (!email) return 'User';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  });

  tenantName = computed(() => {
    const email = this.authService.currentUser()?.email || '';
    if (!email) return 'AequiVault';
    const domainPart = email.split('@')[1];
    if (!domainPart) return 'AequiVault Tenant';
    const company = domainPart.split('.')[0];
    return company.charAt(0).toUpperCase() + company.slice(1);
  });
  
  displayDate = computed(() => {
    const rawDate = this.state.date();
    if (!rawDate) return '';
    const dateObj = new Date(rawDate + 'T12:00:00'); // Prevent timezone offset issues
    const lang = this.translationState.activeLanguage();
    const locale = lang === 'es' ? 'es-ES' : 'en-US';
    return dateObj.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  });
  
  notification = signal<{
    type: 'success' | 'error';
    title: string;
    detail: string;
    errors?: string[];
  } | null>(null);

  constructor(
    public state: JournalEntryStateService,
    private accountService: AccountService,
    private journalService: JournalService,
    public translationState: TranslationStateService,
    private translocoService: TranslocoService
  ) {}

  private pollingIntervalId: any;

  ngOnInit() {
    this.fetchAccounts();
    this.loadNotifications();
    this.startNotificationPolling();
  }

  ngOnDestroy() {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }
  }

  loadNotifications() {
    this.notificationService.loadUnreadNotifications().subscribe({
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  startNotificationPolling() {
    this.pollingIntervalId = setInterval(() => {
      this.loadNotifications();
    }, 10000); // Poll every 10 seconds
  }

  toggleNotificationMenu() {
    this.isNotificationMenuOpen.update(val => !val);
  }

  markAsRead(id: string, event: Event) {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe();
  }

  formatTime(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen.update(val => !val);
  }

  onLogout(event: Event) {
    event.stopPropagation();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onTenantChange(newTenantId: string) {
    this.activeTenantId.set(newTenantId);
    this.fetchAccounts();
    this.state.reset(); // Reset form when switching tenant contexts to prevent crossing details
  }

  onLanguageChange(lang: 'en' | 'es') {
    this.translationState.setLanguage(lang);
  }

  fetchAccounts() {
    this.isLoading.set(true);
    this.accountService.getAccounts(this.activeTenantId()).subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.showErrorNotification(
          this.translocoService.translate('journal.error_accounts_title', {}, this.translationState.activeLanguage()),
          this.translocoService.translate('journal.error_accounts_detail', {}, this.translationState.activeLanguage())
        );
        this.isLoading.set(false);
      }
    });
  }

  submitEntry() {
    if (!this.state.canSubmit()) return;

    this.isLoading.set(true);
    this.clearNotification();

    // Mapear líneas locales al contrato de backend
    const payloadLines = this.state.lines().map(l => ({
      ledgerAccountId: l.ledgerAccountId,
      amount: l.amount || 0,
      type: l.type
    }));

    const requestPayload: JournalEntryRequest = {
      date: this.state.date(),
      description: this.state.description() || 'Asiento registrado desde Frontend',
      status: this.state.status(),
      entryNumber: this.state.status() === 'POSTED' ? this.state.entryNumber() : undefined,
      currency: this.state.currency(),
      lines: payloadLines
    };

    this.journalService.createEntry(requestPayload, this.activeTenantId()).subscribe({
      next: (response) => {
        this.notification.set({
          type: 'success',
          title: this.translocoService.translate('journal.success_title', {}, this.translationState.activeLanguage()),
          detail: this.translocoService.translate('journal.success_detail', { status: response.status, id: response.id }, this.translationState.activeLanguage())
        });
        this.state.reset();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleHttpError(err);
        this.isLoading.set(false);
      }
    });
  }

  resetForm() {
    this.state.reset();
    this.clearNotification();
  }

  clearNotification() {
    this.notification.set(null);
  }

  private showErrorNotification(title: string, detail: string, errors?: string[]) {
    this.notification.set({
      type: 'error',
      title,
      detail,
      errors
    });
  }

  private handleHttpError(err: any) {
    // Si el backend responde con un ProblemDetail (RFC 7807)
    if (err.error && err.error.title) {
      const title = err.error.title;
      const detail = err.error.detail || 'Ocurrió un error inesperado al procesar la solicitud.';
      
      let errorDetails: string[] = [];
      if (err.error.errors) {
        // Mapear campos de error sintácticos (de javax/jakarta validation)
        errorDetails = Object.keys(err.error.errors).map(field => {
          const fieldErrs = err.error.errors[field] as string[];
          return `${field}: ${fieldErrs.join(', ')}`;
        });
      }
      
      this.showErrorNotification(title, detail, errorDetails.length > 0 ? errorDetails : undefined);
    } else {
      this.showErrorNotification(
        this.translocoService.translate('journal.error_connection_title', {}, this.translationState.activeLanguage()),
        this.translocoService.translate('journal.error_connection_detail', {}, this.translationState.activeLanguage())
      );
    }
  }
}
