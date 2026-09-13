package com.travel.sorewa.backend.controller;

import com.travel.sorewa.backend.entity.Schedule;
import com.travel.sorewa.backend.entity.Travel;
import com.travel.sorewa.backend.entity.User;
import com.travel.sorewa.backend.service.ScheduleService;
import com.travel.sorewa.backend.repository.TravelRepository;
import com.travel.sorewa.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "*", allowedHeaders = "*") // Reactからのアクセスを許可
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final TravelRepository travelRepository;
    private final UserRepository userRepository;

    public ScheduleController(ScheduleService scheduleService, TravelRepository travelRepository, UserRepository userRepository) {
        this.scheduleService = scheduleService;
        this.travelRepository = travelRepository;
        this.userRepository = userRepository;
    }

    /**
     * タイムスケジュール一覧取得API (仕様書：200で一覧を返す)
     * URL: GET /api/schedule?travelId=1
     */
    @GetMapping
    public ResponseEntity<List<Schedule>> getScheduleList(@RequestParam Long travelId) {
        List<Schedule> list = scheduleService.getScheduleList(travelId);
        return ResponseEntity.ok(list);
    }

    /**
     * タイムスケジュール登録API (仕様書：201を返す / 入力不備は400)
     */
    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody Map<String, Object> requestBody) {
        try {
            Long travelId = Long.valueOf(requestBody.get("travelId").toString());
            String userId = (String) requestBody.get("userId"); // 最終編集者
            LocalDate date = LocalDate.parse((String) requestBody.get("date"));
            LocalTime startTime = LocalTime.parse((String) requestBody.get("startTime"));
            LocalTime endTime = LocalTime.parse((String) requestBody.get("endTime"));
            String plan = (String) requestBody.get("plan");

            // 🎯 修正③：Aivenのデータ整合性チェックをクリアするため、本物のオブジェクトをロードします
            Optional<Travel> travelOpt = travelRepository.findById(travelId);
            Optional<User> userOpt = userRepository.findById(userId);

            if (!travelOpt.isPresent() || !userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("status", "error", "message", "指定された旅行先またはユーザーが存在しません"));
            }

            // 🎯 修正④：既存のロジックでインスタンスを作った後、本物のオブジェクト構造をガチッとはめ込みます
            Schedule schedule = scheduleService.createSchedule(travelId, userId, date, startTime, endTime, plan);
            schedule.setTravel(travelOpt.get()); // 👈 ここが超重要！
            schedule.setUser(userOpt.get());     // 👈 ここが超重要！

            // 💡 最後に、リレーションが完璧に繋がった状態でデータベースへ確定保存をかけます
            // ※もしService側の更新メソッド名が異なる場合は、ご自身の使い慣れた保存処理（save等）に変えてください
            scheduleService.updateSchedule(schedule.getScheduleId(), userId, date, startTime, endTime, plan);

            return ResponseEntity.status(HttpStatus.CREATED).body(schedule);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "タイムスケジュールの登録に失敗しました"));
        }
    }

    /**
     * タイムスケジュール更新API (仕様書：200を返す / 対象なしは404 / 不備は400)
     * タイムスケジュール更新API (★エラー回避のため、確実なif文の形に修正しました)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id, @RequestBody Map<String, Object> requestBody) {
        try {
            String userId = (String) requestBody.get("userId"); // 最終編集者
            LocalDate date = LocalDate.parse((String) requestBody.get("date"));
            LocalTime startTime = LocalTime.parse((String) requestBody.get("startTime"));
            LocalTime endTime = LocalTime.parse((String) requestBody.get("endTime"));
            String plan = (String) requestBody.get("plan");

            Optional<Schedule> updatedOpt = scheduleService.updateSchedule(id, userId, date, startTime, endTime, plan);

            if (updatedOpt.isPresent()) {
                return ResponseEntity.ok(updatedOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", "error", "message", "対象のスケジュールが見つかりません"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "入力不備があります"));
        }
    }

    /**
     * 持ち物管理API (仕様書：200を返す / PUT /api/schedule/{id}/items)
     * 持ち物管理API (★エラー回避のため、確実なif文の形に修正しました)
     */
    @PutMapping("/{id}/items")
    public ResponseEntity<?> updateItems(@PathVariable Long id, @RequestBody Map<String, String> requestBody) {
        String userId = requestBody.get("userId"); // 最終編集者
        String items = requestBody.get("items");

        Optional<Schedule> updatedOpt = scheduleService.updateItems(id, userId, items);

        if (updatedOpt.isPresent()) {
            return ResponseEntity.ok(updatedOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "対象のスケジュールが見つかりません"));
        }
    }

    /**
     * 予算管理API (仕様書：200を返す / PUT /api/schedule/{id}/budget)
     * 予算管理API (★エラー回避のため、確実なif文の形に修正しました)
     */
    @PutMapping("/{id}/budget")
    public ResponseEntity<?> updateBudget(@PathVariable Long id, @RequestBody Map<String, Object> requestBody) {
        try {
            String userId = (String) requestBody.get("userId");
            Integer budget = Integer.valueOf(requestBody.get("budget").toString());

            Optional<Schedule> updatedOpt = scheduleService.updateBudget(id, userId, budget);

            if (updatedOpt.isPresent()) {
                return ResponseEntity.ok(updatedOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", "error", "message", "対象のスケジュールが見つかりません"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "入力不備があります"));
        }
    }

    /**
     * タイムスケジュール削除API (仕様書：200を返す / 対象なしは404)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        boolean success = scheduleService.deleteSchedule(id);
        if (success) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "削除が完了しました"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "対象のスケジュールが見つかりません"));
        }
    }
}
