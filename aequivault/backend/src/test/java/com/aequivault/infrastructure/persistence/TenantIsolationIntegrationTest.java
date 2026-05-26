package com.aequivault.infrastructure.persistence;

import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataAccountGroupRepository;
import com.aequivault.infrastructure.persistence.repository.TenantRepository;
import com.aequivault.infrastructure.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TenantIsolationIntegrationTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SpringDataAccountGroupRepository accountGroupRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    private UUID tenantAId;
    private UUID tenantBId;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        tenantAId = UUID.randomUUID();
        tenantBId = UUID.randomUUID();

        // 1. Guardar inquilinos de prueba (la tabla tenants no tiene RLS, por lo que se ejecuta sin contexto)
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.save(new TenantEntity(tenantAId, "Tenant A"));
            tenantRepository.save(new TenantEntity(tenantBId, "Tenant B"));
        });
    }

    @AfterEach
    void tearDown() {
        // 1. Limpiar registros de Tenant A bajo su propio contexto RLS
        TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.deleteAll();
        });

        // 2. Limpiar registros de Tenant B bajo su propio contexto RLS
        TenantContext.setTenantId(tenantBId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.deleteAll();
        });

        // 3. Limpiar los inquilinos (la tabla tenants no tiene RLS, por lo que se ejecuta sin inquilino)
        TenantContext.clear();
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.deleteById(tenantAId);
            tenantRepository.deleteById(tenantBId);
        });
    }

    @Test
    void shouldIsolateTenantDataAtPhysicalDatabaseLevel() {
        // 2. Seteamos el contexto del Tenant A e insertamos un grupo de cuentas
        TenantContext.setTenantId(tenantAId.toString());
        UUID groupAId = UUID.randomUUID();
        
        transactionTemplate.executeWithoutResult(status -> {
            AccountGroupEntity groupA = new AccountGroupEntity(groupAId, tenantAId, "Activo", "1", "1");
            accountGroupRepository.save(groupA);
        });
        TenantContext.clear(); // Limpiamos el hilo

        // 3. Seteamos el contexto del Tenant B e intentamos buscar los grupos de cuentas
        // RLS físicamente debe ocultar el registro del Tenant A y devolver lista vacía.
        TenantContext.setTenantId(tenantBId.toString());
        List<AccountGroupEntity> resultForB = transactionTemplate.execute(status -> 
            accountGroupRepository.findAll()
        );
        
        assertNotNull(resultForB);
        assertTrue(resultForB.isEmpty(), "Tenant B no debe tener visibilidad sobre los registros del Tenant A");
        TenantContext.clear(); // Limpiamos el hilo

        // 4. Seteamos el contexto del Tenant A e intentamos recuperar su propio registro
        TenantContext.setTenantId(tenantAId.toString());
        List<AccountGroupEntity> resultForA = transactionTemplate.execute(status -> 
            accountGroupRepository.findAll()
        );

        assertNotNull(resultForA);
        assertEquals(1, resultForA.size(), "Tenant A debe recuperar sus propios registros");
        assertEquals(groupAId, resultForA.get(0).getId());
        TenantContext.clear(); // Limpiamos el hilo
    }
}
