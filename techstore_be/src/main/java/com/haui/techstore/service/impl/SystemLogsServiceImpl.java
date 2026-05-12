package com.haui.techstore.service.impl;

import com.haui.techstore.dto.SystemLogsDTO;
import com.haui.techstore.entity.SystemLogs;
import com.haui.techstore.entity.User;
import com.haui.techstore.exception.ResourceNotFoundException;
import com.haui.techstore.mapper.SystemLogsMapper;
import com.haui.techstore.repository.SystemLogsRepository;
import com.haui.techstore.repository.UserRepository;
import com.haui.techstore.service.SystemLogsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class SystemLogsServiceImpl implements SystemLogsService {

    private final SystemLogsRepository systemLogsRepository;
    private final UserRepository userRepository;
    private final SystemLogsMapper systemLogsMapper;

    @Override
    public void saveLog(Long userId, String action, String targetTable, Long targetId, String oldValue,
            String newValue) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        SystemLogs log = new SystemLogs();
        log.setUser(user);
        log.setAction(action);
        log.setTargetTable(targetTable);
        log.setTargetId(targetId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);

        systemLogsRepository.save(log);
    }

    @Override
    public void saveLog(Long userId, String action, String targetTable, Long targetId) {
        saveLog(userId, action, targetTable, targetId, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SystemLogsDTO> getAllLogs(Pageable pageable) {
        return systemLogsRepository.findAll(pageable)
                .map(systemLogsMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SystemLogsDTO> getLogsByUserId(Long userId, Pageable pageable) {
        return systemLogsRepository.findByUserId(userId, pageable)
                .map(systemLogsMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SystemLogsDTO> getLogsByTargetTable(String targetTable, Pageable pageable) {
        return systemLogsRepository.findByTargetTable(targetTable, pageable)
                .map(systemLogsMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SystemLogsDTO> getLogsByTargetId(Long targetId, Pageable pageable) {
        return systemLogsRepository.findByTargetId(targetId, pageable)
                .map(systemLogsMapper::toDTO);
    }
}
