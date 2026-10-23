package com.travelsmart.repository;

import com.travelsmart.entity.Schedule;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    @Query("SELECT s FROM Schedule s " +
           "JOIN FETCH s.route r " +
           "JOIN FETCH r.sourceCity sc " +
           "JOIN FETCH r.destinationCity dc " +
           "JOIN FETCH s.transport t " +
           "WHERE sc.cityId = :sourceId AND dc.cityId = :destId " +
           "AND s.scheduleStatus = 'SCHEDULED' " +
           "AND s.availableSeats >= :passengers")
    List<Schedule> findAvailableSchedules(@Param("sourceId") Long sourceId,
                                          @Param("destId") Long destId,
                                          @Param("passengers") int passengers);

    @Query("SELECT s FROM Schedule s " +
           "JOIN FETCH s.route r " +
           "JOIN FETCH r.sourceCity sc " +
           "JOIN FETCH r.destinationCity dc " +
           "JOIN FETCH s.transport t " +
           "WHERE sc.cityId = :sourceId AND dc.cityId = :destId " +
           "AND t.transportType = :type " +
           "AND s.scheduleStatus = 'SCHEDULED' " +
           "AND s.availableSeats >= :passengers")
    List<Schedule> findAvailableSchedulesByType(@Param("sourceId") Long sourceId,
                                                @Param("destId") Long destId,
                                                @Param("type") String type,
                                                @Param("passengers") int passengers);

    @Query("SELECT s FROM Schedule s " +
           "JOIN FETCH s.route r " +
           "JOIN FETCH r.sourceCity sc " +
           "JOIN FETCH r.destinationCity dc " +
           "JOIN FETCH s.transport t " +
           "WHERE sc.cityId = :sourceId AND dc.cityId = :destId " +
           "AND s.scheduleStatus = 'SCHEDULED'")
    List<Schedule> findBySourceAndDestination(@Param("sourceId") Long sourceId, @Param("destId") Long destId);

    @Query("SELECT s FROM Schedule s " +
           "JOIN FETCH s.route r " +
           "JOIN FETCH r.sourceCity sc " +
           "JOIN FETCH r.destinationCity dc " +
           "JOIN FETCH s.transport t " +
           "WHERE sc.cityId = :sourceId AND dc.cityId = :destId " +
           "AND t.transportType = :type " +
           "AND s.scheduleStatus = 'SCHEDULED'")
    List<Schedule> findBySourceAndDestinationAndType(@Param("sourceId") Long sourceId, @Param("destId") Long destId, @Param("type") String type);

    @Query("SELECT s FROM Schedule s " +
           "JOIN FETCH s.route r " +
           "JOIN FETCH r.sourceCity sc " +
           "JOIN FETCH r.destinationCity dc " +
           "JOIN FETCH s.transport t " +
           "WHERE sc.cityId = :sourceId AND dc.cityId = :destId " +
           "AND s.departureDatetime >= :start AND s.departureDatetime <= :end " +
           "AND s.scheduleStatus = 'SCHEDULED'")
    List<Schedule> findBySourceAndDestinationAndDateRange(@Param("sourceId") Long sourceId, @Param("destId") Long destId,
                                                          @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s FROM Schedule s " +
           "JOIN FETCH s.transport t " +
           "WHERE t.transportType = :type AND s.scheduleStatus = 'SCHEDULED'")
    List<Schedule> findByTransportType(@Param("type") String type);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Schedule s WHERE s.scheduleId = :id")
    Optional<Schedule> findByIdForUpdate(@Param("id") Long id);
}

