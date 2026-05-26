package com.aequivault.infrastructure.persistence;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.jpa.JpaTransactionManager;

@Configuration
public class JpaConfig {


    @Bean(name = "transactionManager")
    @Primary
    public JpaTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        JpaTransactionManager transactionManager = new JpaTransactionManager() {
            private final RlsJpaDialect rlsJpaDialect = new RlsJpaDialect();

            @Override
            public org.springframework.orm.jpa.JpaDialect getJpaDialect() {
                return this.rlsJpaDialect;
            }

            @Override
            public void setJpaDialect(org.springframework.orm.jpa.JpaDialect jpaDialect) {
                if (jpaDialect instanceof RlsJpaDialect) {
                    super.setJpaDialect(jpaDialect);
                }
            }
        };
        transactionManager.setEntityManagerFactory(entityManagerFactory);
        transactionManager.setJpaDialect(new RlsJpaDialect());
        return transactionManager;
    }
}
