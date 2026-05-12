package com.haui.techstore.repository;

import com.haui.techstore.entity.SystemLogs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemLogsRepository extends JpaRepository<SystemLogs, Long> {
    Page<SystemLogs> findByUserId(Long userId, Pageable pageable);

    Page<SystemLogs> findByTargetTable(String targetTable, Pageable pageable);

    @Query("SELECT sl FROM SystemLogs sl WHERE sl.targetId = :targetId")
    Page<SystemLogs> findByTargetId(@Param("targetId") Long targetId, Pageable pageable);
}
