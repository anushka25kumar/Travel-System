package com.travelsmart.repository;

import com.travelsmart.entity.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransportRepository extends JpaRepository<Transport, Long> {
    List<Transport> findByTransportType(String transportType);
    List<Transport> findByOperatorNameContainingIgnoreCase(String operatorName);
}
