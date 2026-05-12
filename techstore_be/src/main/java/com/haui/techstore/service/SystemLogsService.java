package com.haui.techstore.service;

import com.haui.techstore.dto.SystemLogsDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for managing system logs
 * Records all important actions in the system for auditing purposes
 */
public interface SystemLogsService {

    /**
     * Save a log entry for user actions
     * 
     * @param userId      User ID who performed the action
     * @param action      Action name (e.g., CREATE, UPDATE, DELETE)
     * @param targetTable Target table name
     * @param targetId    Target record ID
     * @param oldValue    Previous value (for updates)
     * @param newValue    New value (for updates)
     */
    void saveLog(Long userId, String action, String targetTable, Long targetId, String oldValue, String newValue);

    /**
     * Save a log entry for user actions (without old/new values)
     * 
     * @param userId      User ID who performed the action
     * @param action      Action name
     * @param targetTable Target table name
     * @param targetId    Target record ID
     */
    void saveLog(Long userId, String action, String targetTable, Long targetId);

    /**
     * Get all logs with pagination
     */
    Page<SystemLogsDTO> getAllLogs(Pageable pageable);

    /**
     * Get logs for a specific user
     */
    Page<SystemLogsDTO> getLogsByUserId(Long userId, Pageable pageable);

    /**
     * Get logs for a specific table
     */
    Page<SystemLogsDTO> getLogsByTargetTable(String targetTable, Pageable pageable);

    /**
     * Get logs for a specific target record
     */
    Page<SystemLogsDTO> getLogsByTargetId(Long targetId, Pageable pageable);
}
