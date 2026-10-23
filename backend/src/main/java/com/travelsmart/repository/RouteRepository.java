package com.travelsmart.repository;

import com.travelsmart.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findBySourceCity_CityIdAndDestinationCity_CityId(Long sourceCityId, Long destinationCityId);
    List<Route> findBySourceCity_CityNameIgnoreCaseAndDestinationCity_CityNameIgnoreCase(String sourceCity, String destinationCity);
    List<Route> findBySourceCity_CityId(Long sourceCityId);
}
