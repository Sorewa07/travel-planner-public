package com.travel.sorewa.backend.repository;

import com.travel.sorewa.backend.entity.Travel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TravelRepository extends JpaRepository<Travel, Long> {

    // 【仕様書用】ログインしている特定のユーザーの旅行一覧だけを、並び替え順（travel_id_sub）で取得する便利なメソッドです
    List<Travel> findByUser_UserIdOrderByTravelIdSubAsc(String userId);
}
