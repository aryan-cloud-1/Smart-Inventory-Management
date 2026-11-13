package com.smartinventory.service;

import com.smartinventory.entity.AuditLog;
import com.smartinventory.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void recordAction(String entityName, String entityId, String action, String actorUsername, String ipAddress, String details) {
        try {
            AuditLog logEntry = AuditLog.builder()
                    .entityName(entityName)
                    .entityId(entityId)
                    .action(action)
                    .actorUsername(actorUsername != null ? actorUsername : "system")
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .details(details)
                    .build();
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to persist audit log entry: {}", e.getMessage());
        }
    }
}
