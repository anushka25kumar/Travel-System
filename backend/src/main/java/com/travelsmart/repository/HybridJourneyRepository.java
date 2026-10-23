package com.travelsmart.repository;

import com.travelsmart.entity.HybridJourney;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HybridJourneyRepository extends JpaRepository<HybridJourney, Long> {
    List<HybridJourney> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    List<HybridJourney> findBySourceCity_CityIdAndDestinationCity_CityId(Long sourceCityId, Long destinationCityId);
}
