package com.aequivault.infrastructure.persistence;

import com.aequivault.domain.event.AccountGroupCreatedEvent;
import com.aequivault.domain.event.JournalEntryCreatedEvent;
import com.aequivault.infrastructure.persistence.entity.NotificationEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataNotificationRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class NotificationEventListener {

    private final SpringDataNotificationRepository notificationRepository;

    public NotificationEventListener(SpringDataNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @EventListener
    @Transactional
    public void handleJournalEntryCreated(JournalEntryCreatedEvent event) {
        NotificationEntity notification = new NotificationEntity();
        notification.setId(UUID.randomUUID());
        notification.setTenantId(event.tenantId());
        notification.setTitle("Nuevo Asiento Registrado");
        notification.setMessage(String.format("Se ha registrado el asiento número %s: %s", 
            event.entryNumber() != null ? event.entryNumber() : "N/A", 
            event.description()));
        notification.setTargetRole("SUPER_ADMIN");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }

    @EventListener
    @Transactional
    public void handleAccountGroupCreated(AccountGroupCreatedEvent event) {
        NotificationEntity notification = new NotificationEntity();
        notification.setId(UUID.randomUUID());
        notification.setTenantId(event.tenantId());
        notification.setTitle("Nueva Cuenta Creada");
        notification.setMessage(String.format("Se ha creado el grupo de cuentas: %s (%s)", event.name(), event.code()));
        notification.setTargetRole("SUPER_ADMIN");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }
}
