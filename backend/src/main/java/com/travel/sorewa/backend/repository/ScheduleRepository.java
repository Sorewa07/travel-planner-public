package com.travel.sorewa.backend.repository;

import com.travel.sorewa.backend.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // 【仕様書用】特定の旅行（travel_id）に紐づくタイムスケジュール一覧を、日付と開始時刻の順に綺麗に並べて取得するメソッドです
    List<Schedule> findByTravel_TravelIdOrderByDateAscStartTimeAsc(Long travelId);
}
