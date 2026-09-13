package com.travel.sorewa.backend.service;

import com.travel.sorewa.backend.entity.Schedule;
import com.travel.sorewa.backend.entity.Travel;
import com.travel.sorewa.backend.entity.User;
import com.travel.sorewa.backend.repository.ScheduleRepository;
import com.travel.sorewa.backend.repository.TravelRepository;
import com.travel.sorewa.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final TravelRepository travelRepository;
    private final UserRepository userRepository;

    public ScheduleService(ScheduleRepository scheduleRepository, TravelRepository travelRepository, UserRepository userRepository) {
        this.scheduleRepository = scheduleRepository;
        this.travelRepository = travelRepository;
        this.userRepository = userRepository;
    }

    // 1. 一覧取得：特定の旅行に紐づく予定を日付・時刻順で取得
    public List<Schedule> getScheduleList(Long travelId) {
        return scheduleRepository.findByTravel_TravelIdOrderByDateAscStartTimeAsc(travelId);
    }

    // 2. 登録：新しい予定を追加
    public Schedule createSchedule(Long travelId, String userId, LocalDate date, LocalTime startTime, LocalTime endTime, String plan) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new IllegalArgumentException("指定された旅行先データが見つかりません"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("指定されたユーザーが存在しません"));

        Schedule schedule = new Schedule();
        schedule.setTravel(travel);
        schedule.setUser(user); // 最終編集者として登録
        schedule.setDate(date);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setPlan(plan);
        schedule.setBudget(0); // 初期値は0円

        return scheduleRepository.save(schedule);
    }

    // 3. 更新：基本情報の更新（最終編集者も上書きします）
    public Optional<Schedule> updateSchedule(Long scheduleId, String userId, LocalDate date, LocalTime startTime, LocalTime endTime, String plan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("指定されたユーザーが存在しません"));

        return scheduleRepository.findById(scheduleId).map(schedule -> {
            schedule.setUser(user); // 最終編集者を更新
            schedule.setDate(date);
            schedule.setStartTime(startTime);
            schedule.setEndTime(endTime);
            schedule.setPlan(plan);
            return scheduleRepository.save(schedule);
        });
    }

    // 4. 持ち物更新：持ち物管理API用
    public Optional<Schedule> updateItems(Long scheduleId, String userId, String items) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("指定されたユーザーが存在しません"));

        return scheduleRepository.findById(scheduleId).map(schedule -> {
            schedule.setUser(user);
            schedule.setItems(items);
            return scheduleRepository.save(schedule);
        });
    }

    // 5. 予算更新：予算管理API用
    public Optional<Schedule> updateBudget(Long scheduleId, String userId, Integer budget) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("指定されたユーザーが存在しません"));

        return scheduleRepository.findById(scheduleId).map(schedule -> {
            schedule.setUser(user);
            schedule.setBudget(budget);
            return scheduleRepository.save(schedule);
        });
    }

    // 6. 削除
    public boolean deleteSchedule(Long scheduleId) {
        if (scheduleRepository.existsById(scheduleId)) {
            scheduleRepository.deleteById(scheduleId);
            return true;
        }
        return false;
    }
}
