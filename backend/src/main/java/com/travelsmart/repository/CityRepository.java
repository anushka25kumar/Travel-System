package com.travelsmart.repository;

import com.travelsmart.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    Optional<City> findByCityNameIgnoreCase(String cityName);
    List<City> findByCityNameContainingIgnoreCaseOrderByCityNameAsc(String query);
    List<City> findAllByOrderByCityNameAsc();
}
