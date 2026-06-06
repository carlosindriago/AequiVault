package com.aequivault.infrastructure.demo;

import com.aequivault.domain.model.LineType;
import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import com.aequivault.infrastructure.persistence.entity.FinancialPeriodEntity;
import com.aequivault.infrastructure.persistence.entity.JournalEntryEntity;
import com.aequivault.infrastructure.persistence.entity.JournalLineEntity;
import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
import com.aequivault.infrastructure.persistence.entity.NotificationEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataAccountGroupRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataFinancialPeriodRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataJournalEntryRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataLedgerAccountRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DemoDataSeeder {

    private final SpringDataAccountGroupRepository accountGroupRepository;
    private final SpringDataLedgerAccountRepository ledgerAccountRepository;
    private final SpringDataJournalEntryRepository journalEntryRepository;
    private final SpringDataFinancialPeriodRepository financialPeriodRepository;
    private final SpringDataNotificationRepository notificationRepository;

    public DemoDataSeeder(SpringDataAccountGroupRepository accountGroupRepository,
                          SpringDataLedgerAccountRepository ledgerAccountRepository,
                          SpringDataJournalEntryRepository journalEntryRepository,
                          SpringDataFinancialPeriodRepository financialPeriodRepository,
                          SpringDataNotificationRepository notificationRepository) {
        this.accountGroupRepository = accountGroupRepository;
        this.ledgerAccountRepository = ledgerAccountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.financialPeriodRepository = financialPeriodRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void seedTenant(UUID tenantId) {
        Map<String, AccountGroupEntity> groups = createAccountGroups(tenantId);
        Map<String, LedgerAccountEntity> accounts = createLedgerAccounts(tenantId, groups);
        createFinancialPeriods(tenantId);
        createJournalEntries(tenantId, accounts);
        createNotifications(tenantId);
    }

    private Map<String, AccountGroupEntity> createAccountGroups(UUID tenantId) {
        List<AccountGroupEntity> groups = List.of(
                new AccountGroupEntity(UUID.randomUUID(), tenantId, "Assets", "1", "1"),
                new AccountGroupEntity(UUID.randomUUID(), tenantId, "Current Assets", "11", "1.1"),
                new AccountGroupEntity(UUID.randomUUID(), tenantId, "Liabilities", "2", "2"),
                new AccountGroupEntity(UUID.randomUUID(), tenantId, "Equity", "3", "3"),
                new AccountGroupEntity(UUID.randomUUID(), tenantId, "Revenue", "4", "4"),
                new AccountGroupEntity(UUID.randomUUID(), tenantId, "Expenses", "5", "5")
        );
        accountGroupRepository.saveAll(groups);

        Map<String, AccountGroupEntity> byCode = new HashMap<>();
        for (AccountGroupEntity group : groups) {
            byCode.put(group.getCode(), group);
        }
        return byCode;
    }

    private Map<String, LedgerAccountEntity> createLedgerAccounts(UUID tenantId, Map<String, AccountGroupEntity> groups) {
        List<LedgerAccountEntity> accounts = List.of(
                account(tenantId, groups.get("11"), "1010", "Operating Bank Account", "ASSET"),
                account(tenantId, groups.get("11"), "1210", "Accounts Receivable", "ASSET"),
                account(tenantId, groups.get("11"), "1410", "Office Supplies Inventory", "ASSET"),
                account(tenantId, groups.get("2"), "2010", "Accounts Payable", "LIABILITY"),
                account(tenantId, groups.get("2"), "2210", "Sales Tax Payable", "LIABILITY"),
                account(tenantId, groups.get("3"), "3010", "Owner Capital", "EQUITY"),
                account(tenantId, groups.get("4"), "4010", "Professional Services Revenue", "REVENUE"),
                account(tenantId, groups.get("4"), "4020", "Implementation Revenue", "REVENUE"),
                account(tenantId, groups.get("5"), "5010", "Cloud Hosting Expense", "EXPENSE"),
                account(tenantId, groups.get("5"), "5020", "Software Subscriptions Expense", "EXPENSE"),
                account(tenantId, groups.get("5"), "5030", "Office Supplies Expense", "EXPENSE")
        );
        ledgerAccountRepository.saveAll(accounts);

        Map<String, LedgerAccountEntity> byCode = new HashMap<>();
        for (LedgerAccountEntity account : accounts) {
            byCode.put(account.getCode(), account);
        }
        return byCode;
    }

    private LedgerAccountEntity account(UUID tenantId, AccountGroupEntity group, String code, String name, String type) {
        return new LedgerAccountEntity(UUID.randomUUID(), tenantId, group.getId(), name, code, type);
    }

    private void createFinancialPeriods(UUID tenantId) {
        LocalDate now = LocalDate.now();
        financialPeriodRepository.saveAll(List.of(
                new FinancialPeriodEntity(UUID.randomUUID(), tenantId, now.minusMonths(1).getYear(), now.minusMonths(1).getMonthValue(), "CLOSED"),
                new FinancialPeriodEntity(UUID.randomUUID(), tenantId, now.getYear(), now.getMonthValue(), "OPEN"),
                new FinancialPeriodEntity(UUID.randomUUID(), tenantId, now.plusMonths(1).getYear(), now.plusMonths(1).getMonthValue(), "OPEN")
        ));
    }

    private void createJournalEntries(UUID tenantId, Map<String, LedgerAccountEntity> accounts) {
        LocalDate baseDate = LocalDate.now().minusDays(25);
        journalEntryRepository.saveAll(List.of(
                journalEntry(tenantId, "DEMO-0001", baseDate, "Owner capital contribution", "USD",
                        line(accounts.get("1010"), new BigDecimal("25000.0000"), LineType.DEBIT),
                        line(accounts.get("3010"), new BigDecimal("25000.0000"), LineType.CREDIT)),
                journalEntry(tenantId, "DEMO-0002", baseDate.plusDays(3), "Monthly cloud infrastructure invoice", "USD",
                        line(accounts.get("5010"), new BigDecimal("820.0000"), LineType.DEBIT),
                        line(accounts.get("2010"), new BigDecimal("820.0000"), LineType.CREDIT)),
                journalEntry(tenantId, "DEMO-0003", baseDate.plusDays(8), "Professional services invoice issued to client", "USD",
                        line(accounts.get("1210"), new BigDecimal("6400.0000"), LineType.DEBIT),
                        line(accounts.get("4010"), new BigDecimal("6400.0000"), LineType.CREDIT)),
                journalEntry(tenantId, "DEMO-0004", baseDate.plusDays(12), "Client payment received", "USD",
                        line(accounts.get("1010"), new BigDecimal("6400.0000"), LineType.DEBIT),
                        line(accounts.get("1210"), new BigDecimal("6400.0000"), LineType.CREDIT)),
                journalEntry(tenantId, "DEMO-0005", baseDate.plusDays(17), "Annual software subscription paid", "USD",
                        line(accounts.get("5020"), new BigDecimal("1200.0000"), LineType.DEBIT),
                        line(accounts.get("1010"), new BigDecimal("1200.0000"), LineType.CREDIT)),
                journalEntry(tenantId, "DEMO-0006", baseDate.plusDays(21), "Implementation milestone recognized", "USD",
                        line(accounts.get("1210"), new BigDecimal("9800.0000"), LineType.DEBIT),
                        line(accounts.get("4020"), new BigDecimal("9800.0000"), LineType.CREDIT))
        ));
    }

    private JournalEntryEntity journalEntry(UUID tenantId,
                                            String entryNumber,
                                            LocalDate date,
                                            String description,
                                            String currency,
                                            JournalLineDraft... lineDrafts) {
        JournalEntryEntity entry = new JournalEntryEntity(UUID.randomUUID(), tenantId, entryNumber, date, description, currency);
        for (JournalLineDraft draft : lineDrafts) {
            JournalLineEntity line = new JournalLineEntity(
                    UUID.randomUUID(),
                    tenantId,
                    entry,
                    draft.account().getId(),
                    draft.amount(),
                    draft.type(),
                    null
            );
            entry.getLines().add(line);
        }
        return entry;
    }

    private JournalLineDraft line(LedgerAccountEntity account, BigDecimal amount, LineType type) {
        return new JournalLineDraft(account, amount, type);
    }

    private void createNotifications(UUID tenantId) {
        NotificationEntity notification = new NotificationEntity();
        notification.setId(UUID.randomUUID());
        notification.setTenantId(tenantId);
        notification.setTitle("Demo environment ready");
        notification.setMessage("This sandbox contains realistic accounting data and expires automatically in 2 hours.");
        notification.setTargetRole("SUPER_ADMIN");
        notificationRepository.save(notification);
    }

    private record JournalLineDraft(LedgerAccountEntity account, BigDecimal amount, LineType type) {
    }
}
