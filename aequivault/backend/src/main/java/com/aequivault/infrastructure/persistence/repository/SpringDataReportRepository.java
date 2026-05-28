package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.JournalEntryEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SpringDataReportRepository extends Repository<JournalEntryEntity, UUID> {
    
    @Query(value = "SELECT " +
            "    ag.code AS groupCode, " +
            "    ag.name AS groupName, " +
            "    la.code AS accountCode, " +
            "    la.name AS accountName, " +
            "    SUM(CASE WHEN jl.type = 'DEBIT' THEN jl.amount ELSE 0 END) AS totalDebit, " +
            "    SUM(CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE 0 END) AS totalCredit " +
            "FROM journal_lines jl " +
            "INNER JOIN journal_entries je ON jl.entry_id = je.id " +
            "INNER JOIN ledger_accounts la ON jl.ledger_account_id = la.id " +
            "INNER JOIN account_groups ag ON la.group_id = ag.id " +
            "WHERE je.date BETWEEN :startDate AND :endDate " +
            "GROUP BY ag.code, ag.name, la.code, la.name " +
            "ORDER BY ag.code, la.code", nativeQuery = true)
    List<TrialBalanceProjection> getTrialBalance(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = "SELECT COALESCE(SUM(" +
            "    CASE " +
            "        WHEN la.type IN ('ASSET', 'EXPENSE') THEN " +
            "            CASE WHEN jl.type = 'DEBIT' THEN jl.amount ELSE -jl.amount END " +
            "        ELSE " +
            "            CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE -jl.amount END " +
            "    END" +
            "), 0) " +
            "FROM journal_lines jl " +
            "INNER JOIN journal_entries je ON jl.entry_id = je.id " +
            "INNER JOIN ledger_accounts la ON jl.ledger_account_id = la.id " +
            "INNER JOIN account_groups ag ON la.group_id = ag.id " +
            "WHERE ag.path <@ CAST(:rootPath AS ltree)", nativeQuery = true)
    BigDecimal getNetBalanceForGroupPath(@Param("rootPath") String rootPath);

    @Query(value = "WITH date_series AS (" +
            "    SELECT generate_series(" +
            "        CAST(:startDate AS date)," +
            "        CAST(:endDate AS date)," +
            "        INTERVAL '1 day'" +
            "    )::date AS report_date" +
            ")," +
            "initial_balance AS (" +
            "    SELECT COALESCE(SUM(" +
            "        CASE " +
            "            WHEN la.type IN ('ASSET', 'EXPENSE') THEN " +
            "                CASE WHEN jl.type = 'DEBIT' THEN jl.amount ELSE -jl.amount END " +
            "            ELSE " +
            "                CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE -jl.amount END " +
            "        END" +
            "    ), 0) AS value " +
            "    FROM journal_lines jl " +
            "    INNER JOIN journal_entries je ON jl.entry_id = je.id " +
            "    INNER JOIN ledger_accounts la ON jl.ledger_account_id = la.id " +
            "    WHERE la.id = :accountId " +
            "      AND je.date < :startDate" +
            ")," +
            "daily_changes AS (" +
            "    SELECT " +
            "        je.date AS change_date, " +
            "        SUM(" +
            "            CASE " +
            "                WHEN la.type IN ('ASSET', 'EXPENSE') THEN " +
            "                    CASE WHEN jl.type = 'DEBIT' THEN jl.amount ELSE -jl.amount END " +
            "                ELSE " +
            "                    CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE -jl.amount END " +
            "            END" +
            "        ) AS net_change " +
            "    FROM journal_lines jl " +
            "    INNER JOIN journal_entries je ON jl.entry_id = je.id " +
            "    INNER JOIN ledger_accounts la ON jl.ledger_account_id = la.id " +
            "    WHERE la.id = :accountId " +
            "      AND je.date BETWEEN :startDate AND :endDate " +
            "    GROUP BY je.date" +
            ")" +
            "SELECT " +
            "    ds.report_date AS date, " +
            "    (SELECT value FROM initial_balance) + " +
            "    COALESCE(" +
            "        SUM(COALESCE(dc.net_change, 0)) OVER (ORDER BY ds.report_date), " +
            "        0" +
            "    ) AS balance " +
            "FROM date_series ds " +
            "LEFT JOIN daily_changes dc ON ds.report_date = dc.change_date " +
            "ORDER BY ds.report_date", nativeQuery = true)
    List<DailyBalanceProjection> getDailyBalances(
            @Param("accountId") UUID accountId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = "WITH initial_balance AS (" +
            "    SELECT COALESCE(SUM(" +
            "        CASE " +
            "            WHEN la.type IN ('ASSET', 'EXPENSE') THEN " +
            "                CASE WHEN jl.type = 'DEBIT' THEN jl.amount ELSE -jl.amount END " +
            "            ELSE " +
            "                CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE -jl.amount END " +
            "        END" +
            "    ), 0) AS value " +
            "    FROM journal_lines jl " +
            "    INNER JOIN journal_entries je ON jl.entry_id = je.id " +
            "    INNER JOIN ledger_accounts la ON jl.ledger_account_id = la.id " +
            "    WHERE la.id = :accountId " +
            "      AND je.date < :startDate" +
            ")," +
            "ledger_lines AS (" +
            "    SELECT " +
            "        je.date AS entry_date, " +
            "        je.id AS entry_id, " +
            "        je.entry_number AS entry_number, " +
            "        je.description AS entry_description, " +
            "        jl.id AS line_id, " +
            "        CASE WHEN jl.type = 'DEBIT' THEN jl.amount ELSE 0 END AS debit, " +
            "        CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE 0 END AS credit, " +
            "        CASE " +
            "            WHEN la.type IN ('ASSET', 'EXPENSE') THEN " +
            "                CASE WHEN jl.type = 'DEBIT' THEN jl.amount ELSE -jl.amount END " +
            "            ELSE " +
            "                CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE -jl.amount END " +
            "        END AS net_change, " +
            "        je.created_at AS entry_created_at " +
            "    FROM journal_lines jl " +
            "    INNER JOIN journal_entries je ON jl.entry_id = je.id " +
            "    INNER JOIN ledger_accounts la ON jl.ledger_account_id = la.id " +
            "    WHERE la.id = :accountId " +
            "      AND je.date BETWEEN :startDate AND :endDate" +
            ")" +
            "SELECT " +
            "    ll.entry_date AS date, " +
            "    ll.entry_id AS entryId, " +
            "    ll.entry_number AS entryNumber, " +
            "    ll.entry_description AS description, " +
            "    ll.debit AS debit, " +
            "    ll.credit AS credit, " +
            "    (SELECT value FROM initial_balance) + " +
            "    SUM(ll.net_change) OVER (" +
            "        ORDER BY ll.entry_date, ll.entry_created_at, ll.line_id" +
            "    ) AS runningBalance " +
            "FROM ledger_lines ll " +
            "ORDER BY ll.entry_date, ll.entry_created_at, ll.line_id", nativeQuery = true)
    List<LedgerLineProjection> getLedgerLines(
            @Param("accountId") UUID accountId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = "SELECT COALESCE(SUM(" +
            "    CASE " +
            "        WHEN la.type IN ('ASSET', 'EXPENSE') THEN " +
            "            CASE WHEN jl.type = 'DEBIT' THEN jl.amount ELSE -jl.amount END " +
            "        ELSE " +
            "            CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE -jl.amount END " +
            "    END" +
            "), 0) " +
            "FROM journal_lines jl " +
            "INNER JOIN journal_entries je ON jl.entry_id = je.id " +
            "INNER JOIN ledger_accounts la ON jl.ledger_account_id = la.id " +
            "WHERE la.id = :accountId " +
            "  AND je.date < :startDate", nativeQuery = true)
    BigDecimal getInitialBalance(
            @Param("accountId") UUID accountId,
            @Param("startDate") LocalDate startDate
    );
}

