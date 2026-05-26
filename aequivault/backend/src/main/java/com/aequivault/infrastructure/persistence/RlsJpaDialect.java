package com.aequivault.infrastructure.persistence;

import com.aequivault.infrastructure.security.TenantContext;
import jakarta.persistence.EntityManager;
import org.hibernate.Session;
import org.springframework.orm.jpa.vendor.HibernateJpaDialect;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionException;
import java.sql.SQLException;
import java.sql.Statement;

public class RlsJpaDialect extends HibernateJpaDialect {

    @Override
    public Object beginTransaction(EntityManager entityManager, TransactionDefinition definition)
            throws SQLException, TransactionException {
        Object transactionData = super.beginTransaction(entityManager, definition);

        String tenantId = TenantContext.getTenantId();
        if (tenantId != null && !tenantId.isBlank()) {
            Session session = entityManager.unwrap(Session.class);
            session.doWork(connection -> {
                try (Statement stmt = connection.createStatement()) {
                    stmt.execute("SET LOCAL app.current_tenant = '" + sanitizeTenantId(tenantId) + "'");
                }
            });
        }
        return transactionData;
    }

    private String sanitizeTenantId(String tenantId) {
        // Validar estricto formato UUID para prevenir Inyección SQL en comandos de sesión nativos
        try {
            java.util.UUID.fromString(tenantId);
            return tenantId;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Tenant ID format. Must be a valid UUID.");
        }
    }
}
